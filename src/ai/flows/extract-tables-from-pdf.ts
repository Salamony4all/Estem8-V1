'use server';
/**
 * @fileOverview An AI agent that extracts tables from a PDF document.
 *
 * - extractTablesFromPdf - A function that handles the table extraction process.
 * - ExtractTablesFromPdfInput - The input type for the extractTablesFromPdf function.
 * - ExtractTablesFromPdfOutput - The return type for the extractTablesFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTablesFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTablesFromPdfInput = z.infer<typeof ExtractTablesFromPdfInputSchema>;

const TableSchema = z.object({
  columnNames: z.array(z.string()).describe('The names of the columns in the table'),
  rows: z.array(z.array(z.string())).describe('The rows of the table, with each row being an array of strings representing the cells'),
});

const ExtractTablesFromPdfOutputSchema = z.object({
  tables: z.array(TableSchema).describe('The extracted tables from the PDF document'),
});
export type ExtractTablesFromPdfOutput = z.infer<typeof ExtractTablesFromPdfOutputSchema>;

export async function extractTablesFromPdf(input: ExtractTablesFromPdfInput): Promise<ExtractTablesFromPdfOutput> {
  return extractTablesFromPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTablesFromPdfPrompt',
  input: {schema: ExtractTablesFromPdfInputSchema},
  output: {schema: ExtractTablesFromPdfOutputSchema},
  prompt: `You are an expert in extracting tabular data from PDF documents.

You will receive a PDF document as a data URI. Your task is to identify and extract all tables from the document.

For each table, identify the column names and the rows of data. Return the extracted tables in a JSON format as described by the ExtractTablesFromPdfOutputSchema schema.

Here is the PDF document:
{{media url=pdfDataUri}}`,
});

const extractTablesFromPdfFlow = ai.defineFlow(
  {
    name: 'extractTablesFromPdfFlow',
    inputSchema: ExtractTablesFromPdfInputSchema,
    outputSchema: ExtractTablesFromPdfOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
