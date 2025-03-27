import pandas as pd

# Load the Excel file
df = pd.read_csv("question_comment_types.csv")

# Process the "Comment Content" column
def extract_content(comment):
    if pd.isna(comment) or isinstance(comment, int):
        return comment  # Keep NaN values as they are
    return comment.split(":", 1)[-1].lstrip() if ":" in comment else comment

df["Content Only"] = df["Comment Content"].apply(extract_content)

# Save the modified DataFrame to a new Excel file
df.to_csv("comments_content_remastered.csv", index=False)

print("Processing complete. The new file has been saved as 'comments_content_remastered.csv'.")
