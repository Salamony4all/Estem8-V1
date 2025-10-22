'use server';
/**
 * @fileOverview Enhanced PaddleOCR extraction using Gradio API
 * 
 * This is an alternative extraction method that uses the Gradio-based PaddleOCR API
 * hosted on Baidu AI Studio. It provides complex document processing with layout analysis.
 */

import { z } from 'genkit';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { processComplexDocument } from '@/lib/paddleOCRClient';

// Input schema
const ExtractTablesFromPdfGradioInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  useChartRecognition: z.boolean().default(false).describe('Enable chart recognition for better accuracy'),
});
export type ExtractTablesFromPdfGradioInput = z.infer<typeof ExtractTablesFromPdfGradioInputSchema>;

// Table schema
const TableSchema = z.object({
  columnNames: z.array(z.string()).describe('The names of the columns in the table'),
  rows: z.array(z.array(z.string())).describe('The rows of the table, with each row being an array of strings representing the cells.'),
});
export type Table = z.infer<typeof TableSchema>;

// Output schema
const ExtractTablesFromPdfGradioOutputSchema = z.object({
  tables: z.array(TableSchema).describe('The extracted tables from the PDF document'),
  markdown: z.string().describe('Full markdown content extracted from the document'),
  visualizationHtml: z.string().optional().describe('HTML visualization of the document layout'),
  processingTime: z.number().optional().describe('Processing time in milliseconds'),
});
export type ExtractTablesFromPdfGradioOutput = z.infer<typeof ExtractTablesFromPdfGradioOutputSchema>;

/**
 * Parse markdown tables into structured data
 */
function parseMarkdownTables(markdown: string): Table[] {
  const tables: Table[] = [];
  
  // Split by lines and find table blocks
  const lines = markdown.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Check if this is a table header (contains | characters)
    if (line.startsWith('|') && line.endsWith('|')) {
      const headerLine = line;
      const separatorLine = lines[i + 1]?.trim();
      
      // Verify separator line (contains | and - characters)
      if (separatorLine && separatorLine.match(/^\|[\s\-:]+\|$/)) {
        // Extract column names
        const columnNames = headerLine
          .split('|')
          .slice(1, -1) // Remove first and last empty elements
          .map(col => col.trim())
          .filter(col => col.length > 0);
        
        // Extract rows
        const rows: string[][] = [];
        i += 2; // Skip header and separator
        
        while (i < lines.length) {
          const rowLine = lines[i].trim();
          if (!rowLine.startsWith('|') || !rowLine.endsWith('|')) {
            break;
          }
          
          const cells = rowLine
            .split('|')
            .slice(1, -1)
            .map(cell => cell.trim());
          
          if (cells.length > 0) {
            rows.push(cells);
          }
          i++;
        }
        
        if (columnNames.length > 0 && rows.length > 0) {
          tables.push({ columnNames, rows });
        }
      } else {
        i++;
      }
    } else {
      i++;
    }
  }
  
  return tables;
}

/**
 * Extract tables from PDF using Gradio PaddleOCR API
 */
export async function extractTablesFromPdfGradio(
  input: ExtractTablesFromPdfGradioInput
): Promise<ExtractTablesFromPdfGradioOutput> {
  const startTime = Date.now();
  let tempFilePath: string | null = null;

  try {
    // Decode the data URI
    const matches = input.pdfDataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid data URI format');
    }

    const [, mimeType, base64Data] = matches;
    
    // Validate MIME type
    if (!mimeType.includes('pdf') && !mimeType.includes('image')) {
      throw new Error('Invalid file type. Expected PDF or image.');
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Create temporary file
    const fileExt = mimeType.includes('pdf') ? 'pdf' : 'jpg';
    const randomName = randomBytes(16).toString('hex');
    tempFilePath = join(tmpdir(), `${randomName}.${fileExt}`);

    // Write buffer to file
    await writeFile(tempFilePath, buffer);

    // Process with PaddleOCR
    const result = await processComplexDocument(tempFilePath, input.useChartRecognition);

    // Parse tables from markdown
    const tables = parseMarkdownTables(result.markdown);

    const processingTime = Date.now() - startTime;

    return {
      tables,
      markdown: result.markdown,
      visualizationHtml: result.visualizationHtml,
      processingTime,
    };
  } catch (error: any) {
    console.error('Error extracting tables with Gradio API:', error);
    throw new Error(`Gradio API extraction failed: ${error.message}`);
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (err) {
        console.warn('Failed to clean up temporary file:', err);
      }
    }
  }
}

/**
 * Utility function to extract just the markdown content
 */
export async function extractMarkdownFromPdf(
  pdfDataUri: string,
  useChartRecognition = false
): Promise<string> {
  const result = await extractTablesFromPdfGradio({
    pdfDataUri,
    useChartRecognition,
  });
  
  return result.markdown;
}
