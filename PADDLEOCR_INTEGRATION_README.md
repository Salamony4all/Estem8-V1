# PaddleOCR API Integration - Quick Start

## 🚀 What's Been Added

A complete integration with PaddleOCR API via Gradio interface for advanced document processing.

## 📁 New Files

```
src/
├── lib/
│   └── paddleOCRClient.ts          # PaddleOCR API client utilities
├── app/
│   ├── api/ocr/process-document/
│   │   └── route.ts                # Server-side API endpoint
│   └── ocr-demo/
│       └── page.tsx                # Demo page
└── components/
    └── document-processor.tsx      # React component for document processing

scripts/
└── test-paddleocr.js              # CLI test script

docs/
└── PADDLEOCR_GRADIO_INTEGRATION.md # Full documentation

.env                                # Updated with new API endpoint
```

## ⚡ Quick Start

### 1. Environment is already configured

Your `.env` file has been updated with:
```bash
NEXT_PUBLIC_PADDLEOCR_API_URL=https://app-u613z0mda075e806.aistudio-app.com/handle_complex_doc
```

### 2. Dependencies installed

```bash
✓ axios
✓ form-data
```

### 3. Test the integration

#### Option A: Use the test script
```bash
node scripts/test-paddleocr.js /path/to/your/document.pdf
```

#### Option B: Try the web interface
```bash
npm run dev
# Navigate to http://localhost:3000/ocr-demo
```

#### Option C: Test the API endpoint
```bash
curl -X POST http://localhost:3000/api/ocr/process-document \
  -F "file=@/path/to/document.pdf" \
  -F "mode=complex"
```

## 🎯 Features

✅ **Complex Document Processing**
- Table extraction
- Layout analysis
- Structure preservation
- Chart recognition (optional)

✅ **Targeted Recognition**
- Fast OCR for simple documents
- Text-only extraction

✅ **Multiple Formats**
- PDF files
- Images (PNG, JPEG, WebP)

## 💡 Usage Examples

### In Your Code

```typescript
import { processComplexDocument } from '@/lib/paddleOCRClient';

const result = await processComplexDocument('/path/to/doc.pdf', true);
console.log(result.markdown);
```

### In a Component

```tsx
import DocumentProcessor from '@/components/document-processor';

export default function MyPage() {
  return <DocumentProcessor />;
}
```

### Via CLI

```bash
# Basic processing
node scripts/test-paddleocr.js document.pdf

# With chart recognition
node scripts/test-paddleocr.js document.pdf --chart
```

## 📊 API Endpoints

| Endpoint | Description | Speed |
|----------|-------------|-------|
| `/handle_complex_doc` | Full document analysis | 5-30s |
| `/handle_targeted_recognition` | Simple OCR | 1-10s |

## 🔧 Configuration Options

```typescript
// Complex mode with all features
processComplexDocument(filePath, true)  // Enable charts

// Simple mode for speed
processTargetedRecognition(filePath)
```

## 📝 Output Format

```json
{
  "markdown": "# Extracted text in markdown format",
  "visualizationHtml": "<div>HTML visualization of layout</div>",
  "sourceCode": "Raw markdown source"
}
```

## 🌐 Demo Page

Visit `/ocr-demo` to see a full-featured interface with:
- File upload
- Processing mode selection
- Real-time progress
- Tabbed results view
- Copy to clipboard

## 📚 Documentation

For detailed documentation, see:
- [Full Integration Guide](./PADDLEOCR_GRADIO_INTEGRATION.md)
- [API Endpoints](./API_ENDPOINTS.md)

## 🎨 Component Usage

The `DocumentProcessor` component is ready to use:

```tsx
<DocumentProcessor 
  onProcessingComplete={(result) => {
    console.log('Done!', result);
  }}
/>
```

## 🐛 Troubleshooting

**API not responding?**
```bash
curl -I https://app-u613z0mda075e806.aistudio-app.com/
```

**Dependencies missing?**
```bash
npm install axios form-data
```

**Test failing?**
- Check file path exists
- Verify file is PDF or image
- Check internet connection

## 🚦 Next Steps

1. Try the demo: `npm run dev` → `http://localhost:3000/ocr-demo`
2. Test with your documents: `node scripts/test-paddleocr.js your-file.pdf`
3. Integrate into your app: Import and use the components/utilities

## 📞 Support

- Check `docs/PADDLEOCR_GRADIO_INTEGRATION.md` for detailed info
- View API docs: https://app-u613z0mda075e806.aistudio-app.com/

---

**Status**: ✅ Ready to use!
