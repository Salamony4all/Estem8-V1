# Quick Start Guide

This guide will help you get started with the Estem8-V1 PDF table extraction application.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- (Optional) Python 3.8+ for native PaddleOCR extraction

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Salamony4all/Estem8-V1.git
   cd Estem8-V1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Edit `.env.local` and add your API keys:**
   - `GOOGLE_API_KEY` - Required for AI-based (legacy) extraction
   - `NEXT_PUBLIC_PADDLEOCR_API_KEY` - Optional, for PaddleOCR cloud API

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to http://localhost:9002

## Using the Application

### Step 1: Choose an Extraction Method

When you open the application, you'll see a dropdown menu to select the extraction method:

#### Option 1: PaddleOCR API (Recommended) ⭐
- **Best for**: Most users, production use
- **Pros**: 
  - 100% accurate OCR extraction
  - No setup required
  - Fast processing
  - Works immediately
- **Setup**: None required!

#### Option 2: PaddleOCR Native
- **Best for**: Privacy-conscious users, offline use
- **Pros**:
  - 100% accurate OCR extraction
  - Complete data privacy
  - Offline capability
- **Setup**: See [Setting up Native PaddleOCR](#setting-up-native-paddleocr) below

#### Option 3: AI-based (Legacy)
- **Best for**: Users who already have Google API setup
- **Pros**:
  - Easy setup if you have Google API key
- **Cons**:
  - May not be as accurate as PaddleOCR
- **Setup**: Add `GOOGLE_API_KEY` to `.env.local`

### Step 2: Upload a PDF

1. Click the file upload area or drag and drop a PDF file
2. Wait for the extraction to complete
3. Review the extracted tables

### Step 3: Edit Tables (Optional)

- Click on any cell to edit its value
- Use the table viewer controls to navigate
- Changes are saved automatically

### Step 4: Configure Costing

Set your costing factors:
- **Net Margin**: Your profit margin percentage
- **Freight**: Shipping cost percentage
- **Customs**: Import duties percentage
- **Installation**: Installation cost percentage

Choose currencies:
- **From**: Source currency in the PDF
- **To**: Target currency for quotation

### Step 5: Add Client Details

Fill in the client information:
- Date
- Reference Number
- Project Name
- Contact Person
- Contact Number

### Step 6: Generate Quotation

1. Click "Generate Quotation" button
2. Review the calculated quotation
3. Export to PDF or Excel

### Step 7: Export

Choose your export format:
- **Export to PDF**: Professional quotation document
- **Export to Excel**: Editable spreadsheet format

## Setting up Native PaddleOCR

If you want to use the native PaddleOCR extraction method:

### Quick Setup (Automated)

**On Linux/Mac:**
```bash
./setup-paddleocr.sh
```

**On Windows:**
```
setup-paddleocr.bat
```

### Manual Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start PaddleOCR service:**
   ```bash
   python paddleocr_service.py
   ```

3. **Keep the service running** in a separate terminal

4. **In the application**, select "PaddleOCR (Native)" from the dropdown

For detailed setup instructions, see [PaddleOCR Setup Guide](PADDLEOCR_SETUP.md).

## Tips and Best Practices

### For Best Extraction Results:

1. **Use clear, high-quality PDFs**
   - Avoid scanned images with poor quality
   - Ensure text is readable

2. **Choose the right method**
   - Use PaddleOCR API for most cases
   - Use PaddleOCR Native if you need offline processing
   - Use AI-based if you already have Google API setup

3. **Review extracted data**
   - Always review the extracted tables
   - Edit any cells that need correction
   - Verify calculations before exporting

### For Accurate Quotations:

1. **Set correct costing factors**
   - Review your margin and cost percentages
   - Ensure they reflect current market conditions

2. **Select proper currencies**
   - Double-check source and target currencies
   - Verify exchange rates

3. **Complete client details**
   - Fill in all required fields
   - Use clear reference numbers

## Troubleshooting

### Common Issues

**Issue**: "No tables could be found in the provided PDF"
- **Solution**: Try a different extraction method, or ensure your PDF contains tables

**Issue**: PaddleOCR Native not working
- **Solution**: Ensure PaddleOCR service is running on localhost:8866

**Issue**: Extraction is slow
- **Solution**: 
  - Try PaddleOCR API instead of Native
  - Check your internet connection
  - Ensure your PDF file isn't too large

**Issue**: Incorrect currency conversion
- **Solution**: Verify the "From" and "To" currency selections

### Getting Help

1. Check the [PaddleOCR Setup Guide](PADDLEOCR_SETUP.md)
2. Review the troubleshooting section in the setup guide
3. Open an issue on GitHub with:
   - Description of the problem
   - Steps to reproduce
   - Screenshots if applicable

## Next Steps

- Explore the [PaddleOCR Setup Guide](PADDLEOCR_SETUP.md) for advanced configuration
- Check the main README.md for project structure and development guidelines
- Customize the costing factors for your business needs

## Support

For questions or issues, please:
1. Check this guide and the setup documentation
2. Search existing GitHub issues
3. Open a new issue if needed

Happy extracting! 🎉
