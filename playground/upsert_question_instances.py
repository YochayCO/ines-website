from dotenv import load_dotenv
from datetime import datetime
import os
import pandas as pd
import pyreadstat
import requests
from supabase import create_client, Client

from upsert_wxl_questions import create_questions


CATEGORY_TITLE_SEPARATOR = ":::"
DUP_QUESTION_SEPARATOR = "@@@"

# Load environment variables from .env
load_dotenv()

# Fetch variables
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

scriptpath = os.path.dirname(os.path.abspath(__file__))
question_index_file = os.path.join(scriptpath, "question_index.xlsx")

stata_files_url_base = "https://socsci4.tau.ac.il/mu2/ines/wp-content/uploads/sites/4/2023/06/"
statas_folder = os.path.join(scriptpath, "..", "..", "src/assets/statas")
surveys_data_folder = os.path.join(scriptpath, "..", "..", "public/surveys_data")

supabase: Client = create_client(url, key)
questions: list[dict[str, str]] = []
question_instances: list[dict[str, str]] = []
surveys: list[dict[str, str]] = []
missing_from_wxl: list[dict[str, str]] = []

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

def format_to_wxl_survey_name(column_name):
    if isinstance(column_name, datetime):
        return column_name.strftime('%b-%y')  # e.g., Sep-19
    else:
        return str(column_name).strip()

def parse_question_instances(surveys: list[dict[str, str]]):
    """
    For each sheet in the excel - go over all rows (questions),
    Create a question row in the db,
    and for each column (survey) that is a survey id,
    If the [(row)X(column)] cell is not empty, add it as a question item to the survey.

    Return the question items by survey
    """
    # Load survey options and question index
    wxl_data = pd.ExcelFile(question_index_file)
    
    q_index = 0
    survey_wxl_ids = [survey["wxl_survey_id"] for survey in surveys]

    # Iterate through each sheet in the Excel file
    for heb_category in wxl_data.sheet_names:
        # Load the current sheet
        category_data = pd.read_excel(question_index_file, sheet_name=heb_category)
        columns = category_data.columns

        # Iterate through each row in the sheet
        for _row_index, row in category_data.iterrows():
            question = questions[q_index]   
            q_index += 1 
        
            # Process only relevant survey columns
            for [wxl_survey_name, orig_col] in [
                [format_to_wxl_survey_name(orig_col), orig_col] 
                for orig_col in columns 
                if format_to_wxl_survey_name(orig_col) in survey_wxl_ids
            ]:
                qid_s: str = row[orig_col]

                # Skip if the cell is empty (question not asked in this survey)
                if pd.isna(qid_s) or qid_s.strip() == "":
                    continue
                
                # Create the initial question instance object
                q_instance = {
                    "category": heb_category,
                    "wxl_question_id": question["id"],
                    "qid_s": qid_s,
                    "wxl_survey": wxl_survey_name,
                    "dta_description": None,
                    "dta_answers": None,
                }
                question_instances.append(q_instance)

def enrich_q_instance_from_dta(survey: dict[str, str]):
    """
    Extracts english descriptions from a Stata file.
    Appends them to their question items.
    Exports survey data to CSV file.

    Args:
        question_items_by_survey: The question items, grouped by survey id, created in `create_question_items`
        stata_filename (str): The path for the input Stata (.dta) file.
        survey_id (str): The id of the survey that matches the Stata file
    """
    
    wxl_survey_id = survey['wxl_survey_id']
    dta_url = os.path.join(stata_files_url_base, f"{survey['dta_survey_id']}.dta")
    dta_file = download_file(dta_url, statas_folder)
    
    print(f"Processing dta file: {dta_file} for survey {wxl_survey_id}")
    
    # This df is not good, but the meta file is better parsed with pyreadstat
    _df, meta = pyreadstat.read_dta(dta_file, apply_value_formats=True)

    for qid_s in meta.column_names:
        question_instance = next((q_instance for q_instance in question_instances if q_instance["qid_s"] == qid_s and q_instance["wxl_survey"] == wxl_survey_id), None)
        
        if (question_instance == None):
            print(f"Question {qid_s} of survey {wxl_survey_id} not found in wxl data.")
            missing_from_wxl.append({
                "qid_s": qid_s,
                "wxl_survey": wxl_survey_id,
                "dta_description": meta.column_names_to_labels[qid_s] if qid_s in meta.column_names_to_labels else None,
                "dta_answers": meta.value_labels[qid_s] if qid_s in meta.value_labels else None,
            })
            continue

        question_instance["dta_description"] = meta.column_names_to_labels[qid_s] if qid_s in meta.column_names_to_labels else None
        question_instance["dta_answers"] = meta.value_labels[qid_s] if qid_s in meta.value_labels else None

