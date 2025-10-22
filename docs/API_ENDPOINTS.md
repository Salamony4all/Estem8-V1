# PaddleOCR API Endpoints

This document describes the PaddleOCR API endpoints used in this application.

## Overview

The application supports two types of PaddleOCR integration:

1. **Cloud API**: Uses Baidu AI Studio's PaddleOCR service
2. **Local API**: Uses a local PaddleOCR service running on your machine

## Cloud API (PaddleOCR API Method)

### Endpoint Configuration

The application is configured to use Baidu AI Studio's PaddleOCR API. However, the exact endpoint may vary depending on the service availability.

#### Primary Endpoint (Configured)
```
https://aistudio.baidu.com/api/pp-structure/v3/extract
```

#### Alternative Endpoints

If the primary endpoint is not accessible, you may need to use one of these alternatives:

1. **Community Application**:
   - URL: https://aistudio.baidu.com/community/app/518494/webUI
   - This is the web UI for testing. The API endpoint may be different.

2. **Application Details**:
   - URL: https://aistudio.baidu.com/application/detail/98365
   - Check this page for the latest API endpoint information.

### Important Notes

⚠️ **API Endpoint Status**: The PaddleOCR cloud API endpoint used in this application may need to be updated based on:
- Baidu AI Studio's current API version
- Your access level (free vs. paid)
- Regional availability

### How to Update the API Endpoint

If you need to change the API endpoint:

1. **Option 1**: Update the environment variable
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_PADDLEOCR_API_URL=https://your-endpoint-here
   ```

2. **Option 2**: Modify the code directly
   Edit `src/ai/flows/extract-tables-from-pdf-paddleocr.ts`:
   ```typescript
   const apiUrl = process.env.NEXT_PUBLIC_PADDLEOCR_API_URL || 
                  'https://aistudio.baidu.com/api/pp-structure/v3/extract';
   ```

### API Authentication

The API may require authentication. There are several methods:

1. **API Key** (Recommended for production):
   ```bash
   NEXT_PUBLIC_PADDLEOCR_API_KEY=your_api_key_here
   ```

2. **OAuth Token** (For advanced users):
   Some endpoints may require OAuth authentication.

3. **No Authentication** (For testing):
   Some public endpoints may not require authentication.

### Getting an API Key

To obtain an API key:

1. Visit [Baidu AI Studio](https://aistudio.baidu.com/)
2. Create an account or sign in
3. Navigate to your profile or API settings
4. Generate an API key for PaddleOCR
5. Add it to your `.env.local` file

### API Request Format

The application sends requests in this format:

```json
{
  "pdf_data": "base64_encoded_pdf_data",
  "use_gpu": false,
  "lang": "en"
}
```

### Expected Response Format

The API should return a response in this format:

```json
{
  "result": [
    {
      "type": "table",
      "bbox": [x1, y1, x2, y2],
      "res": {
        "html": "<table>...</table>",
        "cells": [...],
        "structure": "..."
      }
    }
  ],
  "status": "success"
}
```

## Local API (PaddleOCR Native Method)

### Default Endpoint

```
http://localhost:8866/predict/pp_structure_v3
```

### Configuration

You can change the local endpoint in `.env.local`:

```bash
PADDLEOCR_LOCAL_URL=http://localhost:8866/predict/pp_structure_v3
```

### Starting the Local Service

```bash
python paddleocr_service.py
```

The service will start on `http://localhost:8866` by default.

### Request Format

Same as the cloud API:

```json
{
  "pdf_data": "base64_encoded_pdf_data",
  "lang": "en"
}
```

### Response Format

Same as the cloud API response format.

## Testing the API

### Using cURL

Test the cloud API:
```bash
curl -X POST https://aistudio.baidu.com/api/pp-structure/v3/extract \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"pdf_data": "BASE64_PDF_DATA", "lang": "en"}'
```

Test the local API:
```bash
curl -X POST http://localhost:8866/predict/pp_structure_v3 \
  -H "Content-Type: application/json" \
  -d '{"pdf_data": "BASE64_PDF_DATA", "lang": "en"}'
```

### Using the Application

The easiest way to test is to use the application itself:

1. Start the Next.js app: `npm run dev`
2. Select "PaddleOCR (API)" or "PaddleOCR (Native)"
3. Upload a PDF file
4. Check the browser console for API requests/responses

## Troubleshooting

### Cloud API Issues

**Problem**: API returns 401 Unauthorized
- **Solution**: Check if you need an API key. Add it to `.env.local`

**Problem**: API returns 404 Not Found
- **Solution**: The endpoint may have changed. Check the [Baidu AI Studio](https://aistudio.baidu.com/) documentation for the current endpoint.

**Problem**: CORS errors
- **Solution**: This is expected in development. The API should work when deployed or you may need to use a proxy.

**Problem**: Rate limiting
- **Solution**: Wait a few minutes or upgrade to a paid tier.

### Local API Issues

**Problem**: Connection refused
- **Solution**: Ensure the PaddleOCR service is running:
  ```bash
  python paddleocr_service.py
  ```

**Problem**: Service fails to start
- **Solution**: Check if port 8866 is already in use:
  ```bash
  # On Linux/Mac
  lsof -i :8866
  
  # On Windows
  netstat -ano | findstr :8866
  ```

**Problem**: Slow processing
- **Solution**: 
  - Use GPU acceleration if available
  - Reduce PDF file size
  - Use smaller images

## Alternative APIs

If Baidu AI Studio's API is not accessible, consider these alternatives:

### 1. Self-Hosted PaddleOCR API
Set up your own PaddleOCR API server on a cloud provider.

### 2. PaddleOCR Docker Container
Use the official PaddleOCR Docker image:
```bash
docker pull paddlepaddle/paddle:latest-dev
```

### 3. Other OCR Services
While not PaddleOCR, these alternatives might work:
- Google Cloud Vision API
- Amazon Textract
- Azure Computer Vision
- Tesseract OCR

## Updating the Code

If you need to support a different API, update these files:

1. `src/ai/flows/extract-tables-from-pdf-paddleocr.ts`:
   - Update `extractWithPaddleOCRAPI()` function
   - Modify request format
   - Adjust response parsing

2. `.env.example`:
   - Add new environment variables

3. `docs/PADDLEOCR_SETUP.md`:
   - Update setup instructions

## Support

For API-specific issues:
1. Check the [PaddleOCR GitHub repository](https://github.com/PaddlePaddle/PaddleOCR)
2. Visit [Baidu AI Studio](https://aistudio.baidu.com/)
3. Open an issue in this repository with API details

## References

- [PaddleOCR GitHub](https://github.com/PaddlePaddle/PaddleOCR)
- [PP-Structure V3 Documentation](https://www.paddleocr.ai/latest/en/version3.x/pipeline_usage/PP-StructureV3.html)
- [Baidu AI Studio](https://aistudio.baidu.com/community/app/518494/webUI)
- [Application Details](https://aistudio.baidu.com/application/detail/98365)
