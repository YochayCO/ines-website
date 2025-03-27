import pandas as pd
import re
import os

def parse_codebook(file_path):
    with open(file_path, 'r', encoding='ISO-8859-1') as f:
        content = f.read()
    
    survey_name = os.path.basename(file_path).replace('.txt', '')
    
    # Find the separator line (variating length of "===")
    separator_match = re.search(r'^(=+)$', content, re.MULTILINE)
    if not separator_match:
        raise ValueError("Unexpected file format - missing separator.")
    separator = separator_match.group(1)
    
    sections = content.split(separator)

    if len(sections) != 2:
        raise ValueError("Unexpected file format - missing separator.")
    
    question_section, answer_section = sections
    
    # Parsing questions
    questions = []
    category = None
    for first_line in question_section.splitlines():
        first_line = first_line.strip()
        if not first_line:
            continue
        
        if first_line.startswith("****"):
            category = first_line.replace("****", "").strip()
            continue
        
        match = re.match(r"(\S+)\s+(.+)", first_line)
        if match:
            qid, qtitle = match.groups()
            questions.append({
                'category': category,
                'question_id': qid.strip(),
                'question_title': qtitle.strip()
            })
    
    # Parsing answers
    answers_data = {}
    answer_blocks = re.split(r'\n{2,}', answer_section.strip())

    i = 0
    
    while i < len(answer_blocks) - 1:
        first_line = answer_blocks[i].strip()

        if first_line.startswith("****"):
            category = first_line.replace("****", "").strip()
            i += 1
            continue

        qid_title_row = first_line
        description_row = answer_blocks[i + 1].strip()

        if (i + 3) >= len(answer_blocks):
            answer_table_part = description_row
            meta_row = answer_blocks[i + 2].strip()
            description_row = ""
        elif (i + 2) >= len(answer_blocks):
            meta_row = description_row
            description_row = ""
            answer_table_part = ""
        else:
            answer_table_part = answer_blocks[i + 2].strip()
            meta_row = answer_blocks[i + 3].strip()
        
        qid_match = re.match(r"(\S+)\s+(.+)", qid_title_row)
        
        if not qid_match:
            i += 1
            continue
        
        if re.search(r"Data type:\s*(\S+)", description_row):
            meta_row = description_row
            description_row = ""
            answer_table_part = ""
        elif re.search(r"Data type:\s*(\S+)", answer_table_part):
            meta_row = answer_table_part
            answer_table_part = ""
            if re.search(r"VALUE\s*LABEL(.*)", description_row):
                answer_table_part = description_row
                description_row = ""

        type_match = re.search(r"Data type:\s*(\S+)", meta_row)
        rec_col_match = re.search(r"Record/columns?:\s*(\S+)/(\S+)", meta_row)
        
        qid, qtitle = qid_match.groups()
        qid = qid.strip()
        answers = []
        
        answer_lines = answer_table_part.split("\n")[1:]
        for row in answer_lines:
            parts = row.strip().split()
            if len(parts) >= 2:
                answers.append(f"{parts[0]}: {' '.join(parts[1:])}")
        
        answers_data[qid] = {
            'question_description': description_row.strip(),
            'question_data_type': type_match.group(1) if type_match else '',
            'record': rec_col_match.group(1) if rec_col_match else '',
            'columns': rec_col_match.group(2) if rec_col_match else '',
            'answers': '; '.join(answers)
        }

        if description_row == "" and answer_table_part == "":
            i += 2
        elif description_row == "" or answer_table_part == "":
            i += 3
        else:
            i += 4
    
    # Merging question and answer data
    data = []
    for q in questions:
        qid = q['question_id']
        ans_info = answers_data.get(qid, {})
        data.append({
            'survey_name': survey_name,
            'category': q['category'],
            'record': ans_info.get('record', ''),
            'columns': ans_info.get('columns', ''),
            'question_id': qid,
            'question_title': q['question_title'],
            'question_description': ans_info.get('question_description', ''),
            'question_data_type': ans_info.get('question_data_type', ''),
            'answers': ans_info.get('answers', '')
        })
    
    df = pd.DataFrame(data)
    output_file = os.path.join("/home/yochayc/INES/playground", f"{survey_name}.xlsx")
    df.to_excel(output_file, index=False)
    print(f"Excel file saved as {output_file}")



# Main code
input_file = os.path.join("/home/yochayc/INES/playground", "codebooks", "2006.txt")
parse_codebook(input_file)
