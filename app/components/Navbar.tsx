import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="Puerto Logo" 
            width={160} 
            height={55} 
            className="object-contain h-10 w-auto" 
          />
        </Link>
        <div className="flex gap-6 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-stone-900 transition">Strona główna</Link>
          <Link href="/about" className="hover:text-stone-900 transition">O nas</Link>
          <Link href="/contact" className="hover:text-stone-900 transition">Kontakt</Link>
        </div>
      </div>
    </nav>
  );
}