import { supabase } from '../../supabase';
import Link from 'next/link';
import Image from 'next/image';

export default async function ApartmentDetails({ params }: { params: { id: string } }) {
  const { id } = params;

  // Pobieranie konkretnego apartamentu z bazy Supabase
  const { data: apartment, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !apartment) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Nie znaleziono apartamentu</h1>
          <Link href="/" className="bg-stone-900 text-white px-6 py-3 rounded-2xl text-sm">
            Wróć do strony głównej
          </Link>
        </div>
      </div>
    );
  }

  // Galeria zdjęć (w tym Twoje pliki apt-1.jpg do apt-6.jpg)
  const galleryImages = [
    "/images/apt-1.jpg",
    "/images/apt-2.jpg",
    "/images/apt-3.jpg",
    "/images/apt-4.jpg",
    "/images/apt-5.jpg",
    "/images/apt-6.jpg",
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Nawigacja powrotna */}
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm font-medium mb-8 transition">
          <span>&larr;</span> Wróć do oferty
        </Link>

        {/* Nagłówek apartamentu */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-stone-500 mb-1 block">Puerto Władysławowo</span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">{apartment.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-bold text-stone-900">{apartment.price_per_night} zł</span>
              <span className="text-xs text-stone-500 block">za dobę</span>
            </div>
            <Link 
              href={`/book/${apartment.id}`} 
              className="bg-stone-900 text-white font-medium px-6 py-3.5 rounded-2xl hover:bg-stone-800 transition shadow-sm text-sm"
            >
              Zarezerwuj teraz
            </Link>
          </div>
        </div>

        {/* Główna galeria zdjęć */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {galleryImages.map((src, index) => (
            <div key={index} className={`relative rounded-3xl overflow-hidden bg-stone-200 shadow-sm ${index === 0 ? 'md:col-span-2 md:row-span-2 h-80 md:h-[450px]' : 'h-60'}`}>
              <Image 
                src={src} 
                alt={`${apartment.name} - zdjęcie ${index + 1}`} 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-500" 
              />
            </div>
          ))}
        </div>

        {/* Szczegóły i opis */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-stone-100 shadow-sm grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">O tym miejscu</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-6">{apartment.description}</p>
            <p className="text-stone-600 text-sm leading-relaxed">
              Apartament zaprojektowany z myślą o najwyższym komforcie wypoczynku nad polskim morzem. Jasne wnętrza, nowoczesne wykończenie oraz bliskość plaży gwarantują udany urlop o każdej porze roku.
            </p>
          </div>
          
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/50 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-stone-900 text-sm mb-4">Informacje o pobycie</h4>
              <ul className="space-y-3 text-xs text-stone-600">
                <li className="flex justify-between"><span>Maks. liczba osób:</span> <strong className="text-stone-900">{apartment.capacity}</strong></li>
                <li className="flex justify-between"><span>Zameldowanie:</span> <strong className="text-stone-900">od 14:00</strong></li>
                <li className="flex justify-between"><span>Wymeldowanie:</span> <strong className="text-stone-900">do 10:00</strong></li>
                <li className="flex justify-between"><span>Parking:</span> <strong className="text-stone-900">W cenie</strong></li>
              </ul>
            </div>
            <Link 
              href={`/book/${apartment.id}`} 
              className="mt-6 w-full bg-stone-900 text-white font-medium py-3 rounded-xl hover:bg-stone-800 transition text-center text-xs"
            >
              Wybierz ten termin
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}