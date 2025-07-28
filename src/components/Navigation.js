import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Nyumbangin
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Beranda
            </Link>
            <Link href="/donate" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md">
              Donasi Sekarang
            </Link>
            <Link href="/admin/login" className="text-gray-600 hover:text-gray-900 text-sm">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
