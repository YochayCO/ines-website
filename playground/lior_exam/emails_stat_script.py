import pandas as pd
import sys
import csv

def generate_email_stats(original_excel, filtered_csv):
    # Read first sheet of original Excel
    xls = pd.ExcelFile(original_excel)
    df_first = pd.read_excel(xls, sheet_name=xls.sheet_names[0], header=None)

    # Read valid emails from filtered CSV
    filtered_df = pd.read_csv(filtered_csv)
    # Extract and clean valid emails from filtered CSV
    valid_emails_column = filtered_df['Valid Emails']
    valid_emails_cleaned = (str(e).strip().lower() for e in valid_emails_column if pd.notna(e) and str(e).strip() != "")
    valid_emails = set(valid_emails_cleaned)

    # Prepare stats list
    seen_emails = set()
    stats = []
    all_invalid_emails = set()

    for col_idx in range(df_first.shape[1]):
        col_values = [str(v).strip().lower() for v in df_first.iloc[:, col_idx] if pd.notna(v) and str(v).strip() != ""]

        # Count valid emails in this column
        valid_in_col = [e for e in col_values if e in valid_emails]
        valid_count = len(valid_in_col)

        # Count duplicates compared to previous columns. Should be 0 since we invalidate seen emails
        duplicate_count = sum(1 for e in valid_in_col if e in seen_emails)

        # Add current column's valid emails to seen set
        seen_emails.update(valid_in_col)

        # Track invalid emails in this column
        invalid_in_col = [e for e in col_values if e not in valid_emails]
        invalid_count = len(invalid_in_col)
        all_invalid_emails.update(invalid_in_col)
        
        # Remove valid emails found in this column from the main set
        valid_in_col_set = set(valid_in_col)
        valid_emails.difference_update(valid_in_col_set)

        stats.append([f"Column {col_idx+1}", valid_count, duplicate_count, invalid_count])

    # Determine emails not found in any column
    missing_emails = sorted(valid_emails - seen_emails)
    missing_emails_str = ", ".join(missing_emails)

    # Prepare invalid emails string
    all_invalid_emails = sorted(all_invalid_emails)
    all_invalid_emails_str = ", ".join(all_invalid_emails)

    # Write stats CSV
    with open("/home/yochayc/INES/playground/lior_exam/email_stats.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Column", "Valid Email Count", "Duplicate Count from Previous Columns", "Invalid Email Count"])
        writer.writerows(stats)

        # Append missing emails and invalid emails info in the last rows
        writer.writerow(["ALL COLUMNS", "", "", "", ""])
        writer.writerow(["Missing Valid Emails", "", "", "", missing_emails_str])
        writer.writerow(["All Invalid Emails", "", "", "", all_invalid_emails_str])

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print("Usage: python email_stats.py")
        sys.exit(1)

    original_excel = "/home/yochayc/INES/playground/lior_exam/email_by_org.xlsx"
    filtered_csv = "/home/yochayc/INES/playground/lior_exam/filtered_emails.csv"

    generate_email_stats(original_excel, filtered_csv)
    print("email_stats.csv created successfully.")
