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
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<number>(1);
  const [availableRooms, setAvailableRooms] = useState<number[]>([]);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  
  const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const calendarRef = useRef<HTMLDivElement>(null);

  // Słownik z liczbą zdjęć dla każdego pokoju
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
    async function fetchApartmentAndRooms() {
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
    fetchApartmentAndRooms();
  }, [id, defaultGuests]);

  // Sprawdzanie dostępnych numerów pokoi
  useEffect(() => {
    async function checkAvailableRooms() {
      if (!checkIn || !checkOut || !id) return;

      const { data: allApts } = await supabase.from('apartments').select('id');
      if (!allApts) return;

      const aptIndex = allApts.findIndex((a) => a.id === id);
      const normalizedIndex = aptIndex >= 0 ? aptIndex % 3 : 0;
      const possibleRoomsMap: Record<number, number[]> = {
        0: [1, 4, 7],
        1: [2, 5, 8],
        2: [3, 6, 9]
      };
      const roomsForThisType = possibleRoomsMap[normalizedIndex] || [1, 2, 3];

      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('room_number, check_in, check_out');

      const freeRooms = roomsForThisType.filter((roomNum) => {
        const roomBookings = existingBookings?.filter((b) => b.room_number === roomNum) || [];
        const hasConflict = roomBookings.some((b) => {
          return checkIn < b.check_out && checkOut > b.check_in;
        });
        return !hasConflict;
      });

      setAvailableRooms(freeRooms);
      if (freeRooms.length > 0 && !freeRooms.includes(selectedRoomNumber)) {
        setSelectedRoomNumber(freeRooms[0]);
      }
    }

    checkAvailableRooms();
  }, [checkIn, checkOut, id]);

  // Pobieramy zdjęcia dla aktualnie wybranego numeru pokoju (selectedRoomNumber)
  const getRoomImages = (roomNum: number) => {
    const count = roomImageCounts[roomNum] || 4;
    const images = [];
    for (let i = 1; i <= count; i++) {
      images.push(`/images/pokoj ${roomNum}/pokoj ${roomNum} (${i}).jpg`);
    }
    return images;
  };

  const currentRoomImages = getRoomImages(selectedRoomNumber);

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
      alert('Proszę wybrać termin pobytu.');
      return;
    }
    
    if (checkIn < todayFormatted) {
      alert('Data zameldowania nie może być w przeszłości!');
      return;
    }

    if (availableRooms.length === 0) {
      alert('Brak wolnych pokoi w tym terminie!');
      return;
    }

    setSubmitting(true);

    const { error: bookingError } = await supabase.from('bookings').insert([
      {
        apartment_id: id,
        room_number: selectedRoomNumber,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
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

  if (successMessage) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-100 px-6 py-12">
        <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full text-center p-8 md:p-10 border border-stone-200">
          <div className="w-20 h-20 bg-amber-50 text-[#D4A373] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm border border-amber-100">✓</div>
          <h2 className="text-3xl font-serif font-bold mb-3 text-stone-900">Dziękujemy!</h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-8">
            Twoja rezerwacja została pomyślnie przyjęta do systemu. W najbliższym czasie skontaktujemy się z Tobą w celu potwierdzenia rezerwacji.
          </p>
          <Link href="/" className="block w-full bg-stone-900 text-white font-medium py-4 rounded-2xl hover:bg-stone-800 transition text-sm">
            Wróć na stronę główną
          </Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* GALERIA ZDJĘĆ Z MOŻLIWOŚCIĄ PRZEWIJANIA */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
            <div className="relative h-64 md:h-80 w-full rounded-3xl overflow-hidden shadow-lg border border-stone-100 bg-stone-100">
              <Image 
                src={currentRoomImages[activeImageIndex] || currentRoomImages[0]} 
                alt={apartment.name} 
                fill 
                className="object-cover transition-all duration-300"
                priority
              />
              {currentRoomImages.length > 1 && (
                <>
                  <button 
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? currentRoomImages.length - 1 : prev - 1))} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-stone-900 w-9 h-9 rounded-full flex items-center justify-center shadow-md font-bold transition cursor-pointer"
                  >
                    &larr;
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev === currentRoomImages.length - 1 ? 0 : prev + 1))} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-stone-900 w-9 h-9 rounded-full flex items-center justify-center shadow-md font-bold transition cursor-pointer"
                  >
                    &rarr;
                  </button>
                </>
              )}
            </div>

            {/* Miniaturki */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {currentRoomImages.map((img: string, idx: number) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 border-2 transition ${activeImageIndex === idx ? 'border-stone-900 scale-105' : 'border-transparent opacity-60'}`}
                >
                  <Image src={img} alt="miniaturka" fill className="object-cover" />
                </div>
              ))}
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

          <div className="lg:col-span-7 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-stone-100">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8">Szczegóły rezerwacji</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="relative" ref={calendarRef}>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Wybierz daty</label>
                <div 
                  onClick={() => setIsCalendarOpen(true)}
                  className="w-full border-2 border-stone-100 rounded-2xl p-4 bg-stone-50/50 cursor-pointer flex justify-between items-center hover:border-stone-300 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      📅
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

              {checkIn && checkOut && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Wybierz wolny pokój</label>
                  {availableRooms.length === 0 ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">
                      Brak wolnych pokoi tego typu w wybranym terminie. Proszę zmienić daty.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {availableRooms.map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setSelectedRoomNumber(num);
                            setActiveImageIndex(0); // resetujemy indeks zdjęcia przy zmianie pokoju
                          }}
                          className={`py-3 rounded-2xl font-bold text-sm border-2 transition ${selectedRoomNumber === num ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400'}`}
                        >
                          Pokój nr {num}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Kto przyjedzie?</label>
                <div className="flex items-center justify-between border-2 border-stone-100 rounded-2xl p-4 bg-stone-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm font-bold">👤</div>
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

              <div className="space-y-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Twoje dane</label>
                
                <input 
                  type="text" 
                  placeholder="Imię i nazwisko"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full border-2 border-stone-100 rounded-2xl px-4 py-4 text-sm font-medium text-stone-900 bg-stone-50/50 outline-none focus:border-stone-900 focus:bg-white transition" 
                  required 
                />
                <input 
                  type="email" 
                  placeholder="Adres e-mail"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full border-2 border-stone-100 rounded-2xl px-4 py-4 text-sm font-medium text-stone-900 bg-stone-50/50 outline-none focus:border-stone-900 focus:bg-white transition" 
                  required 
                />
                <input 
                  type="tel" 
                  placeholder="Numer telefonu"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full border-2 border-stone-100 rounded-2xl px-4 py-4 text-sm font-medium text-stone-900 bg-stone-50/50 outline-none focus:border-stone-900 focus:bg-white transition" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting || availableRooms.length === 0}
                className="w-full bg-[#D4A373] hover:bg-[#c39263] text-white font-bold py-5 rounded-2xl transition shadow-lg text-base disabled:opacity-40 cursor-pointer flex justify-center items-center gap-2"
              >
                {submitting ? 'Przetwarzanie...' : 'Wyślij zgłoszenie rezerwacji →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}