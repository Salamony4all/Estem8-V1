'use client';

import { useState, useMemo, type KeyboardEvent } from 'react';
import type { ExtractTablesFromPdfOutput } from '@/ai/flows/extract-tables-from-pdf';
import { suggestColumnNames } from '@/ai/flows/suggest-column-names';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TableData = ExtractTablesFromPdfOutput['tables'][0];

interface TableViewerProps {
  initialTable: TableData;
  tableId: string;
  isQuotation: boolean;
  costingFactors?: {
    netMargin: number;
    freight: number;
    customs: number;
    installation: number;
  };
}

const findAmountColumn = (columnNames: string[]): number => {
  const possibleNames = ['amount', 'price', 'total', 'cost'];
  let amountIndex = -1;
  for (const name of possibleNames) {
    amountIndex = columnNames.findIndex((col) => col.toLowerCase().includes(name));
    if (amountIndex !== -1) break;
  }
  return amountIndex === -1 ? columnNames.length - 1 : amountIndex;
};

export function TableViewer({
  initialTable,
  tableId,
  isQuotation,
  costingFactors,
}: TableViewerProps) {
  const [tableData, setTableData] = useState<TableData>(initialTable);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editingHeader, setEditingHeader] = useState<number | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const handleCellChange = (row: number, col: number, value: string) => {
    const newRows = [...tableData.rows];
    newRows[row][col] = value;
    setTableData({ ...tableData, rows: newRows });
  };

  const handleHeaderChange = (col: number, value: string) => {
    const newColumnNames = [...tableData.columnNames];
    newColumnNames[col] = value;
    setTableData({ ...tableData, columnNames: newColumnNames });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleSuggestNames = async () => {
    setIsSuggesting(true);
    try {
      const unnamedColumns = tableData.columnNames
        .map((name, index) => ({ name, index }))
        .filter(({ name }) => !name || name.trim() === '' || /^column \d+$/i.test(name))
        .map(({ index }) => index);

      if (unnamedColumns.length === 0) {
        toast({
          title: 'No unnamed columns found',
          description: 'All columns seem to have names already.',
        });
        return;
      }

      const tableString = [
        tableData.columnNames.join(','),
        ...tableData.rows.map((row) => row.join(',')),
      ].join('\n');

      const result = await suggestColumnNames({
        tableData: tableString,
        unnamedColumns: unnamedColumns,
      });

      const newColumnNames = [...tableData.columnNames];
      result.suggestedNames.forEach((suggestedName, i) => {
        const columnIndex = unnamedColumns[i];
        newColumnNames[columnIndex] = suggestedName;
      });

      setTableData({ ...tableData, columnNames: newColumnNames });
      toast({
        title: 'Names Suggested!',
        description: 'AI has suggested new names for your columns.',
      });
    } catch (error) {
      console.error('Failed to suggest column names:', error);
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: 'Could not get suggestions from AI.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const processedTable = useMemo(() => {
    if (!isQuotation || !costingFactors) {
      return tableData;
    }

    const amountIndex = findAmountColumn(tableData.columnNames);
    if (amountIndex === -1) return tableData;

    const newRows = tableData.rows.map((row) => {
      const newRow = [...row];
      const amountStr = newRow[amountIndex]?.replace(/[^0-9.-]+/g, '');
      const amount = parseFloat(amountStr);

      if (!isNaN(amount)) {
        const { netMargin, freight, customs, installation } = costingFactors;
        const finalAmount =
          amount *
          (1 + netMargin / 100) *
          (1 + freight / 100) *
          (1 + customs / 100) *
          (1 + installation / 100);
        newRow[amountIndex] = finalAmount.toFixed(2);
      }
      return newRow;
    });

    return { ...tableData, rows: newRows };
  }, [tableData, isQuotation, costingFactors]);

  const nonEmptyRows = useMemo(
    () => processedTable.rows.filter((row) => row.some((cell) => cell.trim() !== '')),
    [processedTable.rows]
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>
              {isQuotation ? 'Quotation Table' : 'Editable Table Preview'}
            </CardTitle>
            <CardDescription>
              {isQuotation
                ? 'Final costs after applying adjustments.'
                : 'Double-click any cell to edit its content.'}
            </CardDescription>
          </div>
          {!isQuotation && (
            <div className="flex flex-shrink-0 gap-2">
              <Button onClick={handleSuggestNames} disabled={isSuggesting} variant="outline">
                {isSuggesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Suggest Names
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {processedTable.columnNames.map((name, colIndex) => (
                  <TableHead
                    key={colIndex}
                    onDoubleClick={() => !isQuotation && setEditingHeader(colIndex)}
                    className={cn(
                      'whitespace-nowrap bg-muted/50',
                      !isQuotation && 'cursor-pointer'
                    )}
                  >
                    {editingHeader === colIndex && !isQuotation ? (
                      <Input
                        autoFocus
                        defaultValue={name}
                        onBlur={(e) => {
                          handleHeaderChange(colIndex, e.target.value);
                          setEditingHeader(null);
                        }}
                        onKeyDown={handleKeyDown}
                        className="h-8"
                      />
                    ) : (
                      name || `Column ${colIndex + 1}`
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonEmptyRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <TableCell
                      key={colIndex}
                      onDoubleClick={() =>
                        !isQuotation && setEditingCell({ row: rowIndex, col: colIndex })
                      }
                      className={cn(!isQuotation && 'cursor-pointer')}
                    >
                      {editingCell?.row === rowIndex &&
                      editingCell?.col === colIndex &&
                      !isQuotation ? (
                        <Input
                          autoFocus
                          defaultValue={cell}
                          onBlur={(e) => {
                            handleCellChange(rowIndex, colIndex, e.target.value);
                            setEditingCell(null);
                          }}
                          onKeyDown={handleKeyDown}
                          className="h-8"
                        />
                      ) : (
                        cell
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {nonEmptyRows.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            This table appears to be empty.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
