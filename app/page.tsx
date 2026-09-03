'use client';

import { supabase } from './supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    booking_rating: '9.8',
    booking_reviews_count: 54,
    google_rating: '5.0',
    google_reviews_count: 24,
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedApartment, setSelectedApartment] = useState<any | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToApartments = () => {
    const section = document.getElementById('apartments');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    async function fetchData() {
      const { data: aptData, error: aptError } = await supabase.from('apartments').select('*');
      if (aptError) {
        setError(aptError.message);
      } else {
        setApartments(aptData || []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const apartmentImages = [
    "/images/apt-1.jpg",
    "/images/apt-2.jpg",
    "/images/apt-3.jpg",
    "/images/apt-4.jpg",
    "/images/apt-5.jpg",
    "/images/apt-6.jpg",
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 relative">
      
      {/* Baner główny */}
      <section className="relative h-[80vh] min-h-[550px] flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-stone-900/40 z-10"></div>
        <div className="absolute inset-0">
          <Image src="/images/apt-1.jpg" alt="Puerto Władysławowo" fill className="object-cover" priority />
        </div>
        <div className="relative z-20 max-w-4xl mx-auto text-white">
          <div className="mb-6 flex justify-center">
            <Image src="/logo.png" alt="Puerto Władysławowo" width={240} height={85} className="object-contain h-16 md:h-20 w-auto brightness-0 invert drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6 leading-tight">
            Twój luksusowy azymut nad morzem
          </h1>
          <p className="text-lg md:text-xl text-stone-200 mb-10 font-light max-w-2xl mx-auto">
            Nowoczesne apartamenty tuż przy plaży. Czystość, komfort i niezapomniana atmosfera.
          </p>
          <button onClick={scrollToApartments} className="bg-stone-900 text-white font-medium px-8 py-4 rounded-full shadow-xl hover:bg-stone-800 transition duration-300 inline-block border border-stone-700 cursor-pointer">
            Sprawdź wolne pokoje
          </button>
        </div>
      </section>

      {/* Lista wszystkich 9 pokoi */}
      <section id="apartments" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
            Wszystkie dostępne pokoje (1 - 9)
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto">Wybierz konkretny pokój, sprawdź dostępność i zarezerwuj swój pobyt we Władysławowie.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 font-medium text-center border border-red-100">
            Błąd połączenia z bazą: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-stone-400 font-medium">Ładowanie pokoi...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apartments?.map((apt, index) => {
              const imageSrc = apartmentImages[index % apartmentImages.length];

              return (
                <div key={apt.id} className="bg-white rounded-3xl shadow-sm overflow-hidden border border-stone-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                  <div onClick={() => { setSelectedApartment(apt); setActiveImageIndex(index % apartmentImages.length); }} className="relative h-60 w-full bg-stone-100 overflow-hidden cursor-pointer block">
                    <Image src={imageSrc} alt={apt.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      Do {apt.capacity} osób
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 onClick={() => { setSelectedApartment(apt); setActiveImageIndex(index % apartmentImages.length); }} className="text-xl font-serif font-bold text-stone-900 mb-2 hover:text-blue-600 transition cursor-pointer">
                      {apt.name}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed mb-6">{apt.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-stone-100 text-stone-700 text-xs px-2.5 py-1 rounded-lg">Aneks kuchenny</span>
                      <span className="bg-stone-100 text-stone-700 text-xs px-2.5 py-1 rounded-lg">Wi-Fi</span>
                    </div>
                  </div>
                  <div className="bg-stone-50/50 px-6 py-5 border-t border-stone-100 flex justify-between items-center">
                    <div>
                      <span className="text-xl font-bold text-stone-900">{apt.price_per_night} zł</span>
                      <span className="text-xs text-stone-500 block">za dobę</span>
                    </div>
                    <Link href={`/book/${apt.id}`} className="bg-stone-900 text-white font-medium px-5 py-2.5 rounded-2xl hover:bg-stone-800 transition shadow-sm text-sm">
                      Rezerwuj
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Stopka */}
      <footer id="footer" className="bg-white border-t border-stone-200 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-stone-400">
          <p>&copy; {new Date().getFullYear()} Apartamenty Puerto Władysławowo. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}