import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface AccountSidebarProps {
  className?: string;
}

export default function AccountSidebar({ className }: AccountSidebarProps) {
  const pathname = usePathname();
  const navItems = [
    { href: '/profile', label: 'Profile' },
    { href: '/account/orders', label: 'Orders & Downloads' },
    // Future: add more items here
  ];

  return (
    <Card className={`w-full md:w-64 ${className || ''}`}>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
      </CardContent>
    </Card>
  );
} 