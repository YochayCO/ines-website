import json
import os
import requests
import pandas as pd
import pyreadstat

survey_options_filename = '/home/yochayc/INES/ines-website/src/assets/surveyOptions.json'
stata_files_url_base = "https://socsci4.tau.ac.il/mu2/ines/wp-content/uploads/sites/4"
statas_folder = "/home/yochayc/INES/ines-website/src/assets/statas"
labels_meta_folder = "/home/yochayc/INES/ines-website/src/assets/labels_meta"
surveys_data_folder = "/home/yochayc/INES/ines-website/public/surveys_data"

def download_file(url: str, output_folder: str) -> str:
    """
    Downloads a file from a given URL and saves it in the specified output folder.

    Args:
        url (str): The URL of the file to download.
        output_folder (str): The folder to save the downloaded file.

    Returns:
        str: The path to the downloaded file.
    """
    filename = os.path.basename(url)  # Extract the file name from the URL
    output_path = os.path.join(output_folder, filename)

    print(f"Downloading {url}...")
    response = requests.get(url, stream=True)
    response.raise_for_status()  # Raise an error for HTTP issues

    with open(output_path, 'wb') as file:
        for chunk in response.iter_content(chunk_size=8192):
            file.write(chunk)

    print(f"Downloaded to {output_path}")
    return output_path

def export_stata_labels(stata_filename: str, survey_id: str):
    """
    Extracts variable labels from a Stata file and exports them to a CSV file.

    Args:
        stata_filename (str): The path for the input Stata (.dta) file.
        labels_meta_filename (str): The path where the labels CSV file will be saved.
    """
    labels_meta_file = os.path.join(labels_meta_folder, f"{survey_id}_labels.csv")
    survey_data_file = os.path.join(surveys_data_folder, f"{survey_id}.csv")
    
    df, meta = pyreadstat.read_dta(stata_filename)

    labels_list = []

    for var_name, label in meta.column_names_to_labels.items():
        labels_list.append({"id": var_name, "description": label})
        
    labels_meta_df = pd.DataFrame(labels_list)
    data_df = pd.DataFrame(df)
    labels_meta_df.to_csv(labels_meta_file, index=False)
    data_df.to_csv(survey_data_file, index=False)
    
    print(f"Labels exported to: {labels_meta_file}")
    print(f"Data exported to: {survey_data_file}")

if __name__ == "__main__":
    os.makedirs(statas_folder, exist_ok=True)
    os.makedirs(labels_meta_folder, exist_ok=True)
    os.makedirs(surveys_data_folder, exist_ok=True)
    
    with open(survey_options_filename, "r") as file:
        survey_options = json.load(file)  # Parse the JSON file into a Python object

    # Iterate over all files in the folder
    for survey_option in survey_options:
        # Create survey stata url and labels_meta file path
        stata_url = os.path.join(stata_files_url_base, f"{survey_option['websiteId']}.dta")
        
        survey_id = survey_option['id']
        
        print(f"Downloading from url: {stata_url}")
        stata_file = download_file(stata_url, statas_folder)
        
        print(f"Processing file: {stata_file}")
        export_stata_labels(stata_file, survey_id)
