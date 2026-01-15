# Excel Import Example File

## File Location
`public/import_example.xlsx`

## Description
This is an Excel file template for importing class data into the system. Users can download this file as a reference when preparing their own class data for import.

## File Structure

### Sheet Name
- **Классы** (Classes)

### Columns

| Column Name | Type | Example | Description |
|------------|------|---------|-------------|
| ID класса | Text | class-001 | Unique identifier for the class |
| Название класса | Text | 5А | Class name (e.g., 5А, 6Б, 7В, 8Г) |
| Количество учеников | Number | 25 | Number of students in the class |
| Ответственный учитель ID | Text | teacher-001 | ID of the responsible teacher |
| Ответственный учитель ФИО | Text | Иванов Иван Иванович | Full name of the responsible teacher |

### Example Data

The file contains 4 example rows:

1. **Class 5А**
   - ID: class-001
   - Students: 25
   - Teacher: Иванов Иван Иванович (teacher-001)

2. **Class 6Б**
   - ID: class-002
   - Students: 28
   - Teacher: Петрова Мария Сергеевна (teacher-002)

3. **Class 7В**
   - ID: class-003
   - Students: 23
   - Teacher: Сидоров Алексей Петрович (teacher-003)

4. **Class 8Г**
   - ID: class-004
   - Students: 26
   - Teacher: Козлова Елена Владимировна (teacher-004)

## Usage

### For End Users
1. Download the file from: `/import_example.xlsx`
2. Open it in Excel, Google Sheets, or any spreadsheet application
3. Replace the example data with your actual class data
4. Keep the same column headers and structure
5. Upload the modified file to the import function

### For Developers

#### Regenerating the File

If you need to regenerate the file, you have several options:

**Option 1: Python Script (No dependencies)**
```bash
python3 create-excel-final.py
```

**Option 2: Python Script (With styling - requires openpyxl or xlsxwriter)**
```bash
python3 scripts/create_excel_import_example.py
```

**Option 3: Node.js Script (requires xlsx package)**
```bash
node create-excel.js
```

**Option 4: Using bun**
```bash
bun generate-import-example.ts
```

#### Accessing the File in Code

The file is served as a static asset from the `public` directory and can be accessed at:
```
/import_example.xlsx
```

Example download link in React:
```tsx
<a href="/import_example.xlsx" download="import_example.xlsx">
  Download Import Template
</a>
```

## Technical Details

### File Format
- Format: XLSX (Office Open XML Spreadsheet)
- Structure: ZIP archive containing XML files
- Compatible with: Microsoft Excel, Google Sheets, LibreOffice Calc, and other spreadsheet applications

### File Size
Approximately 2-3 KB

### Character Encoding
UTF-8 (supports Cyrillic characters)

## Notes

- The file uses Russian language for column headers and example names
- All text fields support Unicode/UTF-8 characters
- The number field (Количество учеников) should contain only numeric values
- IDs should be unique within their respective categories