def save_question_instances(unique_question_instances: list[dict[str, str]]):
    """
    Saves the question instances to the database.
    """
    
    # Add the question instances to the db
    response = (
        supabase.table("q_instances")
        .upsert(unique_question_instances)
        .execute()
    )

    print(f"Attempted to upsert {len(unique_question_instances)} question instances into the database.")

def find_duplicates_within_category(question_instances: list[dict[str, str]]) -> list[tuple[str, str, str]]:
    """
    Finds duplicate question instances based on the survey, question id, and category.
    """
    dupes_list = {}
    
    for i, qi in enumerate(question_instances):
        key = (qi["wxl_survey"], qi["qid_s"], qi["category"])
        if key not in dupes_list:
            dupes_list[key] = []
        dupes_list[key].append(qi)

    duplicates = [k for k, qi_group in dupes_list.items() if len(qi_group) > 1]

    return duplicates


def find_all_duplicates(question_instances: list[dict[str, str]]) -> list[tuple[str, str]]:
    """
    Finds duplicate question instances based on the survey and question id.
    """
    dupes_list = {}
    
    for i, qi in enumerate(question_instances):
        key = (qi["wxl_survey"], qi["qid_s"])
        if key not in dupes_list:
            dupes_list[key] = []
        dupes_list[key].append(qi)

    duplicates = [k for k, qi_group in dupes_list.items() if len(qi_group) > 1]

    return duplicates

def create_question_instances():
    os.makedirs(statas_folder, exist_ok=True)
    os.makedirs(surveys_data_folder, exist_ok=True)

    surveys_response = (
        supabase.table("surveys")
        .select("*")
        .execute()
    )
    
    surveys = surveys_response.data

    parse_question_instances(surveys)

    # Iterate over all files in the folder
    for survey in surveys:
        dta_url = None
        dta_file = None
        # Create survey stata url path and download if needed
        if survey['dta_survey_id'] == '' or survey['dta_survey_id'] == None:
            continue

        enrich_q_instance_from_dta(survey)
    
    return question_instances

def handle_mismatches():
    missing_df = pd.DataFrame(missing_from_wxl)
    missing_df.to_csv(os.path.join(scriptpath, "missing_questions.csv"), index=False)

    all_dups = find_all_duplicates(question_instances)
    hard_dups = find_duplicates_within_category(question_instances)
    
    # Save all duplicate question instances to a csv file
    dups_df = pd.DataFrame(all_dups, columns=["wxl_survey", "qid_s"])
    dups_df.to_csv(os.path.join(scriptpath, "duplicate_questions.csv"), index=False)

    # filter away the hard duplicates from the question instances
    non_dups_qis = [qi for qi in question_instances if (qi["wxl_survey"], qi["qid_s"], qi["category"]) not in hard_dups]
    return non_dups_qis

if __name__ == "__main__":
    questions = create_questions()
    question_instances = create_question_instances()

    # Save missing question instances to a csv file
    non_dups_qis = handle_mismatches()

    # Save question instances to the database
    save_question_instances(non_dups_qis)
