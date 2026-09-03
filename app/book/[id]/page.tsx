'use client';

import { supabase } from '../../supabase';
import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
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

  // AUTOMATYCZNE ROZPOZNAWANIE DZISIEJSZEJ DATY
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  
  // Formatowanie dzisiejszej daty do porównań (YYYY-MM-DD)
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
    // Zabezpieczenie przed cofaniem się poniżej obecnego miesiąca
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

    // Blokada kliknięcia w daty z przeszłości
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
    
    // Ostateczne zabezpieczenie formularza
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

  if (loading) return <div className="p-20 text-center text-stone-500">Ładowanie rezerwacji...</div>;
  if (error || !apartment) return <div className="p-20 text-center text-red-600 font-bold">Nie znaleziono apartamentu.</div>;

  if (successMessage) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center bg-stone-50 px-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-stone-100 text-stone-900 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✓</div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Rezerwacja przyjęta!</h2>
          <p className="text-stone-600 mb-6 text-sm">Dziękujemy, {guestName}. Twoje zgłoszenie zostało zapisane w systemie.</p>
          <Link href="/" className="inline-block bg-stone-900 text-white font-medium px-6 py-3 rounded-2xl hover:bg-stone-800 transition text-sm">
            Powrót na stronę główną
          </Link>
        </div>
      </main>
    );
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  // Sprawdzamy, czy jesteśmy w aktualnym miesiącu, aby zablokować strzałkę w lewo
  const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-6 flex justify-center items-start relative">
      
      {showCapacityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-stone-100">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">i</div>
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Większa liczba gości</h3>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed">
              Maksymalna liczba osób dla tego obiektu to {apartment.capacity}. W razie większej ilości gości prosimy o kontakt telefoniczny lub mailowy.
            </p>
            <button 
              onClick={() => setShowCapacityModal(false)}
              className="w-full bg-stone-900 text-white font-medium py-3 rounded-xl hover:bg-stone-800 transition text-sm cursor-pointer"
            >
              Rozumiem
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-stone-100 w-full max-w-xl">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900 mb-6 inline-block font-medium">&larr; Wróć do oferty</Link>
        <h1 className="text-3xl font-serif font-extrabold text-stone-900 mb-1">Rezerwacja apartamentu</h1>
        <h2 className="text-lg text-stone-600 font-medium mb-2">{apartment.name}</h2>
        <p className="text-xs text-stone-500 mb-8">Maksymalnie do {apartment.capacity} osób</p>
        
        <form onSubmit={handleSubmit} className="grid gap-6">
          
          <div className="relative" ref={calendarRef}>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Termin pobytu</label>
            <div 
              onClick={() => setIsCalendarOpen(true)}
              className="w-full border border-stone-200 rounded-2xl p-4 text-sm bg-white cursor-pointer flex justify-between items-center hover:border-stone-400 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📅</span>
                <span className={`font-bold ${!checkIn || !checkOut ? 'text-stone-400 font-normal' : 'text-stone-900'}`}>
                  {checkIn && checkOut 
                    ? `${checkIn} → ${checkOut} (${nights} nocy)` 
                    : 'Proszę wybrać datę pobytu'}
                </span>
              </div>
              <span className="text-stone-400 text-xs">&#9660;</span>
            </div>

            {isCalendarOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white text-stone-800 rounded-2xl shadow-2xl p-6 w-full z-40 border border-stone-200">
                
                <div className="flex justify-between items-center mb-6">
                  <button 
                    type="button" 
                    onClick={handlePrevMonth}
                    disabled={isCurrentMonth}
                    className={`p-2 rounded-full font-bold transition ${isCurrentMonth ? 'text-stone-200 cursor-not-allowed' : 'hover:bg-stone-100 text-stone-600'}`}
                  >
                    &larr;
                  </button>
                  <div className="text-center">
                    <h4 className="font-serif font-bold text-stone-900 text-base">
                      {monthNames[currentMonth]} {currentYear}
                    </h4>
                    <p className="text-xs text-stone-500">
                      {!checkIn ? 'Wybierz datę zameldowania' : !checkOut ? 'Wybierz datę wymeldowania' : 'Wybrano zakres terminów'}
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleNextMonth}
                    className="p-2 rounded-full hover:bg-stone-100 text-stone-600 font-bold transition"
                  >
                    &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-stone-500 mb-2 font-medium">
                  <span>Pn</span><span>Wt</span><span>Śr</span><span>Cz</span><span>Pt</span><span>So</span><span>Nd</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-6">
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const formattedDay = day < 10 ? `0${day}` : day;
                    const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : currentMonth + 1;
                    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
                    
                    const isPast = dateStr < todayFormatted;
                    const isStart = dateStr === checkIn;
                    const isEnd = dateStr === checkOut;
                    const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

                    let bgClass = "hover:bg-stone-100 text-stone-800 cursor-pointer";
                    
                    if (isPast) {
                      bgClass = "text-stone-300 cursor-not-allowed bg-stone-50/50";
                    } else if (isStart || isEnd) {
                      bgClass = "bg-[#D4A373] text-white font-bold rounded-xl cursor-pointer";
                    } else if (isInRange) {
                      bgClass = "bg-[#D4A373]/20 text-stone-900 cursor-pointer";
                    }

                    return (
                      <div 
                        key={i} 
                        onClick={() => handleDateClick(day)}
                        className={`py-2.5 rounded-lg transition ${bgClass}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  disabled={!checkIn || !checkOut}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-3 rounded-xl text-xs transition disabled:opacity-40 cursor-pointer"
                >
                  Zatwierdź termin
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Liczba gości</label>
            <div className="flex items-center justify-between border border-stone-200 rounded-2xl p-3.5 bg-white">
              <span className="text-sm font-medium text-stone-800">Goście (maks. {apartment.capacity})</span>
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-900 font-bold flex items-center justify-center hover:bg-stone-100 shadow-sm cursor-pointer"
                >-</button>
                <span className="font-bold text-stone-900 text-sm w-4 text-center">{guests}</span>
                <button 
                  type="button" 
                  onClick={handleIncreaseGuests}
                  className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-900 font-bold flex items-center justify-center hover:bg-stone-100 shadow-sm cursor-pointer"
                >+</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Imię i nazwisko</label>
              <input 
                type="text" 
                placeholder="Jan Kowalski"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full border border-stone-200 rounded-2xl p-3.5 text-sm text-stone-900 bg-white outline-none focus:border-stone-900" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Adres e-mail</label>
              <input 
                type="email" 
                placeholder="jan@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full border border-stone-200 rounded-2xl p-3.5 text-sm text-stone-900 bg-white outline-none focus:border-stone-900" 
                required 
              />
            </div>
          </div>
          
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/60 space-y-3">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Cena za 1 dobę:</span>
              <span className="font-semibold text-stone-900">{apartment.price_per_night} zł</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Liczba nocy:</span>
              <span className="font-semibold text-stone-900">{nights}</span>
            </div>
            <div className="border-t border-stone-200 pt-3 flex justify-between items-center text-lg">
              <span className="font-bold text-stone-900">Do zapłaty:</span>
              <span className="font-extrabold text-stone-900">{total} zł</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-[#D4A373] hover:bg-[#c39263] text-stone-900 font-bold py-4 rounded-2xl transition shadow-sm text-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Zapisywanie...' : 'Potwierdź rezerwację'}
          </button>
        </form>
      </div>
    </main>
  );
}