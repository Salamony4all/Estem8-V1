'use client';

import DocumentProcessor from '@/components/document-processor';

export default function OCRDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PaddleOCR Integration Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced document processing powered by PaddleOCR. Extract text, tables, 
            and structure from PDFs and images with high accuracy.
          </p>
        </div>

        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            🚀 Features
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Complex Document Processing:</strong> Extracts tables, layouts, and text structure</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Chart Recognition:</strong> Optional chart and diagram parsing</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Targeted Recognition:</strong> Fast OCR for simple text extraction</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Multiple Formats:</strong> Supports PDF and image files (PNG, JPEG, WebP)</span>
            </li>
          </ul>
        </div>

        <DocumentProcessor 
          onProcessingComplete={(result) => {
            console.log('Document processed:', result);
          }}
        />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Powered by{' '}
            <a 
              href="https://github.com/PaddlePaddle/PaddleOCR" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              PaddleOCR
            </a>
            {' '}• Baidu AI Studio
          </p>
        </div>
      </div>
    </div>
  );
}
