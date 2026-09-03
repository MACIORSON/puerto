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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200/80">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A373] block mb-1">Puerto Władysławowo</span>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Panel Zarządzania Rezerwacjami</h1>
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

        {/* Modal dodawania rezerwacji */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl border border-stone-100 my-auto">
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">Nowa rezerwacja (telefon / inne)</h3>
              
              <form onSubmit={handleAddBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Typ apartamentu</label>
                    <select 
                      value={selectedApt} 
                      onChange={(e) => setSelectedApt(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none font-medium"
                    >
                      {apartments.map((apt) => (
                        <option key={apt.id} value={apt.id}>{apt.name} ({apt.price_per_night} zł)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Wybierz pokój (1-9)</label>
                    <select 
                      value={selectedRoomNum} 
                      onChange={(e) => setSelectedRoomNum(Number(e.target.value))}
                      className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none font-bold text-[#D4A373]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <option key={num} value={num}>Pokój nr {num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Imię i nazwisko</label>
                    <input 
                      type="text" 
                      placeholder="Jan Kowalski" 
                      value={guestName} 
                      onChange={(e) => setGuestName(e.target.value)} 
                      className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Telefon</label>
                    <input 
                      type="tel" 
                      placeholder="+48 000 000 000" 
                      value={guestPhone} 
                      onChange={(e) => setGuestPhone(e.target.value)} 
                      className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none" 
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">E-mail</label>
                  <input 
                    type="email" 
                    placeholder="jan@example.com" 
                    value={guestEmail} 
                    onChange={(e) => setGuestEmail(e.target.value)} 
                    className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Zameldowanie (Od)</label>
                    <input 
                      type="date" 
                      value={checkIn} 
                      onChange={(e) => setCheckIn(e.target.value)} 
                      className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none font-medium" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Wymeldowanie (Do)</label>
                    <input 
                      type="date" 
                      value={checkOut} 
                      onChange={(e) => setCheckOut(e.target.value)} 
                      className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none font-medium" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Liczba gości</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={guestsCount} 
                      onChange={(e) => setGuestsCount(Number(e.target.value))} 
                      className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Cena całkowita (zł)</label>
                    <input 
                      type="number" 
                      value={totalPrice} 
                      onChange={(e) => setTotalPrice(Number(e.target.value))} 
                      className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none font-bold text-[#D4A373]" 
                      required 
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="w-1/2 bg-stone-100 text-stone-700 font-bold py-3.5 rounded-xl hover:bg-stone-200 transition text-sm cursor-pointer">
                    Anuluj
                  </button>
                  <button type="submit" className="w-1/2 bg-stone-900 text-white font-bold py-3.5 rounded-xl hover:bg-stone-800 transition text-sm cursor-pointer shadow-md">
                    Zapisz rezerwację
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista rezerwacji */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200/80 overflow-hidden">
          <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <div>
              <h2 className="font-serif font-bold text-xl text-stone-900">Harmonogram Rezerwacji</h2>
              <p className="text-xs text-stone-500 mt-0.5">Przeglądaj terminy przyjazdów i wyjazdów gości</p>
            </div>
            <span className="text-xs bg-stone-900 text-white px-4 py-2 rounded-full font-bold shadow-sm">
              Aktywnych rezerwacji: {bookings.length}
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
                    <th className="p-5 font-semibold">Termin pobytu (Od — Do)</th>
                    <th className="p-5 font-semibold">Cena</th>
                    <th className="p-5 font-semibold text-right">Zarządzaj</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {bookings.map((b) => {
                    // Obliczamy liczbę nocy dla ładnego wyświetlenia
                    const start = new Date(b.check_in);
                    const end = new Date(b.check_out);
                    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

                    return (
                      <tr key={b.id} className="hover:bg-stone-50/80 transition group">
                        
                        {/* Numer pokoju */}
                        <td className="p-5">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-stone-900 text-white font-bold text-sm shadow-sm">
                            {b.room_number || 1}
                          </span>
                        </td>

                        {/* Typ apartamentu */}
                        <td className="p-5 font-serif font-bold text-stone-900">
                          {b.apartments?.name || 'Apartament'}
                          <span className="block text-xs font-sans font-normal text-stone-400 mt-0.5">{b.guests} {b.guests === 1 ? 'osoba' : 'osoby'}</span>
                        </td>

                        {/* Dane gościa */}
                        <td className="p-5">
                          <div className="font-bold text-stone-900">{b.guest_name}</div>
                          <div className="text-xs text-[#D4A373] font-medium mt-0.5">📞 {b.guest_phone || 'Brak telefonu'}</div>
                          <div className="text-xs text-stone-400">{b.guest_email}</div>
                        </td>

                        {/* Wizualny termin przyjazdu i wyjazdu */}
                        <td className="p-5">
                          <div className="flex items-center gap-3 bg-stone-100/70 p-3 rounded-2xl w-fit border border-stone-200/50">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Zameldowanie</span>
                              <span className="font-bold text-stone-900 text-xs">🟢 {b.check_in}</span>
                            </div>
                            <span className="text-stone-300">→</span>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-rose-600 block">Wymeldowanie</span>
                              <span className="font-bold text-stone-900 text-xs">🔴 {b.check_out}</span>
                            </div>
                          </div>
                          <span className="text-[11px] text-stone-400 font-medium block mt-1.5 ml-1">
                            Całkowity pobyt: <strong className="text-stone-700">{nights} {nights === 1 ? 'noc' : 'noce'}</strong>
                          </span>
                        </td>

                        {/* Kwota */}
                        <td className="p-5">
                          <span className="font-extrabold text-stone-900 text-base">{b.total_price} zł</span>
                        </td>

                        {/* Akcja usuwania */}
                        <td className="p-5 text-right">
                          <button 
                            onClick={() => handleDelete(b.id)} 
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                          >
                            Usuń rezerwację
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}