Our main goal is to help our clients, social science researchers, to better understand and control the data of their surveys.
We're working mostly in the `playground` folder, but if some of the code uses files from a different folder in the project that's totally fine.

## Project Structure
- `playground/`: Main working directory containing scripts and data files
- `ines-website/public/surveys_data`: Directory containing survey data files (dta files)

## Setup Instructions
1. Install Python 3.8 or higher
2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up the database connection credentials in `.env`
4. Run the initialization scripts in order:
   ```bash
   python upsert_wxl_questions.py
   python upsert_question_instances.py
   python q_changes_extractor.py
   ```

## Main Concepts

- Question: A question might have multiple appearances over the surveys in slightly different variations - each is called a Question instance or q_instance. The Question's hebrew description is almost always unique, and somewhere in the code I create a unique id that uses the hebrew description and the last question that has a non-duplicate hebrew description. Maybe something else as well - check me up on that.
- q_instance: An instance of a question in a survey. While having some differences, the q_instances related to the same Question basically ask the same thing.
- Category - There are multiple questions in each category, and one category per question.
- Survey - Each survey is related to a year. Some years have multiple surveys. They have 2 ids: from the wxl file and from the dta file name. The surveys have a chronological order marked by `serial_num`.
- qi_change: An entity that helps our clients observe the differences and changes between two following question instances (even if there is a year gap between them).

## Data Files

- Working excel (nicknamed `wxl`): This is the `question_index.xlsx` file (the one in the `playground` folder)
This file describes the questions in different surveys, its main purpose is to show how q_instances are connected and to which question.
The excel is organized as follows:
Each sheet is a Category, and each Category sheet contains a table.
Each row in the table is a Question, the row header (first column) is the Question's hebrew description. 
Each column of the table describes a Survey. The column header (first row) is the Survey year. 
Each cell in the table contains a Question instance's qi_id. Cells that are empty indicate that the question was not asked on that survey.

- Survey dta (or STATA) files (nicknamed `dta`): Each file contains the data + metadata for a survey and for the questions of that survey. Metadata includes the question description, the available answers for the question, and more. The data contains the answers of each respondant for each question. There are a few cases where a dta file includes more than one survey.

## Database Schema

The database contains the following main tables:

1. `Surveys` (manually created):
   - Contains survey metadata
   - Links to both wxl and dta file identifiers
   - Includes chronological ordering via `serial_num`

2. `wxl_questions`:
   - Stores question metadata
   - Links questions to their categories
   - Contains unique identifiers based on Hebrew descriptions**

3. `q_instances`:
   - Stores individual question instances
   - Links to parent questions
   - Contains survey-specific question data

## Main Scripts

1. `upsert_wxl_questions.py`:
   - Processes the `question_index.xlsx` file
   - Updates the wxl_questions table
   - Creates a unique id for each question, based on its hebrew description and some prefixes

2. `upsert_question_instances.py`:
   - Processes dta files and `question_index.xlsx` file
   - Updates the q_instances table
   - Links instances to their parent questions

3. `q_changes_extractor.py`:
   - Evaluates the changes between couples of question instances
   - Generates output files for the client's review
   - Tracks changes across different surveys
