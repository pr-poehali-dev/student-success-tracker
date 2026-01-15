# How to Generate the Excel Import Example File

## Quick Start

Run this command from the project root:

```bash
python3 generate-excel-import.py
```

This will create: `public/import_example.xlsx`

## Requirements

- Python 3.x (no additional packages needed)
- The script uses only Python standard library (`zipfile`, `os`, `sys`)

## What Gets Created

The script creates an Excel file (`public/import_example.xlsx`) with:

- **Sheet name**: Классы
- **Columns**: 5 columns with Russian headers
- **Data**: 4 example rows with realistic class data

## File Structure

```
public/import_example.xlsx
```

This file will contain:

| ID класса | Название класса | Количество учеников | Ответственный учитель ID | Ответственный учитель ФИО |
|-----------|----------------|---------------------|--------------------------|---------------------------|
| class-001 | 5А             | 25                  | teacher-001              | Иванов Иван Иванович      |
| class-002 | 6Б             | 28                  | teacher-002              | Петрова Мария Сергеевна   |
| class-003 | 7В             | 23                  | teacher-003              | Сидоров Алексей Петрович  |
| class-004 | 8Г             | 26                  | teacher-004              | Козлова Елена Владимировна|

## Alternative Methods

If you have the dependencies installed, you can also use:

### Option 1: With openpyxl/xlsxwriter (better formatting)
```bash
python3 scripts/create_excel_import_example.py
```

### Option 2: With Node.js and xlsx package
```bash
node create-excel.js
```

### Option 3: With bun
```bash
bun generate-import-example.ts
```

## Verification

After running the script, verify the file was created:

```bash
ls -lh public/import_example.xlsx
```

You should see a file approximately 2-3 KB in size.

## Using the File

The generated file can be:
- Downloaded by users from `/import_example.xlsx`
- Used as a template for importing class data
- Opened in Excel, Google Sheets, LibreOffice Calc, etc.

## Troubleshooting

### Python not found
Make sure Python 3 is installed:
```bash
python3 --version
```

### Permission denied
Make sure you have write permissions in the project directory.

### File not created
Check if the `public/` directory exists. The script creates it if it doesn't, but you may need to run it from the project root directory.

## Technical Details

The script creates a valid XLSX file by:
1. Creating a ZIP archive (XLSX is a ZIP file format)
2. Adding the required XML files that define the spreadsheet structure
3. Using UTF-8 encoding to support Cyrillic characters
4. Following the Office Open XML specification

No external libraries are required - it uses only Python's built-in `zipfile` module!
