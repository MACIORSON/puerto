'use client';

import { supabase } from '../supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('calendar');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any | null>(null);

  // Stan do ręcznego dodawania rezerwacji
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState('');
  const [selectedRoomNum, setSelectedRoomNum] = useState<number>(1);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [totalPrice, setTotalPrice] = useState(0);

  const todayDate = new Date();
  const [calYear, setCalYear] = useState(todayDate.getFullYear());
  const [calMonth, setCalMonth] = useState(todayDate.getMonth());

  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", 
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];

  // Paleta ładnych, eleganckich kolorów dla różnych rezerwacji
  const pastelColors = [
    { bg: 'bg-amber-800 text-white', border: 'border-amber-900' },
    { bg: 'bg-emerald-800 text-white', border: 'border-emerald-900' },
    { bg: 'bg-sky-800 text-white', border: 'border-sky-900' },
    { bg: 'bg-indigo-800 text-white', border: 'border-indigo-900' },
    { bg: 'bg-rose-800 text-white', border: 'border-rose-900' },
    { bg: 'bg-teal-800 text-white', border: 'border-teal-900' },
    { bg: 'bg-purple-800 text-white', border: 'border-purple-900' },
    { bg: 'bg-orange-800 text-white', border: 'border-orange-900' },
  ];

  // Przypisanie stałego koloru do ID rezerwacji
  const getBookingColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % pastelColors.length;
    return pastelColors[index];
  };

  useEffect(() => {
    if (selectedApt && checkIn && checkOut && apartments.length > 0) {
      const apt = apartments.find((a) => a.id === selectedApt);
      if (apt) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          setTotalPrice(diffDays * apt.price_per_night);
        } else {
          setTotalPrice(0);
        }
      }
    }
  }, [selectedApt, checkIn, checkOut, apartments]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert('Błędny PIN!');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, apartments(name)')
      .order('check_in', { ascending: true });

    const { data: aptsData } = await supabase.from('apartments').select('*');

    if (bookingsData) setBookings(bookingsData);
    if (aptsData) {
      setApartments(aptsData);
      if (aptsData.length > 0) setSelectedApt(aptsData[0].id);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) {
        alert('Błąd podczas usuwania: ' + error.message);
      } else {
        setSelectedBookingDetails(null);
        fetchData();
      }
    }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('room_number', selectedRoomNum);

    const hasConflict = existingBookings?.some((booking) => {
      return checkIn < booking.check_out && checkOut > booking.check_in;
    });

    if (hasConflict) {
      alert(`Błąd: Pokój nr ${selectedRoomNum} jest już zajęty w tym terminie!`);
      return;
    }

    const { error } = await supabase.from('bookings').insert([
      {
        apartment_id: selectedApt,
        room_number: selectedRoomNum,
        guest_name: guestName,
        guest_email: guestEmail || 'brak@email.pl',
        guest_phone: guestPhone || 'Brak telefonu',
        check_in: checkIn,
        check_out: checkOut,
        guests: guestsCount,
        total_price: totalPrice,
      }
    ]);

    if (error) {
      alert('Błąd: ' + error.message);
    } else {
      alert('Dodano rezerwację pomyślnie!');
      setShowAddModal(false);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setCheckIn('');
      setCheckOut('');
      setTotalPrice(0);
      fetchData();
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const daysInCurrentMonth = getDaysInMonth(calYear, calMonth);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4 font-sans">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl max-w-sm w-full text-center border border-stone-200">
          <div className="w-14 h-14 bg-stone-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-serif">P.</div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Panel Gospodarza</h1>
          <p className="text-stone-500 text-xs mb-8">Wprowadź PIN, aby zarządzać rezerwacjami</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="••••" 
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border-2 border-stone-100 bg-stone-50 rounded-2xl p-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-stone-900 font-bold"
              required
            />
            <button type="submit" className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl hover:bg-stone-800 transition text-sm cursor-pointer shadow-lg">
              Wejdź do panelu
            </button>
          </form>
          <div className="mt-6">
            <Link href="/" className="text-xs text-stone-400 hover:text-stone-700">&larr; Wróć na stronę główną</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Górny nagłówek panelu */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200/80">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A373] block mb-1">Puerto Władysławowo</span>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Zarządzanie (9 Pokoi)</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#D4A373] hover:bg-[#c39263] text-white font-bold px-6 py-3.5 rounded-2xl transition text-sm shadow-md cursor-pointer flex items-center gap-2"
            >
              <span>+</span> Dodaj rezerwację ręcznie
            </button>
            <Link href="/" className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-6 py-3.5 rounded-2xl transition text-sm">
              Podgląd strony
            </Link>
          </div>
        </div>

        {/* Przełącznik widoków */}
        <div className="flex gap-3 mb-8">
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer shadow-sm ${activeTab === 'calendar' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'}`}
          >
            📅 Wizualny Kalendarz Pokoi (1-9)
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer shadow-sm ${activeTab === 'list' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'}`}
          >
            📋 Lista Rezerwacji
          </button>
        </div>

        {/* MODAL: Szczegóły rezerwacji */}
        {selectedBookingDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl border border-stone-100 relative">
              <button 
                onClick={() => setSelectedBookingDetails(null)}
                className="absolute top-5 right-5 bg-stone-100 hover:bg-stone-200 text-stone-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
              
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4A373] block mb-1">Pokój nr {selectedBookingDetails.room_number}</span>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">{selectedBookingDetails.guest_name}</h3>
              
              <div className="space-y-4 text-sm text-stone-700 bg-stone-50 p-5 rounded-2xl border border-stone-100 mb-6">
                <div className="flex justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-stone-400 font-medium">Telefon:</span>
                  <strong className="text-stone-900">{selectedBookingDetails.guest_phone}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-stone-400 font-medium">E-mail:</span>
                  <strong className="text-stone-900">{selectedBookingDetails.guest_email}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-stone-400 font-medium">Zameldowanie:</span>
                  <strong className="text-emerald-700">{selectedBookingDetails.check_in}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-stone-400 font-medium">Wymeldowanie:</span>
                  <strong className="text-rose-700">{selectedBookingDetails.check_out}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-stone-400 font-medium">Liczba gości:</span>
                  <strong className="text-stone-900">{selectedBookingDetails.guests} osoby</strong>
                </div>
                <div className="flex justify-between text-base pt-1">
                  <span className="text-stone-400 font-medium">Kwota:</span>
                  <strong className="text-[#D4A373] font-extrabold">{selectedBookingDetails.total_price} zł</strong>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedBookingDetails(null)} 
                  className="w-1/2 bg-stone-100 text-stone-800 font-bold py-3 rounded-xl hover:bg-stone-200 transition text-xs"
                >
                  Zamknij
                </button>
                <button 
                  onClick={() => handleDelete(selectedBookingDetails.id)} 
                  className="w-1/2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition text-xs"
                >
                  Usuń rezerwację
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Dodawanie rezerwacji */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl border border-stone-100 my-auto">
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">Nowa rezerwacja</h3>
              <form onSubmit={handleAddBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Typ apartamentu</label>
                    <select value={selectedApt} onChange={(e) => setSelectedApt(e.target.value)} className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none font-medium">
                      {apartments.map((apt) => (<option key={apt.id} value={apt.id}>{apt.name} ({apt.price_per_night} zł)</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Numer pokoju (1-9)</label>
                    <select value={selectedRoomNum} onChange={(e) => setSelectedRoomNum(Number(e.target.value))} className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none font-bold text-[#D4A373]">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (<option key={num} value={num}>Pokój nr {num}</option>))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Imię i nazwisko</label>
                    <input type="text" placeholder="Jan Kowalski" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Telefon</label>
                    <input type="tel" placeholder="+48 000 000 000" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">E-mail</label>
                  <input type="email" placeholder="jan@example.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Zameldowanie (Od)</label>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none font-medium" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Wymeldowanie (Do)</label>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none font-medium" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Liczba gości</label>
                    <input type="number" min="1" value={guestsCount} onChange={(e) => setGuestsCount(Number(e.target.value))} className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Cena całkowita (zł)</label>
                    <input type="number" value={totalPrice} onChange={(e) => setTotalPrice(Number(e.target.value))} className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none font-bold text-[#D4A373]" required />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="w-1/2 bg-stone-100 text-stone-700 font-bold py-3.5 rounded-xl hover:bg-stone-200 transition text-sm cursor-pointer">Anuluj</button>
                  <button type="submit" className="w-1/2 bg-stone-900 text-white font-bold py-3.5 rounded-xl hover:bg-stone-800 transition text-sm cursor-pointer shadow-md">Zapisz rezerwację</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* WIDOK 1: POŁĄczony WIZUALNY KALENDARZ POKOI */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200/80 p-6 md:p-8">
            
            <div className="flex justify-between items-center mb-8 bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <button 
                onClick={() => {
                  if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else { setCalMonth(calMonth - 1); }
                }}
                className="w-10 h-10 rounded-full bg-white shadow-sm font-bold flex items-center justify-center hover:bg-stone-100 transition"
              >
                &larr;
              </button>
              <h3 className="text-xl font-serif font-bold text-stone-900">{monthNames[calMonth]} {calYear}</h3>
              <button 
                onClick={() => {
                  if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else { setCalMonth(calMonth + 1); }
                }}
                className="w-10 h-10 rounded-full bg-white shadow-sm font-bold flex items-center justify-center hover:bg-stone-100 transition"
              >
                &rarr;
              </button>
            </div>

            {loading ? (
              <div className="p-16 text-center text-stone-400">Ładowanie kalendarza...</div>
            ) : (
              <div className="space-y-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((roomNum) => {
                  return (
                    <div key={roomNum} className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/40">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {roomNum}
                          </span>
                          <span className="font-serif font-bold text-stone-900 text-sm">Pokój nr {roomNum}</span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-medium">Kliknij na ciąg rezerwacji, aby zobaczyć szczegóły</span>
                      </div>

                      {/* Siatka połączonych dni */}
                      <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-16 lg:grid-cols-31 gap-1">
                        {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                          const day = i + 1;
                          const formattedDay = day < 10 ? `0${day}` : day;
                          const formattedMonth = (calMonth + 1) < 10 ? `0${calMonth + 1}` : calMonth + 1;
                          const dateStr = `${calYear}-${formattedMonth}-${formattedDay}`;

                          const activeBooking = bookings.find((b) => {
                            return Number(b.room_number) === roomNum && dateStr >= b.check_in && dateStr < b.check_out;
                          });

                          // Ustalamy czy to początek, środek czy koniec rezerwacji dla ładnego zaokrąglenia
                          const isStart = activeBooking && dateStr === activeBooking.check_in;
                          const isEnd = activeBooking && dateStr === new Date(new Date(activeBooking.check_out).getTime() - 86400000).toISOString().split('T')[0];

                          const bookingStyle = activeBooking ? getBookingColor(activeBooking.id) : null;

                          return (
                            <div
                              key={day}
                              onClick={() => {
                                if (activeBooking) setSelectedBookingDetails(activeBooking);
                              }}
                              className={`h-11 flex flex-col items-center justify-center text-xs transition relative group ${
                                activeBooking 
                                  ? `${bookingStyle?.bg} font-bold shadow-xs cursor-pointer hover:opacity-90 ${isStart ? 'rounded-l-xl ml-0.5' : ''} ${isEnd ? 'rounded-r-xl mr-0.5' : ''}` 
                                  : 'bg-white text-stone-500 border border-stone-200/60 rounded-xl'
                              }`}
                              title={activeBooking ? `${activeBooking.guest_name} (${activeBooking.check_in} — ${activeBooking.check_out})` : `Wolne: ${dateStr}`}
                            >
                              <span className="text-[10px] opacity-70 font-normal">{day}</span>
                              <span className="text-[10px] truncate px-1">
                                {isStart ? activeBooking.guest_name.split(' ')[0] : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* WIDOK 2: KLASYCZNA LISTA REZERWACJI */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200/80 overflow-hidden">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h2 className="font-serif font-bold text-xl text-stone-900">Wszystkie rezerwacje</h2>
              <span className="text-xs bg-stone-900 text-white px-4 py-2 rounded-full font-bold shadow-sm">
                Łącznie: {bookings.length}
              </span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-stone-400 font-medium">Ładowanie rezerwacji...</div>
            ) : bookings.length === 0 ? (
              <div className="p-20 text-center text-stone-400">Brak rezerwacji w bazie danych.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100">
                      <th className="p-5 font-semibold">Pokój</th>
                      <th className="p-5 font-semibold">Typ obiektu</th>
                      <th className="p-5 font-semibold">Gość i Kontakt</th>
                      <th className="p-5 font-semibold">Termin (Od — Do)</th>
                      <th className="p-5 font-semibold">Cena</th>
                      <th className="p-5 font-semibold text-right">Zarządzaj</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-sm">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-stone-50/80 transition group">
                        <td className="p-5">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-stone-900 text-white font-bold text-sm shadow-sm">
                            {b.room_number || 1}
                          </span>
                        </td>
                        <td className="p-5 font-serif font-bold text-stone-900">
                          {b.apartments?.name || 'Apartament'}
                        </td>
                        <td className="p-5">
                          <div className="font-bold text-stone-900">{b.guest_name}</div>
                          <div className="text-xs text-[#D4A373] font-medium mt-0.5">📞 {b.guest_phone || 'Brak telefonu'}</div>
                          <div className="text-xs text-stone-400">{b.guest_email}</div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-3 bg-stone-100/70 p-3 rounded-2xl w-fit border border-stone-200/50">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Zameldowanie</span>
                              <span className="font-bold text-stone-900 text-xs">🟢 {b.check_in}</span>
                            </div>
                            <span className="text-stone-300">→</span>
                            <div>
                              <span className="text-stone-400 uppercase font-bold text-rose-600 block">Wymeldowanie</span>
                              <span className="font-bold text-stone-900 text-xs">🔴 {b.check_out}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 font-extrabold text-stone-900">{b.total_price} zł</td>
                        <td className="p-5 text-right">
                          <button onClick={() => handleDelete(b.id)} className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-xl text-xs transition cursor-pointer">
                            Usuń rezerwację
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}