'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

// This is a workaround for jspdf-autotable in Next.js
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

type TableData = {
  columnNames: string[];
  rows: string[][];
};

interface ExportCardProps {
  tableData: TableData;
  tableName: string;
}

export function ExportCard({ tableData, tableName }: ExportCardProps) {
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([tableData.columnNames, ...tableData.rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${tableName}.xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(20);
    doc.text('Alshaya Enterprise', 14, 22);
    doc.autoTable({
      startY: 30,
      head: [tableData.columnNames],
      body: tableData.rows,
    });
    doc.save(`${tableName}.pdf`);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Export Quotation</CardTitle>
        <CardDescription>Download your generated quotation in various formats.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={handleExportExcel} className="w-full">
          <FileDown className="mr-2" />
          Export to Excel
        </Button>
        <Button onClick={handleExportPdf} className="w-full">
          <FileDown className="mr-2" />
          Export to PDF
        </Button>
      </CardContent>
    </Card>
  );
}
