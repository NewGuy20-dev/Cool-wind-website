'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  category: string;
  partId?: string;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  category,
  partId,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setUploading(true);

    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        if (partId) {
          formData.append('partId', partId);
        }

        // Upload to API
        const response = await fetch('/api/spare-parts/upload', {
          method: 'POST',
          headers: {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'WindOps2025!GRK2012COOLWIND',
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newUrls = [...value, ...uploadedUrls].slice(0, maxImages);
      onChange(newUrls);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxImages, category, partId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
    disabled: uploading || value.length >= maxImages,
  });

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
    }

    return { valid: true };
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {value.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105 shadow-lg'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 hover:shadow-md'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all ${
            isDragActive ? 'bg-blue-500 scale-110' : 'bg-gray-100'
          }`}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-white' : 'text-gray-400'}`} />
          </div>
          {uploading ? (
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600 font-semibold">Uploading...</p>
            </div>
          ) : isDragActive ? (
            <p className="text-blue-600 font-semibold text-lg">Drop images here...</p>
          ) : (
            <div>
              <p className="text-gray-700 font-semibold mb-2 text-lg">
                Drag & drop images here, or click to select
              </p>
              <p className="text-sm text-gray-500 font-medium">
                JPG, PNG, WebP up to 5MB • {value.length}/{maxImages} images uploaded
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 px-5 py-4 rounded-xl shadow-sm">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Image Gallery */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-lg"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <p className="text-sm text-gray-600 font-medium bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
        💡 First image will be used as the primary product image
      </p>
    </div>
  );
}
