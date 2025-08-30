# **App Name**: Tabular.ai

## Core Features:

- PDF Table Extraction: Extract tables from uploaded PDF documents using OCR and AI-powered table detection tools. The tool should attempt to locate tables using geometric rules, and then fall back to trying to describe regions of the PDF page as tables to a LLM. If the LLM expresses confidence that a table has been found, use its reasoning to identify the likely columns.
- Table Preview and Editing: Display extracted tables in a preview format allowing users to review and manually correct any extraction errors. Table cells should be editable.
- Column Naming: Use a LLM to suggest names for unnamed columns.
- Data Structure Preservation: Maintain the original table structure during extraction, ensuring the exported data accurately reflects the layout of the source PDF.
- Export to Excel: Export extracted tables to Excel (.xlsx) files.
- Export to PDF: Export extracted tables to PDF files, maintaining the original table structure and formatting where possible.
- File Upload: Enable users to upload PDF files from their local system for table extraction.

## Style Guidelines:

- Primary color: Deep sky blue (#3EB489) to evoke data processing and clarity.
- Background color: Light gray (#F0F2F5) for a clean and neutral backdrop.
- Accent color: Yellow-green (#B2BEB5) to highlight key actions and interactive elements.
- Font: 'Inter', a sans-serif font with a modern, neutral look, for both headlines and body text.
- Use simple, geometric icons for actions like 'Upload,' 'Export,' and 'Edit.'
- A clean, organized layout with clear separation of sections for file upload, table preview, and export options.
- Subtle transitions and animations to enhance user experience, such as loading spinners during file processing and highlighting editable table cells.