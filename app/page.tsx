'use client';

import { supabase } from './supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Efekt do pływającego menu
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Blokada przewijania przy otwartym modalu
  useEffect(() => {
    if (selectedApartment) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [selectedApartment]);

  useEffect(() => {
    async function fetchData() {
      const { data: aptData, error: aptError } = await supabase.from('apartments').select('*');
      if (aptError) {
        setError(aptError.message);
      } else {
        setApartments(aptData || []);
      }

      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1);

      if (settingsData && settingsData.length > 0 && !settingsError) {
        const item = settingsData[0];
        setStats({
          booking_rating: item.booking_rating ?? '9.8',
          booking_reviews_count: item.booking_reviews_count ?? 54,
          google_rating: item.google_rating ?? '5.0',
          google_reviews_count: item.google_reviews_count ?? 24,
        });
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

  const faqItems = [
    { q: "W jakich godzinach odbywa się zameldowanie i wymeldowanie?", a: "Zameldowanie gości rozpoczyna się od godziny 14:00, natomiast wymeldowanie trwa do godziny 10:00 w dniu wyjazdu." },
    { q: "Czy w apartamentach znajduje się aneks kuchenny?", a: "Tak, każdy apartament i pokój posiada w pełni wyposażony aneks kuchenny, w którym znajdziesz niezbędne sprzęty oraz naczynia do przygotowania posiłków." },
    { q: "Czy na terenie obiektu dostępny jest parking?", a: "Tak, dla naszych gości przygotowaliśmy bezpieczny i bezpłatny parking na terenie posesji." },
    { q: "Czy w obiekcie można zostawić bagaż przed zameldowaniem?", a: "Oczywiście! Jeśli przyjedziesz wcześniej, bez problemu możesz bezpiecznie zostawić swój bagaż u gospodarzy przed oficjalną godziną zameldowania." },
    { q: "Czy pościel i ręczniki są wliczone w cenę pobytu?", a: "Tak, komplet świeżej pościeli oraz zestaw ręczników dla każdego z gości są w pełni wliczone w cenę rezerwacji." },
    { q: "Czy w apartamentach akceptowane są zwierzęta domowe?", a: "Z dbałości o najwyższy komfort oraz czystość dla wszystkich odwiedzających nas gości, pobyt ze zwierzętami niestety nie jest akceptowany." }
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F8] text-stone-800 relative font-sans selection:bg-[#D4A373] selection:text-white">
      
      {/* PŁYWAJĄCA NAWIGACJA */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled ? 'bg-white/90 backdrop-blur-md py-4 border-stone-200/50 shadow-sm' : 'bg-transparent py-6 border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">
          <span className={`font-serif text-2xl font-bold tracking-tight transition-colors duration-500 ${isScrolled ? 'text-stone-900' : 'text-white'}`}>
            Puerto.
          </span>
          <button onClick={scrollToApartments} className={`text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-full transition-all duration-300 shadow-lg ${isScrolled ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-white text-stone-900 hover:bg-stone-100'}`}>
            Rezerwuj
          </button>
        </div>
      </nav>

      {/* PEŁNOEKRANOWY BANER (HERO) */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/30 to-stone-900/80 z-10"></div>
        <div className="absolute inset-0">
          <Image 
            src="/images/apt-1.jpg" 
            alt="Puerto Władysławowo" 
            fill 
            className="object-cover"
            priority 
          />
        </div>
        <div className="relative z-20 max-w-4xl mx-auto text-white mt-12">
          <span className="text-stone-200 text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-6 block">
            Władysławowo, Polska
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-8 leading-[1.1] drop-shadow-lg">
            Przestrzeń stworzona <br className="hidden md:block"/> dla Twojego relaksu.
          </h1>
          <p className="text-lg md:text-xl text-stone-100 mb-12 font-light max-w-2xl mx-auto drop-shadow-md leading-relaxed">
            Nowoczesne wnętrza, szum morza za oknem i standard, który sprosta Twoim najwyższym oczekiwaniom.
          </p>
          <button 
            onClick={scrollToApartments}
            className="group relative inline-flex items-center justify-center gap-3 bg-[#D4A373] text-white font-bold px-10 py-5 rounded-full overflow-hidden transition-all duration-300 hover:bg-[#c39263] hover:scale-105 shadow-[0_0_40px_rgba(212,163,115,0.4)] cursor-pointer"
          >
            <span>Odkryj apartamenty</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </button>
        </div>
      </section>

      {/* SZKLANE KARTY ATUTÓW (Nakładające się na tło) */}
      <section className="max-w-6xl mx-auto px-6 relative z-30 -mt-20 md:-mt-24 mb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "✦", title: "Wyjątkowa lokalizacja", desc: "Zaledwie kilka minut spacerem dzieli Cię od szerokiej, piaszczystej plaży." },
            { icon: "✓", title: "Pełne wyposażenie", desc: "Aneks kuchenny, szybkie Wi-Fi i bezpieczny parking w cenie pobytu." },
            { icon: "★", title: "Najwyższy standard", desc: "Nieskazitelna czystość i dbałość o każdy detal poparte opiniami gości." }
          ].map((feature, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/40 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-stone-900 text-[#D4A373] flex items-center justify-center text-2xl font-serif mb-6 shadow-md">
                {feature.icon}
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-xl mb-3">{feature.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LISTA APARTAMENTÓW (Styl Airbnb) */}
      <section id="apartments" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">Wybierz swój pobyt</h2>
            <p className="text-stone-500 max-w-xl text-lg">Zaprojektowane z myślą o komforcie pary lub całej rodziny. Znajdź przestrzeń idealną dla siebie.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400 font-medium animate-pulse">Ładowanie luksusu...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 font-bold bg-red-50 rounded-3xl">Błąd pobierania danych: {error}</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {apartments?.map((apt, index) => {
              const imageSrc = apartmentImages[index % apartmentImages.length];

              return (
                <div key={apt.id} className="group cursor-pointer flex flex-col" onClick={() => { setSelectedApartment(apt); setActiveImageIndex(index % apartmentImages.length); }}>
                  {/* Zdjęcie z efektem zoom */}
                  <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden mb-5 bg-stone-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <Image 
                      src={imageSrc} 
                      alt={apt.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                    />
                    {/* Przyciemnienie na dole dla efektu */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-stone-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                      Do {apt.capacity} osób
                    </div>
                  </div>
                  
                  {/* Opis pod zdjęciem */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 mb-1 group-hover:text-[#D4A373] transition-colors">{apt.name}</h3>
                      <p className="text-stone-500 text-sm line-clamp-1 mb-2">{apt.description}</p>
                      <p className="text-stone-900 font-medium">
                        <span className="font-extrabold text-lg">{apt.price_per_night} zł</span> <span className="text-stone-500 font-normal">/ noc</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SEKCJA OPINII */}
      <section className="bg-stone-900 text-white py-24 mt-20 relative overflow-hidden">
        {/* Dekoracyjne koło w tle */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A373] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Zaufanie gości</h2>
            <p className="text-stone-400 max-w-xl mx-auto">Dbamy o każdy detal, co znajduje odzwierciedlenie w najwyższych ocenach na niezależnych portalach turystycznych.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-stone-800/50 backdrop-blur-sm p-10 rounded-3xl border border-stone-700/50 hover:bg-stone-800 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-600 text-white text-lg font-bold px-3 py-2 rounded-xl">{stats.booking_rating}</div>
                <div>
                  <h4 className="font-bold text-lg">Booking.com</h4>
                  <div className="text-yellow-500 text-sm tracking-widest">★★★★★</div>
                </div>
              </div>
              <p className="text-stone-300 italic mb-6">"Ocena 'Wyjątkowy' przyznana przez zweryfikowanych wczasowiczów na podstawie {stats.booking_reviews_count} opinii."</p>
              <a href="https://www.booking.com/" target="_blank" rel="noopener noreferrer" className="text-[#D4A373] font-bold text-sm hover:text-white transition-colors flex items-center gap-2">
                Sprawdź na Booking &rarr;
              </a>
            </div>

            <div className="bg-stone-800/50 backdrop-blur-sm p-10 rounded-3xl border border-stone-700/50 hover:bg-stone-800 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white text-stone-900 text-lg font-bold px-3 py-2 rounded-xl flex items-center gap-1">
                  <span className="text-blue-500">G</span> {stats.google_rating}
                </div>
                <div>
                  <h4 className="font-bold text-lg">Google Maps</h4>
                  <div className="text-yellow-500 text-sm tracking-widest">★★★★★</div>
                </div>
              </div>
              <p className="text-stone-300 italic mb-6">"Zobacz realne oceny i relacje z pobytu na podstawie {stats.google_reviews_count} opinii w wizytówce Google."</p>
              <a href="https://maps.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#D4A373] font-bold text-sm hover:text-white transition-colors flex items-center gap-2">
                Zobacz w Google &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA FAQ */}
      <section className="bg-[#F9F9F8] py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">Masz pytania?</h2>
            <p className="text-stone-500">Wszystko, co warto wiedzieć przed przyjazdem.</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button onClick={() => toggleFaq(index)} className="w-full p-6 text-left flex justify-between items-center font-bold text-stone-900 focus:outline-none cursor-pointer">
                    <span className="text-base pr-8">{item.q}</span>
                    <span className={`transform transition-transform duration-300 text-2xl text-[#D4A373] ${isOpen ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  <div className={`px-6 text-stone-600 text-sm leading-relaxed overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {item.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STOPKA */}
      <footer className="bg-white border-t border-stone-200 py-12 text-center">
        <span className="font-serif text-2xl font-bold text-stone-900 block mb-4">Puerto.</span>
        <p className="text-sm text-stone-500">&copy; {new Date().getFullYear()} Apartamenty Puerto Władysławowo. Wszelkie prawa zastrzeżone.</p>
      </footer>

      {/* LUKSUSOWY MODAL */}
      {selectedApartment && (
        <div onClick={() => setSelectedApartment(null)} className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[2rem] max-w-3xl w-full relative shadow-2xl my-auto overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row">
            
            <button onClick={() => setSelectedApartment(null)} className="absolute top-4 right-4 bg-white/50 hover:bg-white backdrop-blur-md text-stone-900 w-10 h-10 rounded-full flex items-center justify-center font-bold transition z-20 shadow-sm cursor-pointer">
              ✕
            </button>

            {/* Lewa strona modala - Galeria */}
            <div className="w-full md:w-1/2 relative h-64 md:h-auto bg-stone-100">
              <Image src={apartmentImages[activeImageIndex]} alt="Zdjęcie apartamentu" fill className="object-cover transition-all duration-500" />
              <button onClick={() => setActiveImageIndex((prev) => (prev === 0 ? apartmentImages.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-900 w-10 h-10 rounded-full flex items-center justify-center shadow-md font-bold transition cursor-pointer">
                &larr;
              </button>
              <button onClick={() => setActiveImageIndex((prev) => (prev === apartmentImages.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-900 w-10 h-10 rounded-full flex items-center justify-center shadow-md font-bold transition cursor-pointer">
                &rarr;
              </button>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                {apartmentImages.map((_, idx) => (
                  <div key={idx} onClick={() => setActiveImageIndex(idx)} className={`w-2 h-2 rounded-full cursor-pointer transition-all ${activeImageIndex === idx ? 'bg-white scale-125' : 'bg-white/50'}`} />
                ))}
              </div>
            </div>

            {/* Prawa strona modala - Treść */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white">
              <span className="text-xs font-bold tracking-widest uppercase text-[#D4A373] mb-2 block">Szczegóły obiektu</span>
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">{selectedApartment.name}</h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">{selectedApartment.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <span className="text-xs text-stone-500 block mb-1">Cena</span>
                  <span className="text-xl font-bold text-stone-900">{selectedApartment.price_per_night} zł <span className="text-sm font-normal text-stone-500">/ noc</span></span>
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <span className="text-xs text-stone-500 block mb-1">Pojemność</span>
                  <span className="text-xl font-bold text-stone-900">Do {selectedApartment.capacity} os.</span>
                </div>
              </div>

              <Link href={`/book/${selectedApartment.id}`} className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl hover:bg-stone-800 transition text-center shadow-lg hover:shadow-xl flex justify-center items-center gap-2 cursor-pointer">
                Wybieram ten <span className="text-lg">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}