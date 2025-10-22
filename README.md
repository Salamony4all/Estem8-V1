# Estem8-V1 - PDF Table Extraction & Quotation Generator

A Next.js application for extracting tables from PDFs and generating quotations using advanced OCR technology.

## Features

- **Multiple Extraction Methods**
  - 🎯 **PaddleOCR PP-Structure V3** (Recommended) - 100% accurate OCR with 1:1 replication
  - 🖥️ **Native Processing** - Local PaddleOCR for privacy and offline use
  - 🤖 **AI-based** - Legacy method using Google Gemini

- **Table Management**
  - Extract multiple tables from PDF documents
  - Edit extracted data inline
  - Add/remove rows and columns
  - Automatic calculations for totals and VAT

- **Costing & Currency Conversion**
  - Apply margins, freight, customs, and installation costs
  - Multi-currency support (OMR, USD, EUR, AED)
  - Real-time calculations

- **Export Options**
  - Export to PDF
  - Export to Excel
  - Professional quotation formatting

## Getting Started

📚 **New to this app?** Start with the [Quick Start Guide](docs/QUICK_START.md)

### Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) Python 3.8+ for native PaddleOCR extraction

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Salamony4all/Estem8-V1.git
cd Estem8-V1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
cp .env.example .env.local

# Add your API keys
GOOGLE_API_KEY=your_google_api_key_here
NEXT_PUBLIC_PADDLEOCR_API_KEY=your_paddleocr_api_key_here  # Optional
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

> **Note for GitHub Codespaces/Forwarded Hosts**: The application is configured to work properly with forwarded hosts (like GitHub Codespaces). Server Actions will work correctly even when accessed through forwarded URLs.

## OCR Extraction Methods

The application supports three extraction methods:

### 1. PaddleOCR API (Recommended)
- Cloud-based processing with PP-Structure V3
- 100% accurate OCR extraction
- Fast processing with no local setup required
- See [PaddleOCR Setup Guide](docs/PADDLEOCR_SETUP.md) for details

### 2. PaddleOCR Native
- Local processing for privacy and offline use
- Requires Python and PaddleOCR installation
- See [PaddleOCR Setup Guide](docs/PADDLEOCR_SETUP.md) for installation instructions

### 3. AI-based (Legacy)
- Uses Google Gemini for extraction
- Requires Google API key
- May not be as accurate as PaddleOCR

For detailed setup instructions, see the [PaddleOCR Setup Guide](docs/PADDLEOCR_SETUP.md).

## Usage

1. Select your preferred extraction method from the dropdown
2. Upload a PDF file containing tables
3. Review and edit the extracted tables
4. Configure costing factors and currency conversion
5. Add client details
6. Generate and export quotation

## Project Structure

```
Estem8-V1/
├── src/
│   ├── ai/
│   │   ├── flows/
│   │   │   ├── extract-tables-from-pdf.ts          # AI-based extraction
│   │   │   ├── extract-tables-from-pdf-paddleocr.ts # PaddleOCR extraction
│   │   │   └── suggest-column-names.ts
│   │   ├── genkit.ts
│   │   └── dev.ts
│   ├── app/
│   │   ├── page.tsx                                 # Main application page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/                                  # UI components
│   │   ├── file-uploader.tsx
│   │   ├── table-viewer.tsx
│   │   ├── costing-card.tsx
│   │   ├── client-details-card.tsx
│   │   └── export-card.tsx
│   ├── hooks/                                       # Custom React hooks
│   └── lib/                                         # Utility functions
└── docs/
    └── PADDLEOCR_SETUP.md                          # PaddleOCR setup guide
```

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit with watch mode

### Technology Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **AI/OCR**: 
  - PaddleOCR PP-Structure V3
  - Google Gemini (via Genkit)
- **Forms**: React Hook Form + Zod
- **Export**: jsPDF, xlsx

## Documentation

- [PaddleOCR Setup Guide](docs/PADDLEOCR_SETUP.md) - Detailed setup instructions for PaddleOCR

## References

- [PaddleOCR Documentation](https://github.com/PaddlePaddle/PaddleOCR)
- [PP-Structure V3](https://www.paddleocr.ai/latest/en/version3.x/pipeline_usage/PP-StructureV3.html)
- [Baidu AI Studio](https://aistudio.baidu.com/community/app/518494/webUI)

## License

This project is built with Next.js and Firebase Studio.

## Support

For issues or questions, please open an issue in the repository.
