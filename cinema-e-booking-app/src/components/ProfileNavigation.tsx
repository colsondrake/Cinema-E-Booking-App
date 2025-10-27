'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfileNavigation({ width = '600px' }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Profile Information', path: '/profile' },
    { name: 'Change Password', path: '/profile/change-password' },
    { name: 'Order History', path: '/profile/orders' },
  ];
  
  // Add a back to home link at the top of the profile page
  const backToHome = () => {
    return (
      <div className="mb-4">
        <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    );
  };
  
  return (
    <>
      {backToHome()}
      <div className="bg-white shadow-md rounded-lg overflow-hidden justify-center items-center mb-6 mx-auto"
        style={{ maxWidth: width }}
        >
        <nav className="flex flex-col sm:flex-row justify-center items-center ">
        {navItems.map((item) => {
          const isActive = 
            (item.path === '/profile' && pathname === '/profile') || 
            (item.path !== '/profile' && pathname?.startsWith(item.path));
        
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`px-6 py-3 text-sm font-medium border-b sm:border-b-0 sm:border-r border-gray-200 
              ${isActive 
                ? 'bg-blue-50 text-blue-700 border-blue-500' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              } transition-colors`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  </div>
    </>
  );
}