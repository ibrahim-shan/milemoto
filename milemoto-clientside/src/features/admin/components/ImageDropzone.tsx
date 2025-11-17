'use client';

import { useState, type DragEvent, type KeyboardEvent } from 'react';
import Image from 'next/image';

import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

import { post } from '@/lib/api'; // Your API client
import { cn } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/input';

type UploadResponse = {
  uploadUrl: string;
  publicUrl: string;
  objectPath: string;
};

type Props = {
  value: string | null; // The current image URL
  onUpload: (url: string) => void;
  onRemove: () => void;
  folder: string; // e.g., 'flags', 'products'
  className?: string;
};

export function ImageDropzone({ value, onUpload, onRemove, folder, className }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // --- Main Upload Logic ---
  const handleUpload = async (file: File | null) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      toast.error('File is too large (max 2MB)');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type (PNG, JPG, SVG, WEBP only)');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get signed URL from your backend
      const { uploadUrl, publicUrl } = await post<UploadResponse>('/uploads/signed', {
        filename: file.name,
        contentType: file.type,
        folder: folder,
      });

      // 2. Upload file directly to Firebase Storage
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // 3. Return the public URL to the parent form
      onUpload(publicUrl);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Event Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files?.[0] || null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files?.[0] || null);
  };

  // --- Hidden Input ---
  const fileInput = (
    <Input
      id="image-dropzone-input"
      type="file"
      accept="image/png, image/jpeg, image/svg+xml, image/webp"
      className="sr-only"
      onChange={handleFileChange}
      disabled={isLoading}
    />
  );

  const openFileDialog = () => document.getElementById('image-dropzone-input')?.click();
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div
        className={cn(
          'border-border bg-muted flex h-48 w-full items-center justify-center rounded-lg border',
          className,
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (value) {
    return (
      <div className={cn('relative h-48 w-full', className)}>
        <Image
          src={value}
          alt="Uploaded flag"
          fill
          className="rounded-lg border object-contain"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-border bg-background relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
        isDragging && 'border-primary bg-primary/10',
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFileDialog}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Upload image"
    >
      <Upload className="h-8 w-8" />
      <p className="mt-2 font-semibold">Drag & drop file here</p>
      <p className="text-muted-foreground text-sm">Or click to browse (max 2MB)</p>
      <Button
        type="button"
        variant="solid"
        size="sm"
        className="pointer-events-none mt-4" // 'pointer-events-none' so click goes to parent
      >
        Browse file
      </Button>
      {fileInput}
    </div>
  );
}
