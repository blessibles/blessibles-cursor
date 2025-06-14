import testimonials from '@/data/testimonials';

export default function Testimonials({ limit }: { limit?: number }) {
  const items = limit ? testimonials.slice(0, limit) : testimonials;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((t) => (
        <div key={t.id} className="bg-white rounded-xl shadow p-6 flex flex-col">
          <div className="text-blue-900 font-semibold mb-2">{t.name}</div>
          <div className="text-blue-700 mb-4">“{t.message}”</div>
          <div className="text-xs text-blue-400 mt-auto">{new Date(t.date).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
} 