'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
  acceptImages?: boolean;
}

export function FileUploader({ onFileUpload, disabled, acceptImages = true }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false);
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validTypes = acceptImages 
          ? ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
          : ['application/pdf'];
        
        if (!validTypes.includes(file.type)) {
          toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: acceptImages 
              ? 'Please upload a PDF or image file (PNG, JPEG, WebP).'
              : 'Please upload a PDF file.',
          });
          return;
        }
        onFileUpload(file);
      }
    },
    [onFileUpload, toast, acceptImages]
  );

  const acceptedFileTypes = acceptImages
    ? { 
        'application/pdf': ['.pdf'],
        'image/png': ['.png'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/webp': ['.webp']
      }
    : { 'application/pdf': ['.pdf'] } as const;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes as any,
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
            {isDragActive 
              ? 'Drop the file here...' 
              : acceptImages 
                ? 'Drag & drop a PDF or image file here'
                : 'Drag & drop a PDF file here'}
          </p>
          <p className="text-muted-foreground">or click to select a file from your device</p>
          <p className="text-sm text-muted-foreground/80">
            {acceptImages ? '(Supports: PDF, PNG, JPEG, WebP • Max: 10MB)' : '(Max file size: 10MB)'}
          </p>
        </div>
      </div>
    </div>
  );
}
