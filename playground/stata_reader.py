import pandas as pd
df = pd.read_stata("/home/yochayc/INES/playground/2022_STATA.dta")
print(df)

df.to_csv("/home/yochayc/INES/playground/2022_STATA.csv")