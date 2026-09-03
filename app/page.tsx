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

  // Stan przechowujący ID obecnie rozwiniętej kategorii
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Dokładna liczba zdjęć w poszczególnych folderach pokoi (1-9)
  const roomImageCounts: Record<number, number> = {
    1: 11,
    2: 6,
    3: 5,
    4: 11,
    5: 6,
    6: 5,
    7: 6,
    8: 5,
    9: 8,
  };

  // Precyzyjne mapowanie kategorii z bazy na numery pokoi:
  // Indeks 0 (np. Apartament Rodzinny) -> Pokoje 1, 4, 7
  // Indeks 1 (np. Pokój dla Pary Deluxe) -> Pokoje 2, 5, 8
  // Indeks 2 (np. Studio Compact) -> Pokoje 3, 6, 9
  const categoryRoomsMap: Record<number, number[]> = {
    0: [1, 4, 7],
    1: [2, 5, 8],
    2: [3, 6, 9],
  };

  const getRoomImages = (roomNumber: number) => {
    const count = roomImageCounts[roomNumber] || 4;
    const images = [];
    for (let i = 1; i <= count; i++) {
      images.push(`/images/pokoj ${roomNumber}/pokoj ${roomNumber} (${i}).jpg`);
    }
    return images;
  };

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
    if (selectedApartment) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedApartment]);

  useEffect(() => {
    async function fetchData() {
      // Pobieramy rodzaje z tabeli apartments
      const { data: aptData, error: aptError } = await supabase.from('apartments').select('*');
      if (aptError) {
        setError(aptError.message);
      } else {
        setApartments(aptData || []);
        if (aptData && aptData.length > 0) {
          setExpandedCategoryId(aptData[0].id); // Domyślnie rozwijamy pierwszą kategorię
        }
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

  const faqItems = [
    {
      q: "W jakich godzinach odbywa się zameldowanie i wymeldowanie?",
      a: "Zameldowanie gości rozpoczyna się od godziny 14:00, natomiast wymeldowanie trwa do godziny 10:00 w dniu wyjazdu."
    },
    {
      q: "Czy w apartamentach znajduje się aneks kuchenny?",
      a: "Tak, każdy apartament i pokój posiada w pełni wyposażony aneks kuchenny, w którym znajdziesz niezbędne sprzęty oraz naczynia do przygotowania posiłków."
    },
    {
      q: "Czy na terenie obiektu dostępny jest parking?",
      a: "Tak, dla naszych gości przygotowaliśmy bezpieczny i bezpłatny parking na terenie posesji."
    },
    {
      q: "Czy w obiekcie można zostawić bagaż przed zameldowaniem?",
      a: "Oczywiście! Jeśli przyjedziesz wcześniej, bez problemu możesz bezpiecznie zostawić swój bagaż u gospodarzy przed oficjalną godziną zameldowania."
    },
    {
      q: "Czy pościel i ręczniki są wliczone w cenę pobytu?",
      a: "Tak, komplet świeżej pościeli oraz zestaw ręczników dla każdego z gości są w pełni wliczone w cenę rezerwacji."
    },
    {
      q: "Czy w apartamentach akceptowane są zwierzęta domowe?",
      a: "Z dbałości o najwyższy komfort oraz czystość dla wszystkich odwiedzających nas gości, pobyt ze zwierzętami niestety nie jest akceptowany."
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 relative">
      
      {/* Baner główny */}
      <section className="relative h-[80vh] min-h-[550px] flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-stone-900/40 z-10"></div>
        <div className="absolute inset-0">
          <Image 
            src="/images/pokoj 1/pokoj 1 (1).jpg" 
            alt="Puerto Władysławowo" 
            fill 
            className="object-cover"
            priority 
          />
        </div>
        <div className="relative z-20 max-w-4xl mx-auto text-white">
          <div className="mb-6 flex justify-center">
            <Image 
              src="/logo.png" 
              alt="Puerto Władysławowo" 
              width={240} 
              height={85} 
              className="object-contain h-16 md:h-20 w-auto brightness-0 invert drop-shadow-lg" 
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6 leading-tight">
            Twój luksusowy azymut nad morzem
          </h1>
          <p className="text-lg md:text-xl text-stone-200 mb-10 font-light max-w-2xl mx-auto">
            Nowoczesne apartamenty tuż przy plaży. Czystość, komfort i niezapomniana atmosfera.
          </p>
          <button 
            onClick={scrollToApartments}
            className="bg-stone-900 text-white font-medium px-8 py-4 rounded-full shadow-xl hover:bg-stone-800 transition duration-300 inline-block border border-stone-700 cursor-pointer"
          >
            Sprawdź wolne terminy
          </button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-12 relative z-30">
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100/80 p-8 md:p-10 grid md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-900 flex-shrink-0 text-xl font-serif">✦</div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1">Wyjątkowa lokalizacja</h3>
              <p className="text-stone-500 text-xs leading-relaxed">Zaledwie kilka minut spacerem dzieli Cię od szerokiej, piaszczystej plaży oraz lokalnych atrakcji.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-900 flex-shrink-0 text-xl font-serif">✓</div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1">Bezproblemowy pobyt</h3>
              <p className="text-stone-500 text-xs leading-relaxed">W cenie pobytu otrzymujesz bezpieczny parking na posesji, szybkie Wi-Fi oraz w pełni wyposażony aneks kuchenny.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-900 flex-shrink-0 text-xl font-serif">★</div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1">Najwyższy standard</h3>
              <p className="text-stone-500 text-xs leading-relaxed">Nowoczesny design, nieskazitelna czystość oraz dbałość o każdy detal potwierdzone oceną 9.8 / 10.</p>
            </div>
          </div>
        </div>
      </section>

      {/* GŁÓWNA SEKCJA: KATEGORIE Z ROZWIJANYMI NUMERAMI POKOI */}
      <section id="apartments" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
            Nasze Apartamenty i Pokoje
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto">Wybierz interesujący Cię rodzaj, rozwiń go i sprawdź dostępne numery pokoi (np. 1, 4, 7).</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 font-medium text-center border border-red-100">
            Błąd połączenia z bazą: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-stone-400 font-medium">Ładowanie kategorii...</div>
        ) : (
          <div className="space-y-10">
            {apartments?.map((cat, catIndex) => {
              const isExpanded = expandedCategoryId === cat.id;
              const roomNumbers = categoryRoomsMap[catIndex] || [1, 2, 3];
              const firstRoomImages = getRoomImages(roomNumbers[0]);

              return (
                <div key={cat.id} className="bg-white rounded-3xl shadow-sm border border-stone-200/80 overflow-hidden transition-all duration-300">
                  
                  {/* Nagłówek kategorii */}
                  <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-stone-50/50">
                    <div className="flex items-center gap-6">
                      <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-stone-200">
                        <Image src={firstRoomImages[0]} alt={cat.name} fill className="object-cover" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-[#D4A373] block mb-1">Kategoria apartamentu</span>
                        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">{cat.name}</h3>
                        <p className="text-stone-600 text-sm max-w-xl leading-relaxed">{cat.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between">
                      <div className="text-left md:text-right">
                        <span className="text-2xl font-bold text-stone-900">{cat.price_per_night} zł</span>
                        <span className="text-xs text-stone-500 block">za dobę • Do {cat.capacity} osób</span>
                      </div>
                      <button 
                        onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                        className="bg-stone-900 hover:bg-stone-800 text-white font-medium px-6 py-3.5 rounded-2xl transition shadow-sm text-sm cursor-pointer flex items-center gap-2"
                      >
                        <span>{isExpanded ? 'Zwiń pokoje' : `Wybierz pokój (pokoje nr ${roomNumbers.join(', ')})`}</span>
                        <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>↓</span>
                      </button>
                    </div>
                  </div>

                  {/* Rozwijana lista konkretnych numerów pokoi (np. 1, 4, 7) */}
                  {isExpanded && (
                    <div className="p-6 md:p-8 border-t border-stone-100 bg-white">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-6">
                        Dostępne konkretne numery w tej kategorii:
                      </h4>

                      <div className="grid md:grid-cols-3 gap-6">
                        {roomNumbers.map((roomNum) => {
                          const roomImages = getRoomImages(roomNum);

                          return (
                            <div key={roomNum} className="border border-stone-200/80 rounded-2xl overflow-hidden bg-stone-50/40 flex flex-col justify-between group hover:shadow-md transition">
                              <div 
                                onClick={() => { setSelectedApartment({ ...cat, roomNum, images: roomImages }); setActiveImageIndex(0); }}
                                className="relative h-48 w-full bg-stone-100 overflow-hidden cursor-pointer"
                              >
                                <Image src={roomImages[0]} alt={`Pokój nr ${roomNum}`} fill className="object-cover group-hover:scale-105 transition duration-500" />
                                <div className="absolute top-3 left-3 bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-sm">
                                  Pokój nr {roomNum}
                                </div>
                                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                                  {roomImages.length} zdjęć 📷
                                </div>
                              </div>

                              <div className="p-5">
                                <h5 
                                  onClick={() => { setSelectedApartment({ ...cat, roomNum, images: roomImages }); setActiveImageIndex(0); }}
                                  className="font-serif font-bold text-stone-900 text-base mb-1 hover:text-[#D4A373] transition cursor-pointer"
                                >
                                  Pokój nr {roomNum}
                                </h5>
                                <p className="text-stone-500 text-xs mb-4">Niezależny pokój z pełnym wyposażeniem i łazienką.</p>
                                <div className="flex items-center justify-between pt-3 border-t border-stone-200/60">
                                  <span className="font-extrabold text-stone-900 text-sm">{cat.price_per_night} zł / doba</span>
                                  <Link 
                                    href={`/book/${cat.id}`} 
                                    className="bg-[#D4A373] hover:bg-[#c39263] text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
                                  >
                                    Rezerwuj nr {roomNum}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sekcja FAQ */}
      <section className="bg-white py-24 border-t border-stone-200/60">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-stone-500 mb-2 block">Wszystko, co warto wiedzieć</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">Najczęściej zadawane pytania</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="bg-stone-50 rounded-2xl border border-stone-200/80 overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex justify-between items-center font-bold text-stone-900 focus:outline-none cursor-pointer"
                  >
                    <span className="text-base">{item.q}</span>
                    <span className={`transform transition-transform duration-200 text-xl text-stone-500 ${isOpen ? 'rotate-180' : ''}`}>↓</span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-stone-600 text-sm leading-relaxed border-t border-stone-200/40 pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sekcja opinii */}
      <section className="bg-stone-100/70 py-24 border-t border-stone-200/60">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold tracking-widest uppercase text-stone-500 mb-2 block">Opinie i oceny</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">Zaufanie poparte doświadczeniem</h2>
          <p className="text-stone-600 max-w-xl mx-auto mb-16 text-sm">Sprawdź, jak oceniają nas goście na niezależnych portalach turystycznych.</p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-stone-200/60 flex flex-col items-center justify-between transition hover:shadow-md">
              <div className="w-full flex flex-col items-center">
                <div className="h-12 relative w-36 mb-4">
                  <Image src="/images/booking.jpg" alt="Booking.com" fill className="object-contain" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="bg-blue-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg">{stats.booking_rating} / 10</span>
                  <span className="text-yellow-500 text-sm">★★★★★</span>
                </div>
                <p className="text-xs font-semibold text-stone-500 mb-4">Na podstawie {stats.booking_reviews_count} opinii gości</p>
                <p className="text-stone-600 text-sm mb-6">Ocena „Wyjątkowy” przyznana przez zweryfikowanych wczasowiczów.</p>
              </div>
              <a href="https://www.booking.com/hotel/pl/puerto-wladyslawowo.pl.html#tab-reviews" target="_blank" rel="noopener noreferrer" className="w-full bg-blue-900 text-white font-medium py-3.5 rounded-2xl hover:bg-blue-800 transition text-sm shadow-sm flex items-center justify-center gap-2">
                <span>Sprawdź opinie na Booking.com</span><span>&rarr;</span>
              </a>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-stone-200/60 flex flex-col items-center justify-between transition hover:shadow-md">
              <div className="w-full flex flex-col items-center">
                <div className="h-12 relative w-36 mb-4">
                  <Image src="/images/google.jpg" alt="Google" fill className="object-contain" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="bg-stone-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg">{stats.google_rating} / 5.0</span>
                  <span className="text-yellow-500 text-sm">★★★★★</span>
                </div>
                <p className="text-xs font-semibold text-stone-500 mb-4">Na podstawie {stats.google_reviews_count} opinii w Mapach</p>
                <p className="text-stone-600 text-sm mb-6">Zobacz realne oceny oraz wizytówkę naszego obiektu w Google.</p>
              </div>
              <a href="https://www.google.com/maps/place/Puerto+W%C5%82adys%C5%82awowo/@54.7986906,18.3888293,17z/data=!3m1!4b1!4m17!1m5!8m4!1e1!2s112377943502415156667!3m1!1e1!3m10!1s0x46fdb3004ca818bb:0x80990370f55ffc13!5m2!4m1!1i2!8m2!3d54.7986875!4d18.3914042!9m1!1b1!16s%2Fg%2F11xn94lj11?entry=ttu" target="_blank" rel="noopener noreferrer" className="w-full bg-stone-900 text-white font-medium py-3.5 rounded-2xl hover:bg-stone-800 transition text-sm shadow-sm flex items-center justify-center gap-2">
                <span>Zobacz opinie w Google</span><span>&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stopka */}
      <footer id="footer" className="bg-white border-t border-stone-200 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div>
              <div className="mb-6"><Image src="/logo.png" alt="Puerto Władysławowo" width={180} height={60} className="object-contain h-14 w-auto" /></div>
              <p className="text-sm text-stone-500 leading-relaxed max-w-sm">
                Apartamenty Puerto to kameralne i luksusowe miejsce stworzone z myślą o Twoim idealnym wypoczynku we Władysławowie. Łączymy nadmorski klimat z najwyższym standardem wykończenia.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-stone-900 mb-6 uppercase tracking-wider text-sm">Kontakt</h4>
              <div className="space-y-4 text-sm text-stone-600">
                <p className="flex items-center gap-3"><span className="text-stone-400">📞</span> +48 609 668 134</p>
                <p className="flex items-center gap-3"><span className="text-stone-400">✉️</span> kontakt@puerto-wladyslawowo.pl</p>
                <p className="flex items-center gap-3"><span className="text-stone-400">📍</span> ul. Krótka 1, Władysławowo</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-stone-900 mb-6 uppercase tracking-wider text-sm">Nawigacja</h4>
              <div className="flex flex-col space-y-3 text-sm font-medium text-stone-500">
                <button onClick={scrollToApartments} className="text-left hover:text-stone-900 transition w-fit cursor-pointer">Wybierz pokój</button>
                <Link href="/" className="hover:text-stone-900 transition w-fit">Polityka prywatności</Link>
                <Link href="/" className="hover:text-stone-900 transition w-fit">Regulamin pobytu</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400">
            <p>&copy; {new Date().getFullYear()} Apartamenty Puerto Władysławowo. Wszelkie prawa zastrzeżone.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="https://www.facebook.com/profile.php?id=61577936825974" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition">
                <div className="relative w-7 h-7 rounded-full overflow-hidden shadow-sm border border-stone-200">
                  <Image src="/images/facebook.jpg" alt="Facebook" fill className="object-cover" />
                </div>
                <span className="text-stone-700 font-medium text-sm">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal z dedykowaną galerią konkretnego pokoju */}
      {selectedApartment && (
        <div onClick={() => setSelectedApartment(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedApartment(null)} className="absolute top-5 right-5 bg-stone-100 hover:bg-stone-200 text-stone-900 w-9 h-9 rounded-full flex items-center justify-center font-bold transition z-20 cursor-pointer shadow-sm">✕</button>

            <span className="text-xs font-bold tracking-widest uppercase text-stone-500 mb-1 block">Pokój nr {selectedApartment.roomNum}</span>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4 pr-10">{selectedApartment.name}</h2>

            <div className="relative h-60 md:h-72 w-full rounded-2xl overflow-hidden bg-stone-100 mb-4 shadow-inner">
              <Image src={selectedApartment.images[activeImageIndex]} alt="Zdjęcie pokoju" fill className="object-cover transition-all duration-300" />
              {selectedApartment.images.length > 1 && (
                <>
                  <button onClick={() => setActiveImageIndex((prev) => (prev === 0 ? selectedApartment.images.length - 1 : prev - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-stone-900 w-9 h-9 rounded-full flex items-center justify-center shadow-md font-bold transition cursor-pointer">&larr;</button>
                  <button onClick={() => setActiveImageIndex((prev) => (prev === selectedApartment.images.length - 1 ? 0 : prev + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-stone-900 w-9 h-9 rounded-full flex items-center justify-center shadow-md font-bold transition cursor-pointer">&rarr;</button>
                </>
              )}
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {selectedApartment.images.map((img: string, idx: number) => (
                <div key={idx} onClick={() => setActiveImageIndex(idx)} className={`relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 border-2 transition ${activeImageIndex === idx ? 'border-stone-900 scale-105' : 'border-transparent opacity-60'}`}>
                  <Image src={img} alt="miniaturka" fill className="object-cover" />
                </div>
              ))}
            </div>

            <p className="text-stone-600 text-sm leading-relaxed mb-6">{selectedApartment.description}</p>

            <div className="flex flex-col sm:flex-row justify-between items-center bg-stone-50 p-5 rounded-2xl border border-stone-100 gap-4">
              <div>
                <span className="text-xl font-bold text-stone-900">{selectedApartment.price_per_night} zł</span>
                <span className="text-xs text-stone-500 block">za dobę • Do {selectedApartment.capacity} osób</span>
              </div>
              <Link href={`/book/${selectedApartment.id}`} className="w-full sm:w-auto bg-stone-900 text-white font-medium px-6 py-3 rounded-xl hover:bg-stone-800 transition text-center text-sm shadow-sm">
                Zarezerwuj teraz
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}