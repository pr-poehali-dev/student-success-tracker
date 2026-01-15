#!/usr/bin/env python3
import zipfile
import os

def create_excel():
    os.makedirs("public", exist_ok=True)
    filepath = "public/import_example.xlsx"
    
    with zipfile.ZipFile(filepath, 'w', zipfile.ZIP_DEFLATED) as xlsx:
        xlsx.writestr('[Content_Types].xml', '''<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>''')
        
        xlsx.writestr('_rels/.rels', '''<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>''')
        
        xlsx.writestr('xl/_rels/workbook.xml.rels', '''<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>''')
        
        xlsx.writestr('xl/workbook.xml', '''<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
<sheet name="Классы" sheetId="1" r:id="rId1"/>
</sheets>
</workbook>''')
        
        xlsx.writestr('xl/sharedStrings.xml', '''<?xml version="1.0" encoding="UTF-8"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="21" uniqueCount="21">
<si><t>ID класса</t></si>
<si><t>Название класса</t></si>
<si><t>Количество учеников</t></si>
<si><t>Ответственный учитель ID</t></si>
<si><t>Ответственный учитель ФИО</t></si>
<si><t>class-001</t></si>
<si><t>5А</t></si>
<si><t>teacher-001</t></si>
<si><t>Иванов Иван Иванович</t></si>
<si><t>class-002</t></si>
<si><t>6Б</t></si>
<si><t>teacher-002</t></si>
<si><t>Петрова Мария Сергеевна</t></si>
<si><t>class-003</t></si>
<si><t>7В</t></si>
<si><t>teacher-003</t></si>
<si><t>Сидоров Алексей Петрович</t></si>
<si><t>class-004</t></si>
<si><t>8Г</t></si>
<si><t>teacher-004</t></si>
<si><t>Козлова Елена Владимировна</t></si>
</sst>''')
        
        xlsx.writestr('xl/worksheets/sheet1.xml', '''<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>
<row r="1">
<c r="A1" t="s"><v>0</v></c>
<c r="B1" t="s"><v>1</v></c>
<c r="C1" t="s"><v>2</v></c>
<c r="D1" t="s"><v>3</v></c>
<c r="E1" t="s"><v>4</v></c>
</row>
<row r="2">
<c r="A2" t="s"><v>5</v></c>
<c r="B2" t="s"><v>6</v></c>
<c r="C2"><v>25</v></c>
<c r="D2" t="s"><v>7</v></c>
<c r="E2" t="s"><v>8</v></c>
</row>
<row r="3">
<c r="A3" t="s"><v>9</v></c>
<c r="B3" t="s"><v>10</v></c>
<c r="C3"><v>28</v></c>
<c r="D3" t="s"><v>11</v></c>
<c r="E3" t="s"><v>12</v></c>
</row>
<row r="4">
<c r="A4" t="s"><v>13</v></c>
<c r="B4" t="s"><v>14</v></c>
<c r="C4"><v>23</v></c>
<c r="D4" t="s"><v>15</v></c>
<c r="E4" t="s"><v>16</v></c>
</row>
<row r="5">
<c r="A5" t="s"><v>17</v></c>
<c r="B5" t="s"><v>18</v></c>
<c r="C5"><v>26</v></c>
<c r="D5" t="s"><v>19</v></c>
<c r="E5" t="s"><v>20</v></c>
</row>
</sheetData>
</worksheet>''')
    
    print(f"✓ Файл создан: {os.path.abspath(filepath)}")

if __name__ == "__main__":
    create_excel()
