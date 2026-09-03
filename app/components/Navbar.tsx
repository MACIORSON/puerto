'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Funkcja do płynnego zjeżdżania na sam dół
  const scrollToFooter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 py-1' 
          : 'bg-transparent border-transparent py-4'
      }`}
    >
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
        
        <div className={`flex gap-6 text-sm font-medium transition-colors duration-500 ${
          isScrolled ? 'text-gray-700' : 'text-white drop-shadow-md'
        }`}>
          <Link href="/" className={`transition ${isScrolled ? 'hover:text-stone-900' : 'hover:text-stone-200'}`}>Strona główna</Link>
          <a href="#footer" onClick={scrollToFooter} className={`cursor-pointer transition ${isScrolled ? 'hover:text-stone-900' : 'hover:text-stone-200'}`}>O nas</a>
          <a href="#footer" onClick={scrollToFooter} className={`cursor-pointer transition ${isScrolled ? 'hover:text-stone-900' : 'hover:text-stone-200'}`}>Kontakt</a>
        </div>
      </div>
    </nav>
  );
}