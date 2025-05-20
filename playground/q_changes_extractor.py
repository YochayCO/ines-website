import difflib
import json
from typing import Optional
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime
import os
import pandas as pd
from supabase import create_client, Client
import re
from Levenshtein import ratio

# Load environment variables from .env
load_dotenv()

scriptpath = os.path.dirname(os.path.abspath(__file__))

# Fetch variables
supabase_url: str = os.environ.get("SUPABASE_URL") or ""
supabase_key: str = os.environ.get("SUPABASE_KEY") or ""
if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in the environment variables.")
supabase: Client = create_client(supabase_url, supabase_key)

class Survey(BaseModel):
    wxl_survey_id: str
    serial_num: int
    
class QuestionInstance(BaseModel):
    id: str
    qid_s: str
    wxl_survey: Survey
    dta_description: Optional[str]
    dta_answers: Optional[dict[int, str]]

class Question(BaseModel):
    id: str
    heb_title: str
    category: str
    q_instances: list[QuestionInstance]

class QuestionChange(BaseModel):
    wxl_question: Question
    main_change_type: str | None = None
    ratio: float | None = None
    changes: list[dict[str, None | str | int | dict[int, str]]]
    pre_qi: QuestionInstance
    post_qi: QuestionInstance

questions: list[Question] = []
qi_changes: list[QuestionChange] = []
CHANGE_PRIORITY = [
    "description",
    "scale_oddness",
    "scale_growth",
    "scale_shrink",
    "scale_backwards",
    "other_values",
    "answers_missing_or_added",
    "answers_text_change",
    "no_change_in_description",
    "no_change_in_answers",
]

def fetch_questions():
    global questions
    db_questions = (
        supabase
            .table("wxl_questions")
            .select("id, heb_title, category, q_instances(id, qid_s, wxl_survey(serial_num, wxl_survey_id), dta_description, dta_answers)")
            .execute()
            .data
    )

    questions = [Question(**q) for q in db_questions]
    return questions

def split_ordinal_and_other(answers: dict[int, str]) -> tuple[dict[int, str], dict[int, str]]:
    # Convert string keys to integers
    int_keys = sorted(int(k) for k in answers.keys())
    first_ans_key = int_keys[0]
    ordinal: dict[int, str] = {}

    for i, (curr_ans_key, ans_val) in enumerate(answers.items()):
        curr_ordinal_key = first_ans_key + i
        if curr_ordinal_key == curr_ans_key:
            ordinal[curr_ans_key] = ans_val
        else:
            break  # ordinal block ends when there's a gap
    
    # The rest are "other"
    ordinal_keys = set(ordinal.keys())
    other = {k: v for k, v in answers.items() if k not in ordinal_keys}

    return ordinal, other

