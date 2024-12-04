import json
import os
import pandas as pd

if __name__ == "__main__":
    survey_options_filename = '/home/yochayc/INES/ines-website/src/assets/surveyOptions.json'
    question_index_file = "/home/yochayc/INES/ines-website/src/assets/question_index.xlsx"
    question_items_folder = "/home/yochayc/INES/ines-website/public/question_items"

    os.makedirs(question_items_folder, exist_ok=True)
    excel_data = pd.ExcelFile(question_index_file)
    
    # Load survey options json
    with open(survey_options_filename, "r") as file:
        survey_options = json.load(file)
    
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

    # Save to JSON for future use
    for survey_id, question_items in question_items_by_survey.items():
        question_items_file = f"{question_items_folder}/{survey_id}.json"

        with open(question_items_file, "w", encoding="utf-8") as f:
            json.dump(question_items, f, ensure_ascii=False, indent=4)

        print(f"Question items saved to '{survey_id}.json'")