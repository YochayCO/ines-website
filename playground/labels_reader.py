import os
import pandas as pd

def export_stata_labels(input_filename: str, output_filename: str):
    """
    Extracts variable labels from a Stata file and exports them to a CSV file.

    Args:
        input_filename (str): The path to the Stata (.dta) file.
        output_filename (str): The path where the CSV file will be saved.
    """
    itr = pd.read_stata(input_filename, iterator=True)
    labels = itr.variable_labels()
    
    df = pd.DataFrame(list(labels.items()), columns=["id", "description"])
    df.to_csv(output_filename, index=False)

if __name__ == "__main__":
    # Hardcoded folder name
    input_folder = "/home/yochayc/INES/playground/statas"
    output_folder = "/home/yochayc/INES/playground/labels"
    
    # Iterate over all files in the folder
    for filename in os.listdir(input_folder):
        if filename.endswith(".dta"):  # Process only Stata files
            input_file = os.path.join(input_folder, filename)
            output_file = os.path.join(output_folder, f"{os.path.splitext(filename)[0]}_labels.csv")
            
            print(f"Processing file: {input_file}")
            export_stata_labels(input_file, output_file)
            print(f"Labels exported to: {output_file}")
