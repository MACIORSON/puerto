import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apartamenty Puerto",
  description: "Nowoczesny system rezerwacji apartamentów",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50" suppressHydrationWarning>
        
        {/* ELEGANCKI GÓRNY PASEK KONTAKTOWY (Ciepły odcień morskiego grafitu) */}
        <div className="bg-slate-900 text-stone-300 text-xs py-2 px-6 border-b border-slate-800 z-50 relative">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
            
            {/* Dane kontaktowe po lewej */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 font-light">
              <a href="tel:+48609668134" className="flex items-center gap-2 hover:text-white transition">
                <span>📞</span> 
                <span>+48 609 668 134</span>
              </a>
              <a href="mailto:kontakt@puerto-wladyslawowo.pl" className="flex items-center gap-2 hover:text-white transition">
                <span>✉️</span> 
                <span>kontakt@puerto-wladyslawowo.pl</span>
              </a>
              <div className="flex items-center gap-2">
                <span>📍</span> 
                <span>ul. Krótka 1, Władysławowo</span>
              </div>
            </div>

            {/* Logo Facebooka po prawej */}
            <div className="flex items-center gap-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61577936825974" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="relative w-6 h-6 rounded-full overflow-hidden hover:opacity-90 transition shadow-sm block bg-blue-600 flex-shrink-0"
                aria-label="Facebook"
              >
                <Image 
                  src="/images/facebook.jpg" 
                  alt="Facebook" 
                  fill 
                  className="object-cover scale-110" 
                />
              </a>
            </div>

          </div>
        </div>

        {/* GŁÓWNY NAVBAR (Stonowane, eleganckie tło zamiast ostrej bieli) */}
        <Navbar />

        {/* TREŚĆ STRONY */}
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}