def identify_changes():
    for question in questions:
        # Sort question instances by serial number
        question.q_instances.sort(key=lambda qi: qi.wxl_survey.serial_num)

        for i in range(1, len(question.q_instances)):
            qi_prev = question.q_instances[i - 1]
            qi = question.q_instances[i]
            changes = []
            answers = qi.dta_answers
            answers_prev = qi_prev.dta_answers
            change_ratio = None

            # Check for description changes
            if qi.dta_description != qi_prev.dta_description:
                
                # Check if change is minor
                change_ratio = round(ratio(qi.dta_description or "", qi_prev.dta_description or ""), 2)
                
                if change_ratio > 0.99:
                    changes.append({ 
                        "type": "no_change_in_description", 
                        "old": qi_prev.dta_description, 
                        "new": qi.dta_description,
                    })
                    summarize_qi_changes(question, qi_prev, qi, changes)
                    continue

                changes.append({ 
                    "type": "description", 
                    "old": qi_prev.dta_description, 
                    "new": qi.dta_description,
                })
            
            if answers == None and answers_prev == None:
                summarize_qi_changes(question, qi_prev, qi, changes, change_ratio)
                continue
            if answers == None or answers_prev == None:
                changes.append({
                    "type": "answers_missing_or_added", 
                    "old": answers_prev, 
                    "new": answers 
                })
                summarize_qi_changes(question, qi_prev, qi, changes, change_ratio)
                continue

            # Check for answer changes
            if answers == answers_prev:
                summarize_qi_changes(question, qi_prev, qi, changes, change_ratio)
                continue
            # ELSE: Infer change types - there is at least one change
            
            (ordinal_answers, other_answers) = split_ordinal_and_other(answers)
            (ordinal_answers_prev, other_answers_prev) = split_ordinal_and_other(answers_prev)

            # Check for scale changes - could be more than one type
            if len(answers) != len(answers_prev):
                # Check for scale oddness
                if (len(ordinal_answers) % 2 != len(ordinal_answers_prev) % 2):
                    changes.append({ 
                        "type": "scale_oddness", 
                        "old": len(ordinal_answers_prev), 
                        "new": len(ordinal_answers)
                    })
                if len(ordinal_answers) > len(ordinal_answers_prev):
                    changes.append({ 
                        "type": "scale_growth", 
                        "old": len(ordinal_answers_prev), 
                        "new": len(ordinal_answers)
                    })
                if len(ordinal_answers) < len(ordinal_answers_prev):
                    changes.append({ 
                        "type": "scale_shrink", 
                        "old": len(ordinal_answers_prev), 
                        "new": len(ordinal_answers)
                    })
                
                if len(other_answers) != len(other_answers_prev):
                    changes.append({ 
                        "type": "other_values", 
                        "old": other_answers_prev, 
                        "new": other_answers,
                    })
                
                summarize_qi_changes(question, qi_prev, qi, changes, change_ratio)
                continue

            ordinal_answer_labels = list(ordinal_answers.values())
            ordinal_answer_labels_prev = list(ordinal_answers_prev.values())
            
            # Check if scale is backwards
            if (
                len(ordinal_answer_labels) > 0 and
                len(ordinal_answer_labels_prev) > 0 and
                ordinal_answer_labels[0] == ordinal_answer_labels_prev[-1] and
                ordinal_answer_labels[-1] == ordinal_answer_labels_prev[0]
            ):
                changes.append({ 
                    "type": "scale_backwards", 
                    "old": ordinal_answer_labels_prev[0], 
                    "new": ordinal_answer_labels[-1],
                })
                summarize_qi_changes(question, qi_prev, qi, changes, change_ratio)
                continue
            
            ### Change in answers phrasing
            
            # Check if change is minor
            change_ratio = round(ratio("".join(list(answers.values())), "".join(list(answers_prev.values()))), 2)
            
            if change_ratio > 0.99:
                changes.append({ 
                    "type": "no_change_in_answers", 
                    "old": answers_prev, 
                    "new": answers,
                })
                summarize_qi_changes(question, qi_prev, qi, changes, change_ratio)
                continue

            changes.append({ 
                "type": "answers_text_change", 
                "old": answers_prev, 
                "new": answers,
            })

            summarize_qi_changes(question, qi_prev, qi, changes, change_ratio)
    return qi_changes

def summarize_qi_changes(question, qi_prev, qi, changes, change_ratio = None):
    main_change_type = get_main_change_type(changes)
                    
            # Save the detected changes
    qi_change = QuestionChange(**{
        "wxl_question": question,
        "pre_qi": qi_prev,
        "post_qi": qi,
        "changes": changes,
        "main_change_type": main_change_type,
        "ratio": change_ratio,
    })
            
    qi_changes.append(qi_change)

def odd_or_even(answers: dict[str, str]) -> str:
    return "even" if len(answers) % 2 else "odd"

def get_main_change_type(changes: list[dict[str, None | str | dict[str, str]]]) -> str | None:
    if len(changes) == 0:
        return None

    change_types: list[str] = [str(c.get("type")) for c in changes if isinstance(c.get("type"), str)]
    for priority in CHANGE_PRIORITY:
        if priority in change_types:
            return priority
    return change_types[0]  # or some default value

