'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { compressImage, getImageDimensions } from '@/utils/imageCompression';
import { revalidateGalleryCache } from '@/utils/cache';

export default function UploadPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [compressionProgress, setCompressionProgress] = useState(0);
  const supabase = createClient();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      
      // Set compression options based on image dimensions
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: Math.max(dimensions.width, dimensions.height) > 1920 ? 1920 : undefined,
        useWebWorker: true,
      };

      // Compress image
      setCompressionProgress(0);
      const compressedFile = await compressImage(file, compressionOptions);
      setCompressionProgress(100);
      setImage(compressedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError('Failed to process image. Please try again.');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');
    setSuccess('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploadError('You must be logged in to upload.');
      setUploading(false);
      return;
    }

    if (!image) {
      setUploadError('Please select an image.');
      setUploading(false);
      return;
    }

    try {
      // Upload image to Supabase Storage
      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: storageError } = await supabase.storage
        .from('gallery')
        .upload(fileName, image);

      if (storageError) {
        throw new Error('Failed to upload image.');
      }

      const { data: publicUrlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      // Insert gallery item
      const { error: insertError } = await supabase.from('gallery').insert([
        {
          user_id: user.id,
          url: publicUrlData.publicUrl,
          title: caption,
          approved: false,
        },
      ]);

      if (insertError) {
        throw new Error('Failed to submit image.');
      }

      // Revalidate gallery cache
      await revalidateGalleryCache();

      setSuccess('Thank you! Your image has been submitted for review.');
      setImage(null);
      setCaption('');
      router.push('/gallery');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'An error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Upload to Gallery</h1>
      <form onSubmit={handleUpload} className="max-w-md bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {compressionProgress > 0 && compressionProgress < 100 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${compressionProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Compressing image... {compressionProgress}%
              </p>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Caption
          </label>
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <button
          type="submit"
          disabled={uploading || compressionProgress > 0 && compressionProgress < 100}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        {success && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        {uploadError && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {uploadError}
          </div>
        )}
      </form>
    </div>
  );
} 