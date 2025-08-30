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
  const data = [...tableData.rows];
  if(tableData.total || tableData.vat || tableData.grandTotal) {
    data.push([]); // spacer row
  }
  if (tableData.total) {
    const row = new Array(tableData.columnNames.length - 2).fill('');
    row.push('Total:', tableData.total);
    data.push(row);
  }
  if (tableData.vat) {
    const row = new Array(tableData.columnNames.length - 2).fill('');
    row.push('VAT:', tableData.vat);
    data.push(row);
  }
  if (tableData.grandTotal) {
    const row = new Array(tableData.columnNames.length - 2).fill('');
    row.push('Grand Total:', tableData.grandTotal);
    data.push(row);
  }

  const worksheet = XLSX.utils.aoa_to_sheet([tableData.columnNames, ...data]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, fileName);
};

export const exportToPdf = (tableData: TableData, fileName:string) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  const body = [...tableData.rows];
  
  if (tableData.total || tableData.vat || tableData.grandTotal) {
    body.push([]); // spacer row
  }
  if (tableData.total) {
    const row = new Array(tableData.columnNames.length - 2).fill('');
    row.push('Total:', tableData.total);
    body.push(row);
  }
  if (tableData.vat) {
    const row = new Array(tableData.columnNames.length - 2).fill('');
    row.push('VAT:', tableData.vat);
    body.push(row);
  }
  if (tableData.grandTotal) {
    const row = new Array(tableData.columnNames.length - 2).fill('');
    row.push('Grand Total:', tableData.grandTotal);
    body.push(row);
  }
  
  doc.autoTable({
    head: [tableData.columnNames],
    body: body,
  });

  doc.save(fileName);
};
