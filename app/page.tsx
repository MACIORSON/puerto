'use client';

import { supabase } from '../supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtry wyszukiwania
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  useEffect(() => {
    async function fetchApartments() {
      const { data, error } = await supabase
        .from('apartments')
        .select('*');

      if (error) {
        setError(error.message);
      } else {
        setApartments(data || []);
      }
      setLoading(false);
    }
    fetchApartments();
  }, []);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* NAGŁÓWEK */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
            Apartamenty Puerto
          </span>
          <a 
            href="#oferta" 
            className="text-xs uppercase tracking-widest font-bold bg-stone-900 text-white px-5 py-2.5 rounded-full hover:bg-stone-800 transition"
          >
            Rezerwuj teraz
          </a>
        </div>
      </header>

      {/* SEKCJA HERO */}
      <section className="relative px-6 py-24 md:py-32 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-serif font-extrabold tracking-tight text-stone-900 mb-6">
          Twój luksusowy odpocznek w Puerto
        </h1>
        <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto font-light leading-relaxed mb-12">
          Odkryj wyjątkowe apartamenty stworzone z myślą o komforcie, relaksie i niezapomnianych chwilach.
        </p>

        {/* WYSZUKIWARKA / FILTRY */}
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-xl border border-stone-100 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          
          <div className="text-left px-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Zameldowanie</label>
            <input 
              type="date" 
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full text-sm font-medium text-stone-900 bg-white outline-none cursor-pointer"
            />
          </div>

          <div className="text-left px-2 border-t md:border-t-0 md:border-l border-stone-100 pt-3 md:pt-0">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Wymeldowanie</label>
            <input 
              type="date" 
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm font-medium text-stone-900 bg-white outline-none cursor-pointer"
            />
          </div>

          <div className="text-left px-2 border-t md:border-t-0 md:border-l border-stone-100 pt-3 md:pt-0 relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Goście</label>
            <button 
              type="button"
              onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
              className="w-full text-left text-sm font-medium text-stone-900 bg-white outline-none py-1"
            >
              {guests} {guests === 1 ? 'Gość' : guests < 5 ? 'Goście' : 'Gości'}
            </button>

            {showGuestsDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-stone-200 rounded-2xl shadow-xl p-3 z-30">
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs font-medium text-stone-700">Liczba osób</span>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-7 h-7 rounded-full bg-stone-100 text-stone-900 font-bold flex items-center justify-center hover:bg-stone-200"
                    >-</button>
                    <span className="text-sm font-bold w-4 text-center">{guests}</span>
                    <button 
                      type="button" 
                      onClick={() => setGuests(guests + 1)}
                      className="w-7 h-7 rounded-full bg-stone-100 text-stone-900 font-bold flex items-center justify-center hover:bg-stone-200"
                    >+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <a 
              href="#oferta"
              className="w-full h-full bg-[#D4A373] hover:bg-[#c39263] text-stone-900 font-bold py-4 rounded-2xl transition flex items-center justify-center text-sm shadow-sm"
            >
              Szukaj wolnych
            </a>
          </div>

        </div>
      </section>

      {/* LISTA APARTAMENTÓW */}
      <section id="oferta" className="max-w-6xl mx-auto px-6 py-16 border-t border-stone-200/60">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-3">Wybierz swój apartament</h2>
          <p className="text-stone-600 text-sm max-w-md mx-auto">Przestronne i doskonale wyposażone wnętrza stworzone z myślą o komforcie.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400">Ładowanie apartamentów...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 font-bold">Błąd pobierania danych: {error}</div>
        ) : apartments.length === 0 ? (
          <div className="text-center py-20 text-stone-500">Brak dostępnych apartamentów w bazie.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {apartments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 flex flex-col hover:shadow-md transition">
                <div className="h-56 bg-stone-200 relative">
                  {apt.image_url ? (
                    <img src={apt.image_url} alt={apt.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">Brak zdjęcia</div>
                  )}
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-stone-900 shadow-sm">
                    {apt.price_per_night} zł / doba
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">{apt.name}</h3>
                    <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed mb-4">{apt.description}</p>
                    <p className="text-xs text-stone-400 font-medium mb-6">Maksymalnie do {apt.capacity} osób</p>
                  </div>
                  <Link 
                    href={`/apartaments/${apt.id}?checkin=${checkIn}&checkout=${checkOut}&adults=${guests}`}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-3 rounded-2xl transition text-center text-sm"
                  >
                    Zobacz szczegóły i rezerwuj
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* STOPKA */}
      <footer className="bg-white border-t border-stone-200 py-12 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} Apartamenty Puerto. Wszelkie prawa zastrzeżone.</p>
      </footer>
    </main>
  );
}