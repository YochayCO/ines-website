import pandas as pd
import numpy as np

df = pd.read_stata("/home/yochayc/INES/playground/2022_STATA.dta")
numerical_df = pd.DataFrame()
numerical_df['v52a_num'] = df['v52a'].apply(lambda s: int(s.split('.')[0]))
numerical_df['v111_num'] = df['v111'].apply(lambda s: int(s.split('.')[0]))
# numerical_df = example_df.apply(series_only_nums, axis=1)

numerical_df.to_csv("/home/yochayc/INES/playground/2022_STATA.csv", index=False)