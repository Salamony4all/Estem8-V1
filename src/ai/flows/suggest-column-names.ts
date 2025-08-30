'use server';

/**
 * @fileOverview Suggests column names for unnamed columns in a table.
 *
 * - suggestColumnNames - A function that suggests column names.
 * - SuggestColumnNamesInput - The input type for the suggestColumnNames function.
 * - SuggestColumnNamesOutput - The return type for the suggestColumnNames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestColumnNamesInputSchema = z.object({
  tableData: z
    .string()
    .describe('The table data as a string, with columns separated by commas and rows separated by newlines.'),
  unnamedColumns: z
    .array(z.number())
    .describe('An array of column indices that are unnamed.'),
});
export type SuggestColumnNamesInput = z.infer<typeof SuggestColumnNamesInputSchema>;

const SuggestColumnNamesOutputSchema = z.object({
  suggestedNames: z
    .array(z.string())
    .describe('An array of suggested column names for the unnamed columns.'),
});
export type SuggestColumnNamesOutput = z.infer<typeof SuggestColumnNamesOutputSchema>;

export async function suggestColumnNames(
  input: SuggestColumnNamesInput
): Promise<SuggestColumnNamesOutput> {
  return suggestColumnNamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestColumnNamesPrompt',
  input: {schema: SuggestColumnNamesInputSchema},
  output: {schema: SuggestColumnNamesOutputSchema},
  prompt: `You are an expert at understanding tabular data. Given the following table data and a list of unnamed columns, suggest a name for each of the unnamed columns.

Table Data:
{{tableData}}

Unnamed Columns: {{unnamedColumns}}

Respond with an array of suggested names.  The array should have the same length as the Unnamed Columns array.
Make the names as concise as possible.
Make sure that the names are appropriate given the content of the columns.  For example, avoid names like "Column1".`,
});

const suggestColumnNamesFlow = ai.defineFlow(
  {
    name: 'suggestColumnNamesFlow',
    inputSchema: SuggestColumnNamesInputSchema,
    outputSchema: SuggestColumnNamesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
