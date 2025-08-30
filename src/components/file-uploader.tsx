'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

export function FileUploader({ onFileUpload, disabled }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false);
      if (acceptedFiles.length > 0) {
        if (acceptedFiles[0].type !== 'application/pdf') {
          toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload a PDF file.',
          });
          return;
        }
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-card p-8 text-center transition-colors duration-300 hover:border-primary/60 hover:bg-primary/5',
        (isDragActive || isDragging) && 'border-primary bg-primary/10',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full border-8 border-gray-100 bg-gray-50 p-4 transition-colors group-hover:border-primary/10 group-hover:bg-primary/5 dark:border-gray-800/50 dark:bg-gray-900/50 dark:group-hover:border-primary/20">
          <UploadCloud className="h-12 w-12 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-xl font-semibold">
            {isDragActive ? 'Drop the PDF here...' : 'Drag & drop a PDF file here'}
          </p>
          <p className="text-muted-foreground">or click to select a file from your device</p>
          <p className="text-sm text-muted-foreground/80">(Max file size: 10MB)</p>
        </div>
      </div>
    </div>
  );
}
