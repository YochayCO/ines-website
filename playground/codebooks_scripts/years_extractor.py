import pandas as pd
import re
import os

cwd = "/home/yochayc/INES/playground"

# Load the Excel file
df = pd.read_excel(os.path.join(cwd, 'codebooks_data.xlsx'), sheet_name='comments_data')

# Function to extract years (1900-2100) from text
def extract_years(text):
    if pd.isna(text):  # Handle NaN values
        return ''
    years = re.findall(r'(19\d{2}|20\d{2})', str(text))
    return ', '.join(years)

# Apply function to column C and store results in column O
df['O'] = df['Content Only'].apply(extract_years)

# Save the modified file
df.to_excel(os.path.join(cwd, 'output.xlsx'), index=False)

print("Years extracted and saved in column O of output.xlsx")
