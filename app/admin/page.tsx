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
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState(''); // Telefon
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [totalPrice, setTotalPrice] = useState(0);

  // Automatyczne liczenie ceny przy zmianie dat lub apartamentu
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
    const { error } = await supabase.from('bookings').insert([
      {
        apartment_id: selectedApt,
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
      <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-stone-200">
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Panel Zarządzania</h1>
          <p className="text-stone-500 text-xs mb-6">Strefa dla gospodarza obiektu</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Wpisz 4-cyfrowy PIN" 
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border-2 border-stone-200 rounded-2xl p-4 text-center text-xl tracking-widest outline-none focus:border-stone-900"
              required
            />
            <button 
              type="submit" 
              className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl hover:bg-stone-800 transition text-sm cursor-pointer"
            >
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
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Panel Gospodarza</span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">Zarządzanie Rezerwacjami</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#D4A373] text-white font-bold px-5 py-3 rounded-2xl hover:bg-[#c39263] transition text-sm shadow-sm cursor-pointer"
            >
              + Dodaj rezerwację ręcznie
            </button>
            <Link 
              href="/" 
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-5 py-3 rounded-2xl transition text-sm"
            >
              Podgląd strony
            </Link>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-stone-100">
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">Dodaj rezerwację (np. telefoniczną)</h3>
              
              <form onSubmit={handleAddBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Apartament</label>
                  <select 
                    value={selectedApt} 
                    onChange={(e) => setSelectedApt(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none"
                  >
                    {apartments.map((apt) => (
                      <option key={apt.id} value={apt.id}>{apt.name} ({apt.price_per_night} zł/noc)</option>
                    ))}
                  </select>
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
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-1">E-mail (opcjonalnie)</label>
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
                      className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Wymeldowanie (Do)</label>
                    <input 
                      type="date" 
                      value={checkOut} 
                      onChange={(e) => setCheckOut(e.target.value)} 
                      className="w-full border border-stone-200 rounded-xl p-3 text-sm bg-stone-50 outline-none" 
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
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="w-1/2 bg-stone-100 text-stone-700 font-bold py-3 rounded-xl hover:bg-stone-200 transition text-sm cursor-pointer"
                  >
                    Anuluj
                  </button>
                  <button 
                    type="submit" 
                    className="w-1/2 bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-stone-800 transition text-sm cursor-pointer"
                  >
                    Zapisz rezerwację
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center">
            <h2 className="font-serif font-bold text-lg text-stone-900">Aktualne rezerwacje w systemie</h2>
            <span className="text-xs bg-stone-100 px-3 py-1 rounded-full font-bold text-stone-600">Łącznie: {bookings.length}</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-stone-400">Pobieranie rezerwacji...</div>
          ) : bookings.length === 0 ? (
            <div className="p-16 text-center text-stone-400">Brak rezerwacji w bazie danych. Czekamy na pierwszych gości!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100">
                    <th className="p-4 font-semibold">Apartament</th>
                    <th className="p-4 font-semibold">Gość i Kontakt</th>
                    <th className="p-4 font-semibold">Termin pobytu</th>
                    <th className="p-4 font-semibold">Goście</th>
                    <th className="p-4 font-semibold">Kwota</th>
                    <th className="p-4 font-semibold text-right">Akcja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50/50 transition">
                      <td className="p-4 font-bold text-stone-900">{b.apartments?.name || 'Apartament'}</td>
                      <td className="p-4">
                        <div className="font-semibold text-stone-900">{b.guest_name}</div>
                        <div className="text-xs text-stone-500">{b.guest_phone}</div>
                        <div className="text-xs text-stone-400">{b.guest_email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-stone-900 font-medium">{b.check_in}</div>
                        <div className="text-xs text-stone-400">do {b.check_out}</div>
                      </td>
                      <td className="p-4 text-stone-600">{b.guests} os.</td>
                      <td className="p-4 font-extrabold text-stone-900">{b.total_price} zł</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDelete(b.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}