import os
import requests
import pandas as pd

survey_ids = [
    '2023/06/2022_STATA',
    '2023/06/March_2021_data_website_STATA',
    '2023/06/March_2020_data',
    '2023/06/Apr-Sep_2019_update_STATA',
    '2023/06/2015',
]

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

def export_stata_labels(stata_filename: str, labels_meta_filename: str):
    """
    Extracts variable labels from a Stata file and exports them to a CSV file.

    Args:
        stata_filename (str): The path for the input Stata (.dta) file.
        labels_meta_filename (str): The path where the labels CSV file will be saved.
    """
    itr = pd.read_stata(stata_filename, iterator=True)
    labels = itr.variable_labels()
    
    df = pd.DataFrame(list(labels.items()), columns=["id", "description"])
    df.to_csv(labels_meta_filename, index=False)

if __name__ == "__main__":
    stata_files_url_base = "https://socsci4.tau.ac.il/mu2/ines/wp-content/uploads/sites/4"
    statas_folder = "/home/yochayc/INES/ines-website/src/assets/statas"
    labels_meta_folder = "/home/yochayc/INES/ines-website/src/assets/labels_meta"
    
    os.makedirs(statas_folder, exist_ok=True)
    os.makedirs(labels_meta_folder, exist_ok=True)
    
    # Iterate over all files in the folder
    for survey_id in survey_ids:
        # Create survey stata url and labels_meta file path
        stata_url = os.path.join(stata_files_url_base, f"{survey_id}.dta")
        
        survey_nickname = survey_id.rsplit('/', 1)[-1]
        labels_meta_file = os.path.join(labels_meta_folder, f"{survey_nickname}_labels.csv")
        
        print(f"Downloading from url: {stata_url}")
        stata_file = download_file(stata_url, statas_folder)
        
        print(f"Processing file: {stata_file}")
        export_stata_labels(stata_file, labels_meta_file)

        print(f"Labels exported to: {labels_meta_file}")
