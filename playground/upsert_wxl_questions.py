from dotenv import load_dotenv
from collections import defaultdict
import json
import os
import pandas as pd
import pyreadstat
import requests
from supabase import create_client, Client


CATEGORY_TITLE_SEPARATOR = ":::"
DUP_QUESTION_SEPARATOR = "@@@"

# Load environment variables from .env
load_dotenv()

# Fetch variables
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

scriptpath = os.path.dirname(os.path.abspath(__file__))
question_index_file = os.path.join(scriptpath, "./question_index.xlsx")

stata_files_url_base = "https://socsci4.tau.ac.il/mu2/ines/wp-content/uploads/sites/4/2023/06/"
statas_folder = os.path.join(scriptpath, "..", "..", "src/assets/statas")
surveys_data_folder = os.path.join(scriptpath, "..", "..", "public/surveys_data")

supabase: Client = create_client(url, key)
questions: list[dict[str, str]] = []
question_instances: list[dict[str, str]] = []
survey_wxl_ids: list[str] = []

def download_file(url: str, output_folder: str) -> str:
    """
    Downloads a file from a given URL and saves it in the specified output folder.

    Args:
        url (str): The URL of the file to download.
        output_folder (str): The folder to save the downloaded file.

    Returns:
        str: The path to the downloaded file.
    """
    filename = os.path.basename(url)  # Extract the file name from the URL
    output_path = os.path.join(output_folder, filename)

    # If file was already downloaded - use it
    if os.path.exists(output_path) == True: return output_path

    print(f"Downloading {url}...")
    response = requests.get(url, stream=True)
    response.raise_for_status()  # Raise an error for HTTP issues

    with open(output_path, 'wb') as file:
        for chunk in response.iter_content(chunk_size=8192):
            file.write(chunk)

    print(f"Downloaded to {output_path}")
    return output_path

def parse_questions(question_index_file, wxl_data, survey_wxl_ids):
    """
    For each sheet in the excel - go over all rows (questions),
    Create a question row in the db,
    and for each column (survey) that is a survey id,
    If the [(row)X(column)] cell is not empty, add it as a question item to the survey.

    Return the question items by survey
    """
    # Iterate through each sheet in the Excel file
    for heb_category in wxl_data.sheet_names:
        # Load the current sheet
        category_data = pd.read_excel(question_index_file, sheet_name=heb_category)
        columns = category_data.columns

        # Iterate through each row in the sheet
        for _row_index, row in category_data.iterrows():
            heb_title: str = row.iloc[0]  # First column contains the hebrew question descriptions

            # Create the question object
            question = {
                "category": heb_category,
                "heb_title": heb_title,
                "id": f"{heb_category} {CATEGORY_TITLE_SEPARATOR} {heb_title}",
            }
            questions.append(question)

            # Process only relevant survey columns
            for [col, orig_col] in [
                [str(orig_col).strip(), orig_col] 
                for orig_col in columns 
                if str(orig_col).strip() in survey_wxl_ids
            ]:
                qid_s: str = row[orig_col]

                # Skip if the cell is empty (question not asked in this survey)
                if pd.isna(qid_s):
                    continue
                
                # Create the initial question instance object
                q_instance = {
                    "wxl_question_title": heb_title,
                    "qid_s": qid_s,
                    "wxl_survey": col,
                    "dta_description": None,
                    "dta_answers": None,
                }
                question_instances.append(q_instance)

def parse_dta(question_items_by_survey, stata_filename: str, survey_id: str):
    """
    Extracts english descriptions from a Stata file.
    Appends them to their question items.
    Exports survey data to CSV file.

    Args:
        question_items_by_survey: The question items, grouped by survey id, created in `create_question_items`
        stata_filename (str): The path for the input Stata (.dta) file.
        survey_id (str): The id of the survey that matches the Stata file
    """
    survey_question_items = question_items_by_survey[survey_id]
    survey_data_file = os.path.join(surveys_data_folder, f"{survey_id}.csv")
    
    # This df is not good, but the meta file is better parsed with pyreadstat
    df, meta = pyreadstat.read_dta(stata_filename, apply_value_formats=True)

    for question_survey_id, english_description in meta.column_names_to_labels.items():
        question_item = next((item for item in survey_question_items if item["questionSurveyId"] == question_survey_id), None)
        if (question_item != None): question_item["englishDescription"] = english_description

    df.to_csv(survey_data_file, index=False)
    
    print(f"Data exported to: {survey_data_file}")

    return survey_question_items

def find_duplicates(questions: list[dict[str, str]]) -> list[tuple[str, str]]:
    # title_count = defaultdict(list)
    dupes_list = defaultdict(list)

    for i, q in enumerate(questions):
        # title_count[q["heb_title"]].append(i)
        dupes_list[(q["category"], q["heb_title"])].append(i)

    duplicates = [k for k, v in dupes_list.items() if len(v) > 1]

    return duplicates

# For each duplicate question, find the previous question which has no duplicate, and prefix with that question's heb_title
def prefix_duplicates(questions: list[dict[str, str]], duplicates: list[tuple[str, str]]):
    """
    Prefixes duplicate questions with the previous non-duplicate question.
    """
    for i in range(len(questions) - 1, -1, -1):
        curr_i = i
        question = questions[curr_i]
        (category, heb_title) = (question["category"], question["heb_title"])
        (curr_category, curr_heb_title) = (category, heb_title)
        
        while (curr_category, curr_heb_title) in duplicates:
            # Get the current question index
            curr_i = curr_i - 1
            # Get the previous question
            curr_question = questions[curr_i]
            (curr_category, curr_heb_title) = (curr_question["category"], curr_question["heb_title"])
        
        if curr_i != i:
            # Prefix the duplicate question with the previous question's heb_title
            question["heb_title"] = f"{curr_question['heb_title']} {DUP_QUESTION_SEPARATOR} {question['heb_title']}"
            question["id"] = f"{curr_question['id']} {DUP_QUESTION_SEPARATOR} {question['heb_title']}"
            
    return questions

def save_questions(questions: list[dict[str, str]]):
    """
    Saves the questions to the database.
    """
    
    # Add the questions to the db
    response = (
        supabase.table("wxl_questions")
        .upsert(questions)
        .execute()
    )

    print(f"Attempted to insert {len(questions)} questions into the database.")
    print(f"Updated or Inserted {response.count} questions.")
    
    return questions

if __name__ == "__main__":
    os.makedirs(statas_folder, exist_ok=True)
    os.makedirs(surveys_data_folder, exist_ok=True)

    response = (
        supabase.table("surveys")
        .select("*")
        .execute()
    )
    surveys = response.data
    survey_wxl_ids = [entry["survey_wxl_id"] for entry in surveys if "id" in entry]

    # Load survey options and question index
    wxl_data = pd.ExcelFile(question_index_file)
    

    parse_questions(question_index_file, wxl_data, survey_wxl_ids)
    dupes = find_duplicates(questions)
    prefix_duplicates(questions, dupes)
    save_questions(questions)

    # # Iterate over all files in the folder
    # for survey in surveys:
    #     # Create survey stata url path and download if needed
    #     dta_url = os.path.join(stata_files_url_base, f"{survey['dta_survey_id']}.dta")
    #     wxl_survey_id = survey['wxl_survey_id']
    #     dta_file = download_file(dta_url, statas_folder)
        
    #     print(f"Processing dta file: {dta_file}")
    #     parse_dta(dta_file, wxl_survey_id)
    
    # TODO: Save to questions and q_instances in db