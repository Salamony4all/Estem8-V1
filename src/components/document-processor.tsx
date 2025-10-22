'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface DocumentProcessorProps {
  onProcessingComplete?: (result: any) => void;
}

export default function DocumentProcessor({ onProcessingComplete }: DocumentProcessorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [mode, setMode] = useState<'complex' | 'targeted'>('complex');
  const [useChartRecognition, setUseChartRecognition] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to process');
      return;
    }

    setProcessing(true);
    setError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);
      formData.append('useChartRecognition', useChartRecognition ? 'true' : 'false');

      setUploadProgress(30);

      const response = await fetch('/api/ocr/process-document', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      setUploadProgress(100);

      if (onProcessingComplete) {
        onProcessingComplete(data);
      }
    } catch (err: any) {
      console.error('Error processing document:', err);
      setError(err.message || 'Failed to process document');
      setUploadProgress(0);
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          PaddleOCR Document Processor
        </CardTitle>
        <CardDescription>
          Upload a document (PDF or image) to extract text, tables, and structure using PaddleOCR
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Processing Mode Selection */}
          <div className="space-y-3">
            <Label>Processing Mode</Label>
            <RadioGroup value={mode} onValueChange={(value: any) => setMode(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complex" id="complex" />
                <Label htmlFor="complex" className="font-normal cursor-pointer">
                  Complex Document (Tables, Layout Analysis, Charts)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="targeted" id="targeted" />
                <Label htmlFor="targeted" className="font-normal cursor-pointer">
                  Targeted Recognition (Simple OCR)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Chart Recognition Option */}
          {mode === 'complex' && (
            <div className="flex items-center space-x-2">
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

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload Document</Label>
            <div className="flex items-center gap-4">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept="application/pdf,image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
              {file && (
                <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                  Clear
                </Button>
              )}
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {processing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing document...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!file || processing}
            className="w-full"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Process Document
              </>
            )}
          </Button>
        </form>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert and Results */}
        {result && (
          <div className="mt-6 space-y-4">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Document processed successfully!
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="markdown" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="markdown">Extracted Text</TabsTrigger>
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
                <TabsTrigger value="raw">Raw Output</TabsTrigger>
              </TabsList>

              <TabsContent value="markdown" className="space-y-2">
                <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {result.markdown || result.rawOutput || 'No content available'}
                  </pre>
                </div>
                {result.markdown && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(result.markdown);
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="visualization">
                {result.visualizationHtml ? (
                  <div
                    className="bg-white border rounded-lg p-4 max-h-96 overflow-auto"
                    dangerouslySetInnerHTML={{ __html: result.visualizationHtml }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground p-4">
                    No visualization available for this mode
                  </p>
                )}
              </TabsContent>

              <TabsContent value="raw">
                <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
