# Read multi-survey question identifiers file 
# Read the sheet 'סופי סופי' from new_question_index file and find the rows where the column 'לשונית' is the category of the multi-survey questions, and the column 'שאלה' is the heb_title.
# There are 5 columns named 'מדרגה 1' to 'מדרגה 5' which are the tags for each wxl_question.
# Fetch multi-survey quesions from wxl_questions table in supabase, via id which is category:::heb_title.
# Add the tags to the multi-survey questions.
# Save the multi-survey questions to the file multiSurveyQuestions.json.
# prompt the user and ask whether to save the changes to the db.
# If the user agrees, save the changes to the db.

