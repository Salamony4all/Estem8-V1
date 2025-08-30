'use client';

import { useState } from 'react';
import type { ExtractTablesFromPdfOutput } from '@/ai/flows/extract-tables-from-pdf';
import { extractTablesFromPdf } from '@/ai/flows/extract-tables-from-pdf';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { FileUploader } from '@/components/file-uploader';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableViewer } from '@/components/table-viewer';

type Table = ExtractTablesFromPdfOutput['tables'][0];

export default function Home() {
  const [tables, setTables] = useState<Table[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setTables(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdfDataUri = e.target?.result as string;
        try {
          const result = await extractTablesFromPdf({ pdfDataUri });
          if (result.tables && result.tables.length > 0) {
            setTables(result.tables);
            toast({
              title: 'Success!',
              description: `Extracted ${result.tables.length} table(s) from your PDF.`,
            });
          } else {
            setError('No tables could be found in the provided PDF.');
          }
        } catch (aiError) {
          console.error(aiError);
          setError('An AI processing error occurred. Please try another file.');
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem with the AI model.',
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      setError('Failed to read the file. Please try again.');
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTables(null);
    setError(null);
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            Analyzing your PDF... This may take a moment.
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-medium text-destructive">{error}</p>
          <Button onClick={handleReset} variant="destructive">
            Try a different file
          </Button>
        </div>
      );
    }

    if (tables) {
      return (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleReset}>Process Another File</Button>
          </div>
          <Tabs defaultValue="table-0" className="w-full">
            <TabsList className="grid w-full grid-cols-1" style={{gridTemplateColumns: `repeat(${tables.length}, minmax(0, 1fr))`}}>
              {tables.map((_, index) => (
                <TabsTrigger key={index} value={`table-${index}`}>
                  Table {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            {tables.map((table, index) => (
              <TabsContent key={index} value={`table-${index}`}>
                <TableViewer initialTable={table} tableId={`table-${index}`} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      );
    }

    return <FileUploader onFileUpload={handleFileUpload} disabled={isLoading} />;
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center gap-3">
            <Icons.logo className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Tabular.ai</h1>
          </div>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Extract, edit, and export tables from your PDFs with the power of AI.
          </p>
        </header>

        <div className="mx-auto max-w-7xl">{renderContent()}</div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Built with Next.js, Genkit, and ShadCN UI.</p>
      </footer>
    </div>
  );
}
