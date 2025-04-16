from dotenv import load_dotenv
from collections import defaultdict
import os
import pandas as pd
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

supabase: Client = create_client(url, key)
questions: list[dict[str, str]] = []

def parse_questions(question_index_file, wxl_data):
    """
    For each sheet in the excel - go over all rows (questions),
    and append a question entity to the questions list.
    """
    # Iterate through each sheet in the Excel file
    for heb_category in wxl_data.sheet_names:
        # Load the current sheet
        category_data = pd.read_excel(question_index_file, sheet_name=heb_category)

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

def save_questions():
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
    
    return questions

def create_questions():
    # Load survey options and question index
    wxl_data = pd.ExcelFile(question_index_file)
    
    parse_questions(question_index_file, wxl_data)
    dupes = find_duplicates(questions)
    prefix_duplicates(questions, dupes)
    return questions

if __name__ == "__main__":
    create_questions()
    save_questions()
