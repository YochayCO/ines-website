import pandas as pd
import re
import sys
import csv

def is_email(s):
    pattern = re.compile(r".*@.*")
    return bool(pattern.match(str(s).strip()))

def read_list_from_range(df, excel_range):
    # Parse range like A1:A10
    start_cell, end_cell = excel_range.split(":")
    start_col = ord(start_cell[0].upper()) - ord('A')
    start_row = int(start_cell[1:]) - 1
    end_col = ord(end_cell[0].upper()) - ord('A')
    end_row = int(end_cell[1:]) - 1

    values = []
    for r in range(start_row, end_row + 1):
        for c in range(start_col, end_col + 1):
            val = df.iat[r, c]
            if pd.notna(val) and str(val).strip() != "":
                values.append(str(val).strip())
    return values

def process_emails(emails_by_org_file, blacklist_range, maybelist_range):
    # Read Excel file
    xls = pd.ExcelFile(emails_by_org_file)

    # Get all cells only from the first sheet
    all_cells = []
    df_first = pd.read_excel(xls, sheet_name=xls.sheet_names[0], header=None)
    all_cells.extend(df_first.values.flatten())

    # Read blacklist and maybelist from 3rd sheet
    df_third = pd.read_excel(xls, sheet_name=xls.sheet_names[2], header=None)
    blacklist = read_list_from_range(df_third, blacklist_range)
    maybelist = read_list_from_range(df_third, maybelist_range)

    # Remove NaNs and strip spaces
    all_cells = [str(cell).strip() for cell in all_cells if pd.notna(cell) and str(cell).strip() != ""]

    valid_emails = set()
    blacklist_emails = set()
    maybelist_emails = set()

    for cell in all_cells:
        if is_email(cell):
            email_lower = cell.lower()
            if email_lower in [e.lower() for e in blacklist]:
                blacklist_emails.add(email_lower)
            elif any(keyword.lower() in email_lower for keyword in maybelist):
                maybelist_emails.add(email_lower)
            else:
                valid_emails.add(email_lower)
        else:
            blacklist_emails.add(cell)

    # Ensure no duplicates across categories
    valid_emails -= blacklist_emails
    valid_emails -= maybelist_emails
    maybelist_emails -= blacklist_emails

    # Prepare rows for CSV
    max_len = max(len(valid_emails), len(blacklist_emails), len(maybelist_emails))
    valid_list = list(valid_emails) + [""] * (max_len - len(valid_emails))
    blacklist_list = list(blacklist_emails) + [""] * (max_len - len(blacklist_emails))
    maybelist_list = list(maybelist_emails) + [""] * (max_len - len(maybelist_emails))

    # Write CSV
    output_file = "/home/yochayc/INES/playground/lior_exam/filtered_emails.csv"
    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Valid Emails", "Blacklisted or Invalid", "Maybe Invalid (Keyword)"])
        for row in zip(valid_list, blacklist_list, maybelist_list):
            writer.writerow(row)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print("Usage: python script.py")
        sys.exit(1)

    emails_by_org_file = "/home/yochayc/INES/playground/lior_exam/email_by_org.xlsx"
    blacklist_range = "B2:B39"
    maybelist_range = "A2:A33"

    process_emails(emails_by_org_file, blacklist_range, maybelist_range)
    print("filtered_emails.csv created successfully.")
