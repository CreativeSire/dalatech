import docx
from docx import Document
import sys

doc = Document('C:/Users/HomePC/Desktop/Trial website/Get Listed.docx')
full_text = []
for para in doc.paragraphs:
    full_text.append(para.text)

output = '\n'.join(full_text)
with open('tmp_get_listed_brief.txt', 'w', encoding='utf-8') as f:
    f.write(output)
print("Extracted successfully")
