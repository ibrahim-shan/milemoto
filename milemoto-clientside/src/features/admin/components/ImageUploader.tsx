'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { post } from '@/lib/api';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/input';

type UploadResponse = {
  uploadUrl: string;
  publicUrl: string;
  objectPath: string;
};

type Props = {
  value: string | null;
  onUpload: (url: string) => void;
  folder: string; // e.g., 'flags', 'products'
};

export function ImageUploader({ value, onUpload, folder }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      toast.error('File is too large (max 2MB)');
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
        headers: {
          'Content-Type': file.type,
        },
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

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 1. Image Preview */}
      <div className="border-border bg-muted flex h-20 w-full shrink-0 items-center justify-center rounded-md border">
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : value ? (
          <Image
            src={value}
            alt="Preview"
            width={80}
            height={80}
            className="h-full w-full rounded-md object-contain"
          />
        ) : (
          <ImageIcon className="text-muted-foreground h-8 w-8" />
        )}
      </div>

      {/* 2. Upload Button (triggers hidden input) */}
      <div className="w-full space-y-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('flag-upload-input')?.click()}
          disabled={isLoading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? 'Uploading...' : 'Upload Image'}
        </Button>
        <p className="text-muted-foreground text-xs">PNG, JPG, SVG (Max 2MB)</p>

        {/* 3. Hidden File Input */}
        <Input
          id="flag-upload-input"
          type="file"
          accept="image/png, image/jpeg, image/svg+xml, image/webp"
          className="sr-only"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
