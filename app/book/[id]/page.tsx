'use client';

import { supabase } from '../../supabase';
import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const searchParams = useSearchParams();

  const defaultCheckIn = searchParams.get('checkin') || '';
  const defaultCheckOut = searchParams.get('checkout') || '';
  const defaultGuests = searchParams.get('adults') ? Number(searchParams.get('adults')) : 2;

  const [apartment, setApartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(defaultGuests);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  
  const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchApartment() {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setApartment(data);
        if (data && defaultGuests > data.capacity) {
          setGuests(data.capacity);
        }
      }
      setLoading(false);
    }
    fetchApartment();
  }, [id, defaultGuests]);

  const handleIncreaseGuests = () => {
    if (apartment && guests >= apartment.capacity) {
      setShowCapacityModal(true);
    } else {
      setGuests(guests + 1);
    }
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !apartment) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * apartment.price_per_night : 0;
  };

  const total = calculateTotal();
  const nights = checkIn && checkOut ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))) : 0;

  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", 
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : currentMonth + 1;
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    if (dateStr < todayFormatted) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else {
      if (dateStr > checkIn) {
        setCheckOut(dateStr);
      } else {
        setCheckIn(dateStr);
        setCheckOut('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      alert('Proszę wybrać termin pobytu i kliknąć "Zatwierdź termin".');
      return;
    }
    
    if (checkIn < todayFormatted) {
      alert('Data zameldowania nie może być w przeszłości!');
      return;
    }

    setSubmitting(true);

    const { error: bookingError } = await supabase.from('bookings').insert([
      {
        apartment_id: id,
        guest_name: guestName,
        guest_email: guestEmail,
        check_in: checkIn,
        check_out: checkOut,
        guests: guests,
        total_price: total,
      }
    ]);

    setSubmitting(false);

    if (bookingError) {
      alert('Błąd podczas zapisywania rezerwacji: ' + bookingError.message);
    } else {
      setSuccessMessage(true);
    }
  };

  if (loading) return <div className="p-20 text-center text-stone-500 font-medium">Ładowanie rezerwacji...</div>;
  if (error || !apartment) return <div className="p-20 text-center text-red-600 font-bold">Nie znaleziono apartamentu.</div>;

  // NOWY EKRAN SUKCESU (Bilet)
  if (successMessage) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-100 px-6 py-12">
        <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full text-center overflow-hidden border border-stone-200">
          <div className="bg-[#D4A373] py-10 px-8 text-white relative">
            <div className="w-20 h-20 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl backdrop-blur-md">✓</div>
            <h2 className="text-3xl font-serif font-bold mb-2">Zarezerwowane!</h2>
            <p className="opacity-90 text-sm font-medium">Pakuj walizki do Władysławowa, {guestName}.</p>
            {/* Ozdobne wcięcia po bokach biletu */}
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-stone-100 rounded-full"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-stone-100 rounded-full"></div>
          </div>
          <div className="p-8 border-t-2 border-dashed border-stone-200 bg-white">
            <div className="grid grid-cols-2 gap-4 text-left mb-8">
              <div>
                <p className="text-xs text-stone-400 font-bold uppercase mb-1">Termin</p>
                <p className="text-sm font-bold text-stone-900">{checkIn} <br/> {checkOut}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 font-bold uppercase mb-1">Goście</p>
                <p className="text-sm font-bold text-stone-900">{guests} {guests === 1 ? 'osoba' : 'osoby'}</p>
              </div>
            </div>
            <Link href="/" className="block w-full bg-stone-900 text-white font-medium py-4 rounded-2xl hover:bg-stone-800 transition text-sm">
              Wróć na stronę główną
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  return (
    <main className="min-h-screen bg-stone-50 py-12 md:py-20 px-4 sm:px-6">
      
      {showCapacityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-stone-100">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">i</div>
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Większa liczba gości</h3>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed">
              Maksymalna liczba osób dla tego obiektu to {apartment.capacity}. W razie większej ilości prosimy o kontakt.
            </p>
            <button onClick={() => setShowCapacityModal(false)} className="w-full bg-stone-900 text-white font-medium py-3 rounded-xl hover:bg-stone-800 transition text-sm">
              Rozumiem
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900 mb-8 inline-flex items-center gap-2 font-medium transition">
          <span>&larr;</span> Powrót do oferty
        </Link>

        {/* UKŁAD DWUKOLUMNOWY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEWA KOLUMNA: Informacje (Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
            <div className="relative h-64 md:h-80 w-full rounded-3xl overflow-hidden shadow-lg border border-stone-100">
              {/* Jeśli apartament ma URL obrazka to go używa, inaczej domyślny apt-1 */}
              <Image 
                src={apartment.image_url || "/images/apt-1.jpg"} 
                alt={apartment.name} 
                fill 
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-stone-900 shadow-sm flex items-center gap-2">
                <span className="text-yellow-500 text-sm">★</span> Nowość
              </div>
            </div>

            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-stone-500 mb-2 block">Twój wybór</span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-3">{apartment.name}</h1>
              <div className="flex flex-wrap gap-2 text-sm text-stone-600 font-medium mb-6">
                <span className="bg-stone-200/50 px-3 py-1 rounded-lg">Do {apartment.capacity} osób</span>
                <span className="bg-stone-200/50 px-3 py-1 rounded-lg">Wi-Fi</span>
                <span className="bg-stone-200/50 px-3 py-1 rounded-lg">Parking</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200/60 hidden lg:block">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-100">
                <span className="text-stone-600 font-medium">Cena za 1 dobę</span>
                <span className="text-xl font-bold text-stone-900">{apartment.price_per_night} zł</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-100">
                <span className="text-stone-600 font-medium">Liczba nocy</span>
                <span className="text-lg font-bold text-stone-900">{nights}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-stone-900">Razem do zapłaty</span>
                <span className="text-2xl font-extrabold text-[#D4A373]">{total} zł</span>
              </div>
            </div>
          </div>

          {/* PRAWA KOLUMNA: Formularz */}
          <div className="lg:col-span-7 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8">Szczegóły rezerwacji</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* TERMIN */}
              <div className="relative" ref={calendarRef}>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Wybierz daty</label>
                <div 
                  onClick={() => setIsCalendarOpen(true)}
                  className="w-full border-2 border-stone-100 rounded-2xl p-4 bg-stone-50/50 cursor-pointer flex justify-between items-center hover:border-stone-300 transition group"
                >
                  <div className="flex items-center gap-4">
                    {/* Ikona kalendarza */}
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 font-medium mb-0.5">{nights > 0 ? `${nights} nocy` : 'Kiedy przyjeżdżasz?'}</p>
                      <span className={`font-bold block ${!checkIn || !checkOut ? 'text-stone-400 font-medium text-sm' : 'text-stone-900 text-base'}`}>
                        {checkIn && checkOut ? `${checkIn}  —  ${checkOut}` : 'Wybierz termin z kalendarza'}
                      </span>
                    </div>
                  </div>
                  <span className="text-stone-400 text-xs">&#9660;</span>
                </div>

                {isCalendarOpen && (
                  <div className="absolute top-full left-0 mt-3 bg-white text-stone-800 rounded-3xl shadow-2xl p-6 w-full z-40 border border-stone-100">
                    <div className="flex justify-between items-center mb-6">
                      <button type="button" onClick={handlePrevMonth} disabled={isCurrentMonth} className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition ${isCurrentMonth ? 'text-stone-200 cursor-not-allowed' : 'bg-stone-100 hover:bg-stone-200 text-stone-900'}`}>&larr;</button>
                      <h4 className="font-serif font-bold text-stone-900 text-lg">{monthNames[currentMonth]} {currentYear}</h4>
                      <button type="button" onClick={handleNextMonth} className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 flex items-center justify-center font-bold transition">&rarr;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs text-stone-400 mb-3 font-bold uppercase tracking-wide">
                      <span>Pn</span><span>Wt</span><span>Śr</span><span>Cz</span><span>Pt</span><span>So</span><span>Nd</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium mb-6">
                      {Array.from({ length: firstDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const formattedDay = day < 10 ? `0${day}` : day;
                        const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : currentMonth + 1;
                        const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
                        
                        const isPast = dateStr < todayFormatted;
                        const isStart = dateStr === checkIn;
                        const isEnd = dateStr === checkOut;
                        const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

                        let bgClass = "hover:bg-stone-100 text-stone-900 cursor-pointer";
                        if (isPast) bgClass = "text-stone-300 cursor-not-allowed";
                        else if (isStart || isEnd) bgClass = "bg-stone-900 text-white font-bold rounded-xl shadow-md cursor-pointer";
                        else if (isInRange) bgClass = "bg-stone-100 text-stone-900 rounded-lg cursor-pointer";

                        return (
                          <div key={i} onClick={() => handleDateClick(day)} className={`py-3 rounded-xl transition ${bgClass}`}>
                            {day}
                          </div>
                        );
                      })}
                    </div>
                    <button type="button" onClick={() => setIsCalendarOpen(false)} disabled={!checkIn || !checkOut} className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-xl text-sm transition disabled:opacity-40 cursor-pointer">
                      Gotowe
                    </button>
                  </div>
                )}
              </div>

              {/* GOŚCIE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Kto przyjedzie?</label>
                <div className="flex items-center justify-between border-2 border-stone-100 rounded-2xl p-4 bg-stone-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 font-medium mb-0.5">Liczba osób</p>
                      <span className="font-bold text-stone-900">{guests} {guests === 1 ? 'Gość' : 'Gości'} (maks. {apartment.capacity})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-1 rounded-full shadow-sm border border-stone-100">
                    <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-900 font-bold flex items-center justify-center transition">-</button>
                    <button type="button" onClick={handleIncreaseGuests} className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-900 font-bold flex items-center justify-center transition">+</button>
                  </div>
                </div>
              </div>

              {/* DANE OSOBOWE */}
              <div className="space-y-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Twoje dane</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Imię i nazwisko"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full border-2 border-stone-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-stone-900 bg-stone-50/50 outline-none focus:border-stone-900 focus:bg-white transition" 
                    required 
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <input 
                    type="email" 
                    placeholder="Adres e-mail"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full border-2 border-stone-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-stone-900 bg-stone-50/50 outline-none focus:border-stone-900 focus:bg-white transition" 
                    required 
                  />
                </div>
              </div>

              {/* MOBILNE PODSUMOWANIE */}
              <div className="lg:hidden bg-stone-100 p-5 rounded-2xl flex justify-between items-center mt-6">
                <span className="font-medium text-stone-600 text-sm">Razem do zapłaty</span>
                <span className="font-extrabold text-stone-900 text-xl">{total} zł</span>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-[#D4A373] hover:bg-[#c39263] text-white font-bold py-5 rounded-2xl transition shadow-lg hover:shadow-xl text-base disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2"
              >
                {submitting ? 'Przetwarzanie...' : (
                  <>Rezerwuję i płacę <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}