def save_qis_to_db(supabase, dict_qi_changes):
    response = (
        supabase
            .table("qi_changes")
            .upsert(dict_qi_changes)
            .execute()
    )

def get_diff(old_text, new_text):
    old_parts = (old_text or "").split(",")
    new_parts = (new_text or "").split(",")
    
    diff = difflib.ndiff(old_parts, new_parts)

    removed = []
    added = []

    for change in diff:
        if change.startswith('-'):
            removed.append(change[2:].strip())
        elif change.startswith('+'):
            added.append(change[2:].strip())

    return f"Removed:\n{"\n".join(removed)}\n\nAdded:\n{"\n".join(added)}"

if __name__ == "__main__":
    questions = fetch_questions()

    qi_changes = identify_changes()

    dict_qi_changes = [qi_change.model_dump() for qi_change in qi_changes]
        
    # # Save question instance changes to the database
    # save_qis_to_db(supabase, dict_qi_changes)

    final_qi_changes = []

    def split_removed_added(diff_text: str) -> tuple[str, str]:
        if not diff_text:
            return "", ""
        removed = ""
        added = ""
        parts = diff_text.split("Added:")
        if len(parts) == 2:
            removed = parts[0].replace("Removed:\n", "").strip()
            added = parts[1].strip()
        else:
            # fallback: if "Added:" not found, treat all as removed
            removed = diff_text.replace("Removed:\n", "").strip()
        return removed, added

    for qi_change in dict_qi_changes:
        final_qi_change = {}
        # Switch the changes array to "first_change" and "second_change" properties
        # stringify them.
        # clean the qi_change object of all properties that are not needed
        final_qi_change["wxl_question"] = {
            "heb_title": qi_change["wxl_question"]["heb_title"],
            "category": qi_change["wxl_question"]["category"],
        }
        # final_qi_change["main_change_type"] = qi_change["main_change_type"]
        final_qi_change["ratio"] = qi_change["ratio"]
        final_qi_change["pre_qi"] = {
            "qid_s": qi_change["pre_qi"]["qid_s"],
            "wxl_survey": {
                "wxl_survey_id": qi_change["pre_qi"]["wxl_survey"]["wxl_survey_id"],
            },
            "dta_description": qi_change["pre_qi"]["dta_description"],
            "answers": qi_change["pre_qi"]["dta_answers"],
        }
        final_qi_change["post_qi"] = {
            "qid_s": qi_change["post_qi"]["qid_s"],
            "wxl_survey": {
                "wxl_survey_id": qi_change["post_qi"]["wxl_survey"]["wxl_survey_id"],
            },
            "dta_description": qi_change["post_qi"]["dta_description"],
            "answers": qi_change["post_qi"]["dta_answers"],
        }
        final_qi_change["description_diff"] = get_diff(
            final_qi_change["pre_qi"]["dta_description"], 
            final_qi_change["post_qi"]["dta_description"]
        )
        description_removed, description_added = split_removed_added(final_qi_change["description_diff"])
        final_qi_change["description_removed"] = description_removed
        final_qi_change["description_added"] = description_added

        final_qi_change["answers_diff"] = get_diff(
            json.dumps(final_qi_change["pre_qi"]["answers"]) if len(final_qi_change["pre_qi"]["answers"] or []) > 0 else "",
            json.dumps(final_qi_change["post_qi"]["answers"] ) if len(final_qi_change["post_qi"]["answers"] or []) > 0 else "",
        )

        answers_removed, answers_added = split_removed_added(final_qi_change["answers_diff"])
        final_qi_change["answers_removed"] = answers_removed
        final_qi_change["answers_added"] = answers_added

        final_qi_change["pre_qi"]["answers"] = json.dumps(final_qi_change["pre_qi"]["answers"]) if len(final_qi_change["pre_qi"]["answers"] or []) > 0 else ""
        final_qi_change["post_qi"]["answers"] = json.dumps(final_qi_change["post_qi"]["answers"]) if len(final_qi_change["post_qi"]["answers"] or []) > 0 else ""

        sorted_changes = sorted(
            qi_change["changes"], 
            key=lambda c: CHANGE_PRIORITY.index(c["type"])
        )
        
        final_qi_change["first_change_type"] = sorted_changes[0]["type"] if len(sorted_changes) > 0 else ""
        final_qi_change["first_change_old"] = json.dumps(sorted_changes[0]["old"]) if len(sorted_changes) > 0 else ""
        final_qi_change["first_change_new"] = json.dumps(sorted_changes[0]["new"]) if len(sorted_changes) > 0 else ""
        final_qi_change["first_change_diff"] = get_diff(
            final_qi_change["first_change_old"], 
            final_qi_change["first_change_new"]
        )
        
        first_removed, first_added = split_removed_added(final_qi_change["first_change_diff"])
        final_qi_change["first_change_removed"] = first_removed
        final_qi_change["first_change_added"] = first_added

        final_qi_change["second_change_type"] = sorted_changes[1]["type"] if len(sorted_changes) > 1 else ""

        # Remove diff properties
        final_qi_change.pop("description_diff", None)
        final_qi_change.pop("answers_diff", None)
        final_qi_change.pop("first_change_diff", None)

        final_qi_changes.append(final_qi_change)

    # Save question instance changes to a CSV file
    # Flatten the question instances and question entities before saving
    df = pd.json_normalize(
        final_qi_changes,
        errors="ignore",
    )
    columns_order = [
        "wxl_question.heb_title", 
        "wxl_question.category", 
    
        "pre_qi.wxl_survey.wxl_survey_id", 
        "post_qi.wxl_survey.wxl_survey_id",
        
        "first_change_type",
        "second_change_type",
        
        "ratio",

        "description_removed",
        "description_added",
        
        "pre_qi.dta_description", 
        "post_qi.dta_description",

        "answers_removed",
        "answers_added",
        
        "pre_qi.answers",
        "post_qi.answers",

        "first_change_removed",
        "first_change_added",
        
        "first_change_old",
        "first_change_new",
    ]

    # Reorder the columns
    df = df[columns_order]

    # Rename the columns
    df = df.rename(
        columns={
            "wxl_question.heb_title": "שאלה",
            "wxl_question.category": "קטגוריה",
            "pre_qi.wxl_survey.wxl_survey_id": "סקר_קודם",
            "post_qi.wxl_survey.wxl_survey_id": "סקר חדש",
            "first_change_type": "main_change_type",
            "second_change_type": "secondary_change_type",
            "ratio": "מידת שינוי",
            "pre_qi.dta_description": "תיאור קודם",
            "post_qi.dta_description": "תיאור חדש",
            "pre_qi.answers": "תשובות קודמות",
            "post_qi.answers": "תשובות חדשות",
            "first_change_old": "לפני",
            "first_change_new": "אחרי",
        }
    )
    df = df.sort_values(by=["קטגוריה", "שאלה", "סקר_קודם"])

    df_by_change_type = df.groupby('main_change_type')
    df_by_change_type = filter(lambda item: item[0] != "", df_by_change_type)

    with pd.ExcelWriter(os.path.join(scriptpath, "qi_changes3.xlsx")) as writer:
        # Combine all groups into a single DataFrame with a separating row between each group
        combined_df = pd.DataFrame()
        for change_type, group in df_by_change_type:
            # Add a column to indicate the change type (optional)
            group_with_type = group.copy()
            group_with_type.insert(0, "סוג שינוי", change_type)
            combined_df = pd.concat([combined_df, group_with_type], ignore_index=True)
            # Add a separating row (all empty except for the change type)
            sep_row = {col: "" for col in combined_df.columns}
            sep_row["סוג שינוי"] = ""  # or f"--- {change_type} ---"
            combined_df = pd.concat([combined_df, pd.DataFrame([sep_row])], ignore_index=True)
        # Remove the last separator row if present
        if not combined_df.empty:
            combined_df = combined_df.iloc[:-1]
        combined_df.to_excel(writer, sheet_name="all_changes", index=False)
