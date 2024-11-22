import pandas as pd

itr = pd.read_stata('/home/yochayc/INES/playground/2022_STATA.dta', iterator=True)
labels = itr.variable_labels()

df = pd.DataFrame(list(labels.items()), columns=["Key", "Value"])
df.to_csv("/home/yochayc/INES/playground/labels.csv", index=False)
