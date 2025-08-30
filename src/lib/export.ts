'use client';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { ExtractTablesFromPdfOutput } from '@/ai/flows/extract-tables-from-pdf';

type TableData = ExtractTablesFromPdfOutput['tables'][0];

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const exportToExcel = (tableData: TableData, fileName: string) => {
  const worksheet = XLSX.utils.aoa_to_sheet([tableData.columnNames, ...tableData.rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, fileName);
};

export const exportToPdf = (tableData: TableData, fileName: string) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  doc.autoTable({
    head: [tableData.columnNames],
    body: tableData.rows,
  });
  doc.save(fileName);
};
