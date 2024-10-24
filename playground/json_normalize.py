import pandas as pd

data = pd.read_json("/home/yochayc/INES/playground/2022_web_meta.json")
print(f'Saved: {data}')
csv_file_path = "/home/yochayc/INES/playground/2022_web_meta.csv"

data.to_csv(csv_file_path)