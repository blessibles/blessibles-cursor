"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Image from 'next/image';

export default function AdminGalleryPage() {
  const [user, setUser] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchUserAndGallery() {
      setLoading(true);
      setError('');
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || userData.user.user_metadata?.role !== 'admin') {
        router.push('/');
        return;
      }
      setUser(userData.user);
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('approved', false)
        .order('date', { ascending: false });
      if (error) {
        setError('Failed to load gallery items.');
        setGallery([]);
      } else {
        setGallery(data || []);
      }
      setLoading(false);
    }
    fetchUserAndGallery();
  }, [router]);

  const handleApprove = async (id: string) => {
    setError('');
    const { error } = await supabase
      .from('gallery_items')
      .update({ approved: true })
      .eq('id', id);
    if (error) {
      setError('Failed to approve image.');
    } else {
      setGallery((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id);
    if (error) {
      setError('Failed to delete image.');
    } else {
      setGallery((prev) => prev.filter((g) => g.id !== id));
    }
  };

  if (loading) return <div className="text-blue-700 p-8">Loading gallery items...</div>;
  if (error) return <div className="text-red-600 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">Moderate Gallery Submissions</h1>
        {gallery.length === 0 ? (
          <div className="text-blue-700 text-center">No images pending approval.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <div key={item.id} className="bg-blue-50 rounded-xl shadow p-4 flex flex-col items-center">
                <Image
                  src={item.image_url}
                  alt={item.caption || 'Gallery image'}
                  width={256}
                  height={256}
                  className="rounded-lg mb-2 max-h-64 object-contain"
                  loading="lazy"
                />
                {item.caption && <div className="text-blue-900 font-medium mb-1 text-center">{item.caption}</div>}
                <div className="text-xs text-blue-400 text-center mb-2">{new Date(item.date).toLocaleDateString()}</div>
                <div className="flex gap-4">
                  <button
                    className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800 transition"
                    onClick={() => handleApprove(item.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-700 text-white px-4 py-2 rounded font-semibold hover:bg-red-800 transition"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 