'use client';

import { useState, useMemo } from 'react';
import type { ExtractTablesFromPdfOutput } from '@/ai/flows/extract-tables-from-pdf';
import { extractTablesFromPdf } from '@/ai/flows/extract-tables-from-pdf';
import { extractTablesFromPdfPaddleOCR } from '@/ai/flows/extract-tables-from-pdf-paddleocr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { FileUploader } from '@/components/file-uploader';
import { Loader2, AlertTriangle, Wand2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableViewer } from '@/components/table-viewer';
import { CostingCard } from '@/components/costing-card';
import { ExportCard } from '@/components/export-card';
import { ClientDetailsCard } from '@/components/client-details-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [extractionMethod, setExtractionMethod] = useState<'ai' | 'paddleocr-api' | 'paddleocr-native' | 'paddleocr-gradio'>('paddleocr-gradio');
  const [visualizationHtml, setVisualizationHtml] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [useChartRecognition, setUseChartRecognition] = useState(false);
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
    setVisualizationHtml(null);
    setMarkdownContent(null);
    setUploadedFile(file);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdfDataUri = e.target?.result as string;
        try {
          let result;
          
          // Use selected extraction method
          if (extractionMethod === 'ai') {
            result = await extractTablesFromPdf({ pdfDataUri });
          } else if (extractionMethod === 'paddleocr-gradio') {
            // Use Gradio API via API route to avoid server action issues
            const response = await fetch('/api/extract-tables-gradio', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                pdfDataUri,
                useChartRecognition,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to extract tables');
            }

            result = await response.json();
            
            // Store additional Gradio outputs
            if ('markdown' in result) {
              setMarkdownContent(result.markdown);
            }
            if ('visualizationHtml' in result) {
              setVisualizationHtml(result.visualizationHtml || null);
            }
          } else {
            // Use PaddleOCR method (api or native)
            const method = extractionMethod === 'paddleocr-native' ? 'native' : 'api';
            result = await extractTablesFromPdfPaddleOCR({ 
              pdfDataUri, 
              method,
              // You can add API key from environment variable if needed
              apiKey: process.env.NEXT_PUBLIC_PADDLEOCR_API_KEY,
            });
          }
          
          if (result.tables && result.tables.length > 0) {
            setTables(result.tables);
            const methodName = extractionMethod === 'ai' ? 'AI' : 
                             extractionMethod === 'paddleocr-native' ? 'PaddleOCR (Native)' : 
                             extractionMethod === 'paddleocr-gradio' ? 'PaddleOCR (Gradio)' :
                             'PaddleOCR (API)';
            toast({
              title: 'Success!',
              description: `Extracted ${result.tables.length} table(s) from your document using ${methodName}.`,
            });
          } else {
            setError('No tables could be found in the provided document.');
          }
        } catch (extractionError) {
          console.error(extractionError);
          const errorMessage = extractionError instanceof Error ? extractionError.message : 'An error occurred';
          setError(`Extraction error: ${errorMessage}`);
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: errorMessage,
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
    setVisualizationHtml(null);
    setMarkdownContent(null);
    setUploadedFile(null);
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
  
    if (rateIndex === -1) return initialTable; // Cannot proceed without a rate column.
  
    const exchangeRate = toCurrency.rate / fromCurrency.rate;
  
    let newTotal = 0;
  
    const itemRows = initialTable.rows.filter((row: string[]) => 
      !row.some(cell => cell.toLowerCase().includes('total') || cell.toLowerCase().includes('vat'))
    );

    const updatedItemRows = itemRows.map((row: string[]) => {
      const newRow = [...row];
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

        let itemTotal = exchangedRate;
        if (qtyIndex !== -1 && amountIndex !== -1) {
          const qtyStr = newRow[qtyIndex]?.replace(/[^0-9.-]+/g, '');
          const qty = parseFloat(qtyStr);
          if (!isNaN(qty)) {
            itemTotal = qty * exchangedRate;
          }
           newRow[amountIndex] = itemTotal.toFixed(2);
        }
        newTotal += itemTotal;
      }
      return newRow;
    });
    
    const newVat = newTotal * 0.05;
    const grandTotal = newTotal + newVat;
    const finalRows = [...updatedItemRows];
    const numColumns = initialTable.columnNames.length;
    const descriptionIndex = 0;

    const totalRow = new Array(numColumns).fill('');
    if (amountIndex !== -1) {
      totalRow[descriptionIndex] = 'Total';
      totalRow[amountIndex] = newTotal.toFixed(2);
      finalRows.push(totalRow);

      const vatRow = new Array(numColumns).fill('');
      vatRow[descriptionIndex] = 'VAT 5%';
      vatRow[amountIndex] = newVat.toFixed(2);
      finalRows.push(vatRow);

      const grandTotalRow = new Array(numColumns).fill('');
      grandTotalRow[descriptionIndex] = 'Grand Total';
      grandTotalRow[amountIndex] = grandTotal.toFixed(2);
      finalRows.push(grandTotalRow);
    }
  
    return { ...initialTable, rows: finalRows };
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

          {/* Show uploaded file preview */}
          {uploadedFile && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Document</CardTitle>
                <CardDescription>
                  {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Show visualization if available (Gradio method) */}
          {visualizationHtml && (
            <Card>
              <CardHeader>
                <CardTitle>Document Layout Visualization</CardTitle>
                <CardDescription>
                  Visual representation of the detected document structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-4 bg-white overflow-auto max-h-96"
                  dangerouslySetInnerHTML={{ __html: visualizationHtml }}
                />
              </CardContent>
            </Card>
          )}

          {/* Show markdown content if available */}
          {markdownContent && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Content (Markdown)</CardTitle>
                <CardDescription>
                  Full text content extracted from the document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {markdownContent}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(markdownContent);
                    toast({
                      title: 'Copied!',
                      description: 'Markdown content copied to clipboard.',
                    });
                  }}
                >
                  Copy Markdown
                </Button>
              </CardContent>
            </Card>
          )}

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

    return (
      <div className="space-y-6">
        <div className="rounded-lg border p-6 bg-card">
          <Label htmlFor="extraction-method" className="text-base font-semibold mb-2 block">
            Extraction Method
          </Label>
          <Select 
            value={extractionMethod} 
            onValueChange={(value: any) => setExtractionMethod(value)}
          >
            <SelectTrigger id="extraction-method" className="w-full">
              <SelectValue placeholder="Select extraction method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paddleocr-gradio">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">PaddleOCR (Gradio) - Newest ⭐</span>
                  <span className="text-xs text-muted-foreground">Advanced layout analysis with visualization & markdown output</span>
                </div>
              </SelectItem>
              <SelectItem value="paddleocr-api">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">PaddleOCR (API)</span>
                  <span className="text-xs text-muted-foreground">100% accurate OCR using PP-Structure V3 cloud service</span>
                </div>
              </SelectItem>
              <SelectItem value="paddleocr-native">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">PaddleOCR (Native)</span>
                  <span className="text-xs text-muted-foreground">Local processing (requires PaddleOCR service running)</span>
                </div>
              </SelectItem>
              <SelectItem value="ai">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">AI-based (Legacy)</span>
                  <span className="text-xs text-muted-foreground">Uses Google Gemini for extraction</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {/* Chart recognition option for Gradio method */}
          {extractionMethod === 'paddleocr-gradio' && (
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="chart-recognition"
                checked={useChartRecognition}
                onCheckedChange={(checked) => setUseChartRecognition(checked as boolean)}
              />
              <Label
                htmlFor="chart-recognition"
                className="text-sm font-normal cursor-pointer"
              >
                Enable chart recognition (slower but more accurate for documents with charts)
              </Label>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground mt-2">
            {extractionMethod === 'paddleocr-gradio' && 
              'Advanced document processing with full layout analysis, table extraction, and HTML visualization. Supports PDFs and images.'}
            {extractionMethod === 'paddleocr-api' && 
              'Fast cloud-based processing with 1:1 replication accuracy using PaddleOCR PP-Structure V3.'}
            {extractionMethod === 'paddleocr-native' && 
              'Local processing for privacy and offline use. Ensure PaddleOCR service is running on localhost:8866.'}
            {extractionMethod === 'ai' && 
              'AI-powered extraction using Google Gemini. May not be as accurate as PaddleOCR.'}
          </p>
        </div>
        <FileUploader 
          onFileUpload={handleFileUpload} 
          disabled={isLoading}
          acceptImages={extractionMethod === 'paddleocr-gradio'}
        />
      </div>
    );
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
