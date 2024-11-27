import json
import openpyxl
import os
import pandas as pd

if __name__ == "__main__":
    survey_options_filename = '/home/yochayc/INES/ines-website/src/assets/surveyOptions.json'
    question_index_file = "/home/yochayc/INES/playground/question_index.xlsx"
    question_items_file = "/home/yochayc/INES/playground/question_items.json"

    excel_data = pd.ExcelFile(question_index_file)
    
    # Load survey options json
    with open(survey_options_filename, "r") as file:
        survey_options = json.load(file)
    
    survey_ids = [entry["id"] for entry in survey_options if "id" in entry]

    # Initialize the questionItems array
    questionItems = []

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
            for [col, orig_col] in [[str(col).strip(), col] for col in columns]:
                if col in survey_ids:
                    question_survey_id = row[orig_col]

                    # Skip if the cell is empty (question not asked in this survey)
                    if pd.notna(question_survey_id):
                        # Create the questionItem object
                        question_item = {
                            "questionHebrewDescription": question_description,
                            "id": f"{row_index + 1}. {question_description}",  # id can also aid in sorting questions
                            "questionSurveyId": str(question_survey_id),  # Convert to string
                            "surveyId": col,
                            "type": question_type,
                        }
                        questionItems.append(question_item)

    # Save to JSON for future use
    import json
    with open(question_items_file, "w", encoding="utf-8") as f:
        json.dump(questionItems, f, ensure_ascii=False, indent=4)

    print("Question items saved to 'question_items.json'")