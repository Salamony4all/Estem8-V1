'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

type TableData = {
  columnNames: string[];
  rows: string[][];
};

type ClientDetails = {
  date: string;
  refNo: string;
  projectName: string;
  contactPerson: string;
  contactNumber: string;
};

interface ExportCardProps {
  tableData: TableData;
  tableName: string;
  clientDetails: ClientDetails;
}

export function ExportCard({ tableData, tableName, clientDetails }: ExportCardProps) {
  const handleExportExcel = () => {
    const wsData = [
      ['Alshaya Enterprise'],
      [],
      ['Date', clientDetails.date],
      ['Ref. No.', clientDetails.refNo],
      ['Project Name', clientDetails.projectName],
      ['Contact Person', clientDetails.contactPerson],
      ['Contact Number', clientDetails.contactNumber],
      [],
      tableData.columnNames,
      ...tableData.rows,
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${tableName}.xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    doc.setFontSize(20);
    doc.text('Alshaya Enterprise', 14, 22);
    doc.setFontSize(10);
    
    const clientDetailsYStart = 35;
    const clientDetailsData = [
      ['Date:', clientDetails.date, 'Project Name:', clientDetails.projectName],
      ['Ref. No.:', clientDetails.refNo, 'Contact Person:', clientDetails.contactPerson],
      ['', '', 'Contact Number:', clientDetails.contactNumber],
    ];

    doc.autoTable({
        body: clientDetailsData,
        startY: clientDetailsYStart,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1 },
        columnStyles: {
            0: { fontStyle: 'bold' },
            2: { fontStyle: 'bold' }
        }
    });

    const tableStartY = (doc as any).lastAutoTable.finalY + 10;

    doc.autoTable({
      startY: tableStartY,
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
