'use client';

import { useState, useMemo } from 'react';
import type { ExtractTablesFromPdfOutput } from '@/ai/flows/extract-tables-from-pdf';
import { extractTablesFromPdf } from '@/ai/flows/extract-tables-from-pdf';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { FileUploader } from '@/components/file-uploader';
import { Loader2, AlertTriangle, Wand2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableViewer } from '@/components/table-viewer';
import { CostingCard } from '@/components/costing-card';
import { ExportCard } from '@/components/export-card';
import { ClientDetailsCard } from '@/components/client-details-card';
import { format } from 'date-fns';

type Table = ExtractTablesFromPdfOutput['tables'][0];
type Currency = {
  code: string;
  rate: number;
  symbol: string;
};

const currencies: Currency[] = [
  { code: 'OMR', rate: 1, symbol: 'OMR' },
  { code: 'USD', rate: 2.6, symbol: '$' },
  { code: 'EUR', rate: 2.8, symbol: '€' },
  { code: 'AED', rate: 9.55, symbol: 'AED' },
];

export default function Home() {
  const [tables, setTables] = useState<Table[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuotation, setShowQuotation] = useState(false);
  const { toast } = useToast();

  const [netMargin, setNetMargin] = useState(10);
  const [freight, setFreight] = useState(5);
  const [customs, setCustoms] = useState(2);
  const [installation, setInstallation] = useState(3);
  const [fromCurrency, setFromCurrency] = useState(currencies[0]);
  const [toCurrency, setToCurrency] = useState(currencies[0]);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [refNo, setRefNo] = useState('');
  const [projectName, setProjectName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const clientDetails = {
    date: date ? format(date, 'PPP') : '',
    refNo,
    projectName,
    contactPerson,
    contactNumber,
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setTables(null);
    setShowQuotation(false);

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
    setShowQuotation(false);
  };

  const findColumnIndex = (columnNames: string[], possibleNames: string[]): number => {
    for (const name of possibleNames) {
      const index = columnNames.findIndex((col) => col.toLowerCase().includes(name));
      if (index !== -1) return index;
    }
    return -1;
  };
  
  const quotationTable = useMemo(() => {
    if (!tables) return null;
  
    const costingFactors = { netMargin, freight, customs, installation };
    const initialTable = JSON.parse(JSON.stringify(tables[0]));
  
    const qtyIndex = findColumnIndex(initialTable.columnNames, ['qty', 'quantity']);
    const rateIndex = findColumnIndex(initialTable.columnNames, ['rate', 'price', 'unit price']);
    const amountIndex = findColumnIndex(initialTable.columnNames, ['amount', 'total']);
  
    if (rateIndex === -1 || amountIndex === -1) return initialTable;
  
    const exchangeRate = toCurrency.rate / fromCurrency.rate;
  
    const newRows = initialTable.rows.map((row: string[]) => {
      const newRow = [...row];
      
      const isSummaryRow = row.some(cell => 
        cell.toLowerCase().includes('total') || cell.toLowerCase().includes('vat')
      );
  
      if (!isSummaryRow) {
        const rateStr = newRow[rateIndex]?.replace(/[^0-9.-]+/g, '');
        let rate = parseFloat(rateStr);
  
        if (!isNaN(rate)) {
          const { netMargin, freight, customs, installation } = costingFactors;
          const finalRate =
            rate *
            (1 + netMargin / 100) *
            (1 + freight / 100) *
            (1 + customs / 100) *
            (1 + installation / 100);
          
          const exchangedRate = finalRate * exchangeRate;
          newRow[rateIndex] = exchangedRate.toFixed(2);
  
          if (qtyIndex !== -1) {
            const qtyStr = newRow[qtyIndex]?.replace(/[^0-9.-]+/g, '');
            const qty = parseFloat(qtyStr);
            if (!isNaN(qty)) {
              newRow[amountIndex] = (qty * exchangedRate).toFixed(2);
            }
          } else {
             newRow[amountIndex] = exchangedRate.toFixed(2);
          }
        }
      } else {
        const amountStr = newRow[amountIndex]?.replace(/[^0-9.-]+/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount)) {
            const exchangedAmount = amount * exchangeRate;
            newRow[amountIndex] = exchangedAmount.toFixed(2);
        }
      }
      return newRow;
    });
  
    return { ...initialTable, rows: newRows };
  }, [tables, netMargin, freight, customs, installation, fromCurrency, toCurrency]);

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
      const costingFactors = { netMargin, freight, customs, installation };
      return (
        <div className="space-y-8">
          <div className="flex justify-end">
            <Button onClick={handleReset}>Process Another File</Button>
          </div>

          <Tabs defaultValue="table-0" className="w-full">
            <TabsList
              className="grid w-full grid-cols-1"
              style={{ gridTemplateColumns: `repeat(${tables.length}, minmax(0, 1fr))` }}
            >
              {tables.map((_, index) => (
                <TabsTrigger key={index} value={`table-${index}`}>
                  Extracted Table {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            {tables.map((table, index) => (
              <TabsContent key={index} value={`table-${index}`}>
                <TableViewer initialTable={table} tableId={`table-${index}`} />
              </TabsContent>
            ))}
          </Tabs>

          <CostingCard
            costingFactors={costingFactors}
            setters={{ setNetMargin, setFreight, setCustoms, setInstallation }}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            setFromCurrency={setFromCurrency}
            setToCurrency={setToCurrency}
            currencies={currencies}
          />

          <ClientDetailsCard
            details={{ date, refNo, projectName, contactPerson, contactNumber }}
            setters={{
              setDate,
              setRefNo,
              setProjectName,
              setContactPerson,
              setContactNumber,
            }}
          />

          <div className="flex flex-col items-center gap-6">
            {!showQuotation && (
              <Button size="lg" onClick={() => setShowQuotation(true)}>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Quotation
              </Button>
            )}
            {showQuotation && quotationTable && (
              <div className="w-full space-y-8">
                <TableViewer
                  initialTable={quotationTable}
                  tableId="quotation-table"
                  isQuotation
                  currencySymbol={toCurrency.symbol}
                />
                <ExportCard
                  tableData={quotationTable}
                  tableName="quotation"
                  clientDetails={clientDetails}
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    return <FileUploader onFileUpload={handleFileUpload} disabled={isLoading} />;
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Alshaya Enterprise</h1>
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
