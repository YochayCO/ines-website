# INES playground

This app was built using Vite (and NodeJS + NPM).

### Language: `Typescript`
### Framework: `React`
### Graph Library: `nivo` (based on d3)

## Setup

Clone the project from the github repository.

Enter the folder.

Run the following commands:
```
npm install
npm run dev
```
Open `localhost:5137` and enjoy the hmr.

## Scripts

*Our main inputs:*

## INES working file (index file for all survey questions)
Lists all questions from all surveys by category (tab), where "דמוגרפיה" is demography and the rest are "real" questions

For each question (row) and survey (column) the cell indicates what was the id of the question in that survey.

### What we don't yet have
- We don't yet have a mapping of each question and its type + scale.

- The file does not give an indication regarding the weights.

- It does not give an indication of 'special values', which are usually the same withing a survey but are not the same for all surveys.

### How we make up for absent data (TODO)

- The type + scale of the questions from the last 3 surveys are **hardcoded** to the survey meta json - `assets/surveys_meta/[survey_id].json`. The rest of the questions are **heuristically assumed to be categorial.**

- Weigths exist only in the last few surveys, and they start with either `w_` or `weight_` (for example `w_panel1` or `w_jews_panel1`). They're **hardcoded** using this heuristic **to each survey meta json.**

- Special values are treated like any other value