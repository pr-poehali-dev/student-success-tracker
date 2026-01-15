#!/bin/bash
# Try to run the Python script to generate the Excel file

echo "Attempting to generate Excel file..."
echo ""

# Try python3 first
if command -v python3 &> /dev/null; then
    echo "Using python3..."
    python3 scripts/create_excel_import_example.py
    exit $?
fi

# Try python
if command -v python &> /dev/null; then
    echo "Using python..."
    python scripts/create_excel_import_example.py
    exit $?
fi

echo "Python not found. Please install Python 3."
exit 1
