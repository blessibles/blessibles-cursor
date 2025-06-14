import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { supabase } from '@/utils/supabaseClient';
import { useEffect, useState } from 'react';

interface AccountSidebarProps {
  className?: string;
}

export default function AccountSidebar({ className }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = [
    { href: '/profile', label: 'Profile' },
    { href: '/account/orders', label: 'Orders & Downloads' },
    { href: '#', label: 'Addresses', disabled: true },
    { href: '#', label: 'Payment Methods', disabled: true },
    { href: '#', label: 'Settings', disabled: true },
  ];
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.name || '',
          email: data.user.email || '',
        });
      }
    }
    fetchUser();
  }, []);

  return (
    <Card className={`w-full md:w-64 ${className || ''}`}>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent>
        {user && (
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-800 mb-2">
              {user.name
                ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
                : user.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="text-blue-900 font-semibold text-base text-center truncate w-full" title={user.name}>{user.name || 'Account'}</div>
            <div className="text-xs text-blue-700 text-center truncate w-full" title={user.email}>{user.email}</div>
          </div>
        )}
        <nav className="flex flex-col gap-2 mb-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            if (item.disabled) {
              return (
                <span
                  key={item.label}
                  className="px-4 py-2 rounded font-medium text-left text-gray-400 bg-gray-50 cursor-not-allowed opacity-70 relative"
                  title="Coming soon"
                >
                  {item.label} <span className="text-xs ml-1">(Coming soon)</span>
                </span>
              );
            }
            return (
              <Link key={item.href} href={item.href} legacyBehavior>
                <a
                  className={`px-4 py-2 rounded font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-blue-100 text-blue-800' 
                      : 'hover:bg-blue-50 text-blue-700'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>
        <button
          className="w-full mt-4 px-4 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/');
          }}
        >
          Log out
        </button>
      </CardContent>
    </Card>
  );
} 