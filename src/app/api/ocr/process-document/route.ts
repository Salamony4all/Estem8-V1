import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { processComplexDocument, processTargetedRecognition } from '@/lib/paddleOCRClient';

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = (formData.get('mode') as string) || 'complex';
    const useChartRecognition = formData.get('useChartRecognition') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or image file.' },
        { status: 400 }
      );
    }

    // Convert file to buffer and save temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique temp filename
    const fileExt = file.name.split('.').pop() || 'tmp';
    const randomName = randomBytes(16).toString('hex');
    tempFilePath = join(tmpdir(), `${randomName}.${fileExt}`);

    // Write to temp file
    await writeFile(tempFilePath, buffer);

    // Process the document based on mode
    let result;
    if (mode === 'targeted') {
      result = await processTargetedRecognition(tempFilePath);
    } else {
      // Default to complex document processing
      result = await processComplexDocument(tempFilePath, useChartRecognition);
    }

    // Clean up temp file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (err) {
        console.warn('Failed to clean up temporary file:', err);
      }
    }

    // Return the result
    return NextResponse.json(result);
  } catch (error: any) {
    // Clean up temp file in case of error
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (err) {
        console.warn('Failed to clean up temporary file after error:', err);
      }
    }

    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred processing the document' },
      { status: 500 }
    );
  }
}
