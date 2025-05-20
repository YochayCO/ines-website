import pandas as pd

def compare_excels(file1, file2):
    xl1 = pd.ExcelFile(file1)
    xl2 = pd.ExcelFile(file2)
    sheets1 = set(xl1.sheet_names)
    sheets2 = set(xl2.sheet_names)
    all_sheets = sheets1.union(sheets2)

    for sheet in all_sheets:
        if sheet not in sheets1:
            print(f"Sheet '{sheet}' only in {file2}")
            continue
        if sheet not in sheets2:
            print(f"Sheet '{sheet}' only in {file1}")
            continue

        df1 = xl1.parse(sheet)
        df2 = xl2.parse(sheet)
        df1 = df1.fillna('')
        df2 = df2.fillna('')

        max_rows = max(len(df1), len(df2))
        cols1 = list(df1.columns)
        cols2 = list(df2.columns)
        all_cols = list(dict.fromkeys(cols1 + cols2))

        for row in range(max_rows):
            for col in all_cols:
                val1 = df1.iloc[row][col] if row < len(df1) and col in df1.columns else ''
                val2 = df2.iloc[row][col] if row < len(df2) and col in df2.columns else ''
                if val1 != val2:
                    print(f"Difference in sheet '{sheet}', row {row+1}, column '{col}': '{val1}' vs '{val2}'")

if __name__ == "__main__":
    # Replace 'file1.xlsx' and 'file2.xlsx' with your file paths
    compare_excels('playground/qi_changes3_prev.xlsx', 'playground/qi_changes3.xlsx')