import json
import os
import pandas as pd
import pyreadstat
import requests

scriptpath = os.path.dirname(os.path.abspath(__file__))
survey_options_filename = os.path.join(scriptpath, "../../src/assets/surveyOptions.json")
question_index_file = os.path.join(scriptpath, "../../src/assets/question_index.xlsx")
question_items_folder = os.path.join(scriptpath, "../../public/question_items")

stata_files_url_base = "https://socsci4.tau.ac.il/mu2/ines/wp-content/uploads/sites/4/2023/06/"
statas_folder = os.path.join(scriptpath, "..", "..", "src/assets/statas")
surveys_data_folder = os.path.join(scriptpath, "..", "..", "public/surveys_data")

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

def create_question_items(question_index_file, excel_data, survey_options):
    """
    Create a question_items file for each survey (ids are unique).
    For each sheet in the excel - go over all rows (questions),
    and for each column (survey) that is a survey id,
    If the [(row)X(column)] cell is not empty, add it as a question item to the survey.

    Return the question items by survey
    """
    survey_ids = [entry["id"] for entry in survey_options if "id" in entry]

    # Initialize the questionItems dictionary
    question_items_by_survey = {survey_id: [] for survey_id in survey_ids}

    # Iterate through each sheet in the Excel file
    for sheet_name in excel_data.sheet_names:
        # Load the current sheet
        sheet_data = pd.read_excel(question_index_file, sheet_name=sheet_name)
        columns = sheet_data.columns

        # Determine the type based on the sheet name
        question_type = "demography" if sheet_name == "דמוגרפיה" else "category"

        # Iterate through each row in the sheet
        for row_index, row in sheet_data.iterrows():
            question_description = row.iloc[0]  # First column contains the question descriptions

            # Process only relevant survey columns
            for [col, orig_col] in [
                [str(orig_col).strip(), orig_col] 
                for orig_col in columns 
                if str(orig_col).strip() in survey_ids
            ]:
                question_survey_id = row[orig_col]

                # Skip if the cell is empty (question not asked in this survey)
                if pd.notna(question_survey_id):
                    # Create the questionItem object
                    question_item = {
                        "id": f"{row_index + 1}. {question_description}",  # id can also aid in sorting questions
                        "questionHebrewDescription": question_description,
                        "questionSurveyId": str(question_survey_id),  # Convert to string
                        "type": question_type,
                    }
                    question_items_by_survey[col].append(question_item)
    return question_items_by_survey

def append_english_descriptions(question_items_by_survey, stata_filename: str, survey_id: str):
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

def clean_question_items(question_items_by_survey):
    """
    Removes all question items without an English description.
    """
    for survey_id, question_items in question_items_by_survey.items():
        question_items_by_survey[survey_id] = [
            item for item in question_items if "englishDescription" in item
        ]

if __name__ == "__main__":
    os.makedirs(question_items_folder, exist_ok=True)
    os.makedirs(statas_folder, exist_ok=True)
    os.makedirs(surveys_data_folder, exist_ok=True)

    excel_data = pd.ExcelFile(question_index_file)
    
    # Load survey options json
    with open(survey_options_filename, "r") as file:
        survey_options = json.load(file)
    
    question_items_by_survey = create_question_items(question_index_file, excel_data, survey_options)

    # Iterate over all files in the folder
    for survey_option in survey_options:
        # Create survey stata url path
        stata_url = os.path.join(stata_files_url_base, f"{survey_option['websiteId']}.dta")
        
        survey_id = survey_option['id']
        
        stata_file = download_file(stata_url, statas_folder)
        
        print(f"Processing stata file: {stata_file}")
        question_items_by_survey[survey_id] = append_english_descriptions(question_items_by_survey, stata_file, survey_id)
    
    # Filter out question items with invalid data
    clean_question_items(question_items_by_survey)

    # Save to question_items of each survey
    for survey_id, question_items in question_items_by_survey.items():
        question_items_file = f"{question_items_folder}/{survey_id}.json"

        with open(question_items_file, "w", encoding="utf-8") as f:
            json.dump(question_items, f, ensure_ascii=False, indent=4)

        print(f"Question items saved to '{survey_id}.json'")