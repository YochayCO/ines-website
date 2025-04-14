import os
import pandas as pd

cwd = "/home/yochayc/INES/playground"

def add_question_ids(codebooks_path, question_index_path, output_path):
    # Load the 'comments_data' sheet from codebooks_data.xlsx
    with pd.ExcelFile(codebooks_path) as codebooks_xl:
        comments_data = codebooks_xl.parse("comments_data")

    # Load all sheets from question_index.xlsx into a dictionary for faster lookup
    question_index_xl = pd.ExcelFile(question_index_path)
    question_index_sheets = {sheet: question_index_xl.parse(sheet, dtype=str) for sheet in question_index_xl.sheet_names}

    # Ensure required columns exist
    if "Sheet Name" not in comments_data or "Cell Address" not in comments_data:
        raise ValueError("Missing required columns: 'Sheet Name' or 'Cell Address' in 'comments_data'.")

    # Function to get question_id efficiently
    def get_question_id(sheet_name, cell_address):
        if sheet_name not in question_index_sheets:
            return None
        
        sheet_df = question_index_sheets[sheet_name]

        try:
            col_letter = ''.join(filter(str.isalpha, cell_address))
            row_number = int(''.join(filter(str.isdigit, cell_address))) - 1  # Convert to 0-based index
            col_index = ord(col_letter.upper()) - ord('A')

            return sheet_df.iloc[row_number, col_index] if row_number < len(sheet_df) and col_index < len(sheet_df.columns) else None
        except Exception:
            return None

    # Apply function to fetch question_id for each row
    comments_data["question_id"] = comments_data.apply(
        lambda row: get_question_id(row["Sheet Name"], row["Cell Address"]), axis=1
    )

    # Save results to a new sheet
    comments_data.to_excel(output_path, sheet_name="comments_data_with_qids", index=False)

if __name__ == "__main__":
    codebooks_path = os.path.join(cwd, "codebooks_data.xlsx")  # Path to the input codebooks file
    question_index_path = os.path.join(cwd, "question_index.xlsx")  # Path to the input question index file
    output_path =  os.path.join(cwd, "codebooks_data_updated.xlsx")  # Path to save the output file
    
    add_question_ids(codebooks_path, question_index_path, output_path)
    print(f"Updated file saved as {output_path}")
