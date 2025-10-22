import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const PADDLEOCR_API_URL = process.env.NEXT_PUBLIC_PADDLEOCR_API_URL || 
  'https://app-u613z0mda075e806.aistudio-app.com/handle_complex_doc';
const PADDLEOCR_API_KEY = process.env.NEXT_PUBLIC_PADDLEOCR_API_KEY;

interface ComplexDocumentResult {
  markdown: string;
  visualizationHtml: string;
  sourceCode: string;
}

interface TargetedRecognitionResult {
  markdown: string;
  rawOutput: string;
}

/**
 * Process a document using PaddleOCR's complex document recognition
 * This endpoint handles PDFs and images with table extraction, layout analysis, and OCR
 * 
 * @param filePath - Path to the file to process
 * @param useChartRecognition - Whether to enable chart recognition
 * @returns Object containing markdown, visualization HTML, and source code
 */
export async function processComplexDocument(
  filePath: string, 
  useChartRecognition = false
): Promise<ComplexDocumentResult> {
  try {
    const formData = new FormData();
    formData.append('file_path', fs.createReadStream(filePath));
    formData.append('use_chart_recognition', useChartRecognition ? 'true' : 'false');
    
    const response = await axios.post(
      PADDLEOCR_API_URL,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          ...(PADDLEOCR_API_KEY ? { 'Authorization': `Bearer ${PADDLEOCR_API_KEY}` } : {})
        },
        timeout: 120000, // 2 minute timeout for large documents
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    // The API returns a tuple of 3 elements: [markdown, visualizationHtml, sourceCode]
    if (Array.isArray(response.data) && response.data.length >= 3) {
      return {
        markdown: response.data[0],
        visualizationHtml: response.data[1],
        sourceCode: response.data[2]
      };
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error: any) {
    console.error('Error processing document with PaddleOCR:', error);
    
    if (error.response) {
      throw new Error(`PaddleOCR API error (${error.response.status}): ${error.response.data || error.message}`);
    }
    
    throw new Error(`PaddleOCR API error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Process a document using PaddleOCR's targeted recognition
 * This is optimized for simpler OCR tasks without complex layout analysis
 * 
 * @param filePath - Path to the file to process
 * @returns Object containing markdown and raw output
 */
export async function processTargetedRecognition(
  filePath: string
): Promise<TargetedRecognitionResult> {
  try {
    const formData = new FormData();
    formData.append('file_path', fs.createReadStream(filePath));
    
    const response = await axios.post(
      'https://app-u613z0mda075e806.aistudio-app.com/handle_targeted_recognition',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          ...(PADDLEOCR_API_KEY ? { 'Authorization': `Bearer ${PADDLEOCR_API_KEY}` } : {})
        },
        timeout: 60000, // 1 minute timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    // The API returns a tuple of 2 elements: [markdown, rawOutput]
    if (Array.isArray(response.data) && response.data.length >= 2) {
      return {
        markdown: response.data[0],
        rawOutput: response.data[1]
      };
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error: any) {
    console.error('Error with targeted recognition:', error);
    
    if (error.response) {
      throw new Error(`PaddleOCR API error (${error.response.status}): ${error.response.data || error.message}`);
    }
    
    throw new Error(`PaddleOCR API error: ${error.message || 'Unknown error'}`);
  }
}
