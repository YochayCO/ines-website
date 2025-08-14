from dotenv import load_dotenv
import os
import json
import pandas as pd
from supabase import create_client, Client

CATEGORY_TITLE_SEPARATOR = ":::"

# Load environment variables from .env
load_dotenv()

# Fetch variables
supabase_url: str = os.environ.get("SUPABASE_URL") or ""
supabase_key: str = os.environ.get("SUPABASE_KEY") or ""
if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in the environment variables.")

scriptpath = os.path.dirname(os.path.abspath(__file__))
question_index_file = os.path.join(scriptpath, "raw_data", "question_index_new.xlsx")

supabase: Client = create_client(supabase_url, supabase_key)


def read_multi_survey_identifiers() -> list[dict]:
    """Read identifiers from raw_data/multi_survey_question_ids.json and extract tags for each
    identifier from sheet 'סופי סופי' in question_index_new.xlsx.
    """
    ms_question_ids_file = os.path.join(scriptpath, "raw_data", "multi_survey_question_ids.json")
    if not os.path.exists(ms_question_ids_file):
        raise FileNotFoundError(f"Identifiers JSON not found: {ms_question_ids_file}")

    with open(ms_question_ids_file, "r", encoding="utf-8") as fh:
        question_identifiers = json.load(fh)
    if not isinstance(question_identifiers, list):
        raise ValueError("Expected a list of question identifiers in the JSON file.")
    if len(question_identifiers) == 0:
        print("Warning: No identifiers found in the JSON file.")


    # For each identifier, build a unique id.
    for q_identifier in question_identifiers:
        heb_title = q_identifier.get("hebTitle")
        category = q_identifier.get("category")
        if heb_title is None or category is None:
            continue
        heb_title = str(heb_title).strip()
        category = str(category).strip()
        q_identifier["id"] = f"{category} {CATEGORY_TITLE_SEPARATOR} {heb_title}"
    
    return question_identifiers


def fetch_wxl_questions_by_ids(ids: list[str]) -> list[dict]:
    if not ids:
        return []

    # Supabase python client supports .in_ for filtering
    resp = supabase.table("wxl_questions").select("*").in_("id", ids).execute()
    # Prefer reading .data; do not assume .error attribute exists on the response object
    data = getattr(resp, "data", None)
    if data is None:
        print("Warning: no data returned from supabase for given ids")
        return []
    return data or []


def attach_tags_to_questions(wxl_questions: list[dict]) -> list[dict]:
    """Attach tags from multi-survey questions to fetched wxl_question records.

    Returns updated_questions
    """
    
    # Load the relevant sheet once
    xl = pd.ExcelFile(question_index_file)
    if "סופי סופי" not in xl.sheet_names:
        raise ValueError("Sheet 'סופי סופי' not found in question index file")

    df = pd.read_excel(question_index_file, sheet_name="סופי סופי")
    df.rename(columns=lambda c: str(c).strip(), inplace=True)

    tagged_wxl_questions: list[dict] = []

    for q in wxl_questions:
        heb_title = q.get("heb_title")
        category = q.get("category")
        id = q.get("id")
        if heb_title is None or category is None:
            continue
        heb_title = str(heb_title).strip()
        category = str(category).strip()

        # default tags array with empty strings to preserve indices
        tags = ["" for _ in range(5)]

        # Only attempt matching if both relevant columns exist
        if "לשונית" in df.columns and "שאלה" in df.columns:
            mask = (
                df["לשונית"].astype(str).str.strip() == category
            ) & (
                df["שאלה"].astype(str).str.strip() == heb_title
            )
            matches = df[mask]
        else:
            matches = df.iloc[0:0]

        if not matches.empty:
            row = matches.iloc[0]
            for i in range(1, 6):
                # Check for both "מדרגה {i}" and "מדרגה{i}" columns
                col_with_space = f"מדרגה {i}"
                col_without_space = f"מדרגה{i}"
                if col_with_space in df.columns:
                  col = col_with_space
                elif col_without_space in df.columns:
                  col = col_without_space
                else:
                  continue

                tag_val = row.get(col)
                if not pd.isna(tag_val):
                    tags[i - 1] = str(tag_val).strip()

        tagged_wxl_questions.append({
            "category": category,
            "heb_title": heb_title,
            "id": id,
            "tags": tags,
        })

    return tagged_wxl_questions


def save_multi_survey_questions_json(questions: list[dict], filename: str):
    os.makedirs(os.path.join(scriptpath, "out_data"), exist_ok=True)
    path = os.path.join(scriptpath, "out_data", filename)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(questions, fh, ensure_ascii=False, indent=2)
    print(f"Saved {len(questions)} multi-survey questions to {path}")


def upsert_questions_to_db(questions: list[dict]):
    """Upsert questions to supabase; print a concise summary."""
    if not questions:
        print("No questions to upsert.")
        return
    resp = supabase.table("wxl_questions").upsert(questions).execute()
    data = getattr(resp, "data", None)
    if data is None:
        print("Upsert completed but no data was returned (check supabase logs).")
    else:
        print(f"Attempted to upsert {len(questions)} questions to the database.")


if __name__ == "__main__":
    # Read multi-survey identifiers (from JSON + sheet 'סופי סופי')
    msq_identifiers = read_multi_survey_identifiers()
    print(f"Parsed {len(msq_identifiers)} multi-survey identifiers from JSON and sheet 'סופי סופי'.")

    # Fetch wxl_questions from the database for these identifiers
    wxl_ids = [msq["id"] for msq in msq_identifiers]
    wxl_questions = fetch_wxl_questions_by_ids(wxl_ids)
    print(f"Fetched {len(wxl_questions)} questions from database matching identifiers.")

    if len(wxl_questions) == 0:
        print("No matching wxl_questions found in the database. Exiting.")
        exit(0)

    # Attach tags from the identifiers to the fetched wxl_questions
    tagged_questions = attach_tags_to_questions(wxl_questions)
    print(f"Tagged {len(tagged_questions)} questions.")

    # Save updated questions locally
    save_multi_survey_questions_json(tagged_questions, "multiSurveyQuestions.json")

    # Prompt user whether to save changes to DB
    if len(tagged_questions) == 0:
        print("No matching questions were found to update. Exiting.")
    else:
        answer = input("Save tag changes to the database? (y/N): ").strip().lower()
        if answer == "y":
            upsert_questions_to_db(tagged_questions)
        else:
            print("Aborted — no changes written to the database.")

