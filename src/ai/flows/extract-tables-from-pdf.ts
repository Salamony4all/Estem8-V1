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
  rows: z.array(z.array(z.string())).describe('The rows of the table, with each row being an array of strings representing the cells. This must include all summary rows like Total, Discounts, VAT, and Grand Total.'),
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

For each table, identify the column names and all rows of data. It is crucial that you extract every single row, from the first item to the final Grand Total. Do not omit any rows. Include all summary rows at the end of the table, such as Subtotal, Total, Discounts, VAT (or sales tax), and especially the Grand Total.

If the table contains numeric values in a "Total" or "Amount" column but does not explicitly state the Total, VAT, and Grand Total, you must calculate them.
1. Calculate the 'Total' by summing up the values in the main amount column for all items.
2. Calculate 'VAT 5%' as 5% of the 'Total'.
3. Calculate the 'Grand Total' as the sum of 'Total' and 'VAT 5%'.
4. Add these three rows to the end of the table data. For these summary rows, place the label (e.g., "Total") in the appropriate column and the calculated value in the amount column.

Ensure these summary rows are part of the main table data. For these summary rows, place the label (e.g., "Total") in the appropriate column and leave other cells in that row empty if no data applies.

Return the extracted tables in a JSON format as described by the ExtractTablesFromPdfOutputSchema schema.

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
