# PaddleOCR Gradio API Integration

This document describes the integration of the PaddleOCR API hosted on Baidu AI Studio using the Gradio interface.

## Overview

The integration uses a Gradio-based PaddleOCR service that provides multiple endpoints for document processing:

- **Complex Document Processing**: Full document analysis with table extraction, layout detection, and OCR
- **Targeted Recognition**: Simplified OCR for basic text extraction
- **Chart Recognition**: Optional enhancement for documents containing charts and diagrams

## API Endpoint

```
Base URL: https://app-u613z0mda075e806.aistudio-app.com
```

### Available Endpoints

1. **Complex Document Processing** (Primary)
   - Endpoint: `/handle_complex_doc`
   - Method: POST
   - Input: File (PDF or image) + options
   - Output: [markdown, visualization_html, source_code]

2. **Targeted Recognition**
   - Endpoint: `/handle_targeted_recognition`
   - Method: POST
   - Input: File (PDF or image)
   - Output: [markdown, raw_output]

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# PaddleOCR Gradio API endpoint
NEXT_PUBLIC_PADDLEOCR_API_URL=https://app-u613z0mda075e806.aistudio-app.com/handle_complex_doc

# Optional: API Key (if authentication is required)
NEXT_PUBLIC_PADDLEOCR_API_KEY=your_api_key_here
```

## Implementation

### 1. Utility Module (`src/lib/paddleOCRClient.ts`)

Provides two main functions:

```typescript
// Process complex documents with full analysis
processComplexDocument(filePath: string, useChartRecognition?: boolean)

// Process documents with simple OCR
processTargetedRecognition(filePath: string)
```

### 2. API Route (`src/app/api/ocr/process-document/route.ts`)

Server-side Next.js API route that:
- Receives file uploads from the client
- Saves files temporarily
- Calls PaddleOCR API
- Returns processed results
- Cleans up temporary files

### 3. React Component (`src/components/document-processor.tsx`)

User interface component featuring:
- File upload with drag-and-drop
- Processing mode selection
- Chart recognition toggle
- Progress indicator
- Results display with tabs

### 4. Demo Page (`src/app/ocr-demo/page.tsx`)

Full-featured demo page showcasing the integration.

## Usage

### Using the Web Interface

1. Navigate to `/ocr-demo`
2. Select processing mode (Complex or Targeted)
3. Optionally enable chart recognition
4. Upload a PDF or image file
5. Click "Process Document"
6. View results in multiple tabs

### Using the API Programmatically

```typescript
import { processComplexDocument } from '@/lib/paddleOCRClient';

// Process a document
const result = await processComplexDocument('/path/to/document.pdf', true);

console.log(result.markdown);           // Extracted text
console.log(result.visualizationHtml);  // HTML visualization
console.log(result.sourceCode);         // Source markdown
```

### Using the Test Script

```bash
# Basic usage
node scripts/test-paddleocr.js /path/to/document.pdf

# With chart recognition
node scripts/test-paddleocr.js /path/to/document.pdf --chart

# Results are saved to paddleocr-output/
```

## Testing

### 1. Test the API directly

```bash
node scripts/test-paddleocr.js /path/to/test-document.pdf
```

### 2. Test via the web interface

```bash
npm run dev
# Open http://localhost:3000/ocr-demo
```

### 3. Test the API route

```bash
curl -X POST http://localhost:3000/api/ocr/process-document \
  -F "file=@/path/to/document.pdf" \
  -F "mode=complex" \
  -F "useChartRecognition=false"
```

## API Response Format

### Complex Document Processing

```json
{
  "markdown": "# Extracted content...",
  "visualizationHtml": "<div>...</div>",
  "sourceCode": "# Source markdown..."
}
```

### Targeted Recognition

```json
{
  "markdown": "# Extracted content...",
  "rawOutput": "{...}"
}
```

## Supported File Formats

- **PDF**: `.pdf`
- **Images**: `.png`, `.jpg`, `.jpeg`, `.webp`

## Performance Considerations

- **Complex Mode**: 2-30 seconds depending on document complexity
- **Targeted Mode**: 1-10 seconds for simpler OCR
- **Chart Recognition**: Adds 20-50% processing time
- **File Size Limit**: Recommended max 10MB per file

## Error Handling

The integration includes comprehensive error handling:

1. **Client-side validation**: File type and size checks
2. **API timeout**: 2-minute timeout for complex documents
3. **Cleanup**: Automatic temporary file deletion
4. **User feedback**: Clear error messages in the UI

## Troubleshooting

### Connection Issues

```bash
# Test API availability
curl -I https://app-u613z0mda075e806.aistudio-app.com/
```

### Timeout Errors

- Reduce file size
- Disable chart recognition
- Use targeted recognition mode

### Missing Dependencies

```bash
npm install axios form-data
```

## API Statistics

Based on the API documentation:

| Endpoint | Total Requests | Success Rate | p50 / p90 / p99 |
|----------|---------------|--------------|-----------------|
| `/handle_complex_doc` | 340 | 94% | 0ms / 0ms / 0ms |
| `/handle_targeted_recognition` | 35 | 97% | 0ms / 0ms / 0ms |

## Additional Resources

- [PaddleOCR GitHub](https://github.com/PaddlePaddle/PaddleOCR)
- [Baidu AI Studio](https://aistudio.baidu.com/)
- [Gradio Documentation](https://gradio.app/docs/)

## Next Steps

1. **Batch Processing**: Implement multi-file processing
2. **Caching**: Add result caching for repeated requests
3. **Queue System**: Handle concurrent requests efficiently
4. **Export Options**: Add PDF, Excel, JSON export formats
