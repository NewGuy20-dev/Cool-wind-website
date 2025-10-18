// Supabase Storage helper functions for spare parts images
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'spare-parts-images';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload an image to Supabase Storage
 * @param file - File to upload
 * @param category - Product category (ac/refrigerator)
 * @param partId - Part ID for organizing files
 * @returns Upload result with public URL
 */
export async function uploadImage(
  file: File,
  category: string,
  partId?: string
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;
    
    // Create path: category/partId/filename or category/filename
    const path = partId 
      ? `${category}/${partId}/${fileName}`
      : `${category}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: '', path: '', error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return { url: publicUrl, path, error: undefined };
  } catch (error: any) {
    console.error('Upload exception:', error);
    return { url: '', path: '', error: error.message };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param path - File path in storage
 * @returns Success status
 */
export async function deleteImage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete exception:', error);
    return false;
  }
}

/**
 * Delete multiple images
 * @param paths - Array of file paths
 * @returns Success status
 */
export async function deleteImages(paths: string[]): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(paths);

    if (error) {
      console.error('Bulk delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Bulk delete exception:', error);
    return false;
  }
}

/**
 * Get public URL for an image
 * @param path - File path in storage
 * @returns Public URL
 */
export function getPublicUrl(path: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  
  return publicUrl;
}

/**
 * Extract storage path from public URL
 * @param url - Public URL
 * @returns Storage path
 */
export function extractPathFromUrl(url: string): string {
  try {
    const urlParts = url.split(`${BUCKET_NAME}/`);
    return urlParts[1] || '';
  } catch {
    return '';
  }
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
  }

  return { valid: true };
}

/**
 * Create Supabase Storage bucket if it doesn't exist
 * This should be called once during setup
 */
export async function ensureBucketExists(): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket with public access
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      });

      if (error) {
        console.error('Bucket creation error:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Bucket check exception:', error);
    return false;
  }
}
