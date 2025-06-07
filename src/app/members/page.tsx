"use client";
import Link from 'next/link';
import Image from 'next/image';

// Mock member data
const mockMembers = [
  {
    id: 1,
    name: 'Sarah M.',
    avatar: '/avatars/avatar1.png',
    bio: 'Mom of 3, Sunday school teacher, loves journaling.',
  },
  {
    id: 2,
    name: 'John D.',
    avatar: '/avatars/avatar2.png',
    bio: 'Dad, worship leader, enjoys family devotionals.',
  },
  {
    id: 3,
    name: 'Emily R.',
    avatar: '/avatars/avatar3.png',
    bio: 'Homeschool mom, passionate about faith-based crafts.',
  },
];

export default function MembersPage() {
  // Mock auth: assume user is logged in
  const isLoggedIn = true;

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Member Directory</h1>
          <p className="mb-4 text-blue-700">Please <Link href="/login" className="text-blue-600 underline hover:text-blue-800">log in</Link> to view the member directory.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Member Directory</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {mockMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <Image src={member.avatar} alt={member.name} width={80} height={80} className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-blue-200" loading="lazy" />
            <Link href={`/members/${member.id}`} className="text-blue-900 font-bold text-lg hover:underline mb-1">{member.name}</Link>
            <p className="text-blue-700 text-center text-sm">{member.bio}</p>
          </div>
        ))}
      </div>
    </main>
  );
} 