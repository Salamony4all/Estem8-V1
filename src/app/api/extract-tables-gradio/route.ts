import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { processComplexDocument } from '@/lib/paddleOCRClient';

/**
 * API route for extracting tables from PDFs using Gradio PaddleOCR API
 * This replaces the server action to avoid serialization issues in Next.js 15
 */

interface Table {
  columnNames: string[];
  rows: string[][];
}

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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let tempFilePath: string | null = null;

  try {
    // Parse JSON body
    const body = await request.json();
    const { pdfDataUri, useChartRecognition = false } = body;

    if (!pdfDataUri) {
      return NextResponse.json(
        { error: 'No pdfDataUri provided' },
        { status: 400 }
      );
    }

    // Decode the data URI
    const matches = pdfDataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: 'Invalid data URI format' },
        { status: 400 }
      );
    }

    const [, mimeType, base64Data] = matches;
    
    // Validate MIME type
    if (!mimeType.includes('pdf') && !mimeType.includes('image')) {
      return NextResponse.json(
        { error: 'Invalid file type. Expected PDF or image.' },
        { status: 400 }
      );
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
    const result = await processComplexDocument(tempFilePath, useChartRecognition);

    // Parse tables from markdown
    const tables = parseMarkdownTables(result.markdown);

    const processingTime = Date.now() - startTime;

    // Return the result
    return NextResponse.json({
      tables,
      markdown: result.markdown,
      visualizationHtml: result.visualizationHtml,
      processingTime,
    });
  } catch (error: any) {
    console.error('Error extracting tables with Gradio API:', error);
    return NextResponse.json(
      { error: error.message || 'Gradio API extraction failed' },
      { status: 500 }
    );
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
