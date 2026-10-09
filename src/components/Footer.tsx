import React from 'react';
import { Watch, ShieldCheck, Truck, Clock, Award, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onCategorySelect: (cat: string) => void;
  onOpenOrderTracking: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onCategorySelect,
  onOpenOrderTracking,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-[#08090d] border-t border-amber-900/20 text-gray-400 text-xs">
      {/* 4 Brand Pillars */}
      <div className="border-b border-gray-800/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-xs">100% Produk Original</div>
              <div className="text-[11px] text-gray-500">Jaminan keaslian seumur hidup</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-xs">Garansi Mesin 2 Tahun</div>
              <div className="text-[11px] text-gray-500">Service & suku cadang resmi</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-xs">Asuransi Pengiriman</div>
              <div className="text-[11px] text-gray-500">Proteksi penuh hingga tujuan</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-xs">Pengiriman Cepat</div>
              <div className="text-[11px] text-gray-500">Diproses dalam 24 jam kerja</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center">
                <Watch className="w-4 h-4 text-black" />
              </div>
              <span className="font-serif-display text-xl font-bold tracking-wider text-white">
                khzzz store
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Destinasi terpercaya para kolektor dan penikmat seni horologi mewah di Indonesia. Menghadirkan seleksi jam tangan berkualitas tinggi dengan standar presisi internasional.
            </p>
            <div className="space-y-1.5 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Pacific Place Mall Level 2, SCBD Jakarta Selatan 12190</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Concierge & WhatsApp: +62 812-9988-7766</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>concierge@khzzzstore.com</span>
              </div>
            </div>
          </div>

          {/* Kategori Jam */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Koleksi Kategori
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onCategorySelect('Chronograph & Luxury')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Chronograph & Luxury (4)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('Sport & Diver')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Sport & Diver (4)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('Classic & Minimalist')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Classic & Minimalist (4)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onCategorySelect('Semua')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Semua Koleksi Jam (12)
                </button>
              </li>
            </ul>
          </div>

          {/* Layanan Pelanggan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Bantuan & Layanan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenOrderTracking}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Lacak Pesanan Saya
                </button>
              </li>
              <li>
                <span className="text-gray-500">Konfirmasi Pembayaran Transfer</span>
              </li>
              <li>
                <span className="text-gray-500">Kebijakan Garansi 2 Tahun</span>
              </li>
              <li>
                <span className="text-gray-500">Panduan Perawatan Jam Tangan</span>
              </li>
            </ul>
          </div>

          {/* Sistem Keamanan & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Sistem Internal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer"
                >
                  Admin Panel Login
                </button>
              </li>
              <li className="text-gray-500">
                Firestore Database Single Source
              </li>
              <li className="text-gray-500">
                Persetujuan Pembayaran Realtime
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & partners */}
        <div className="pt-8 mt-8 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <div>
            © 2026 khzzz store Indonesia. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-[#12151f] px-2.5 py-1 rounded border border-gray-800 font-mono text-gray-400">BCA</span>
            <span className="bg-[#12151f] px-2.5 py-1 rounded border border-gray-800 font-mono text-gray-400">Mandiri</span>
            <span className="bg-[#12151f] px-2.5 py-1 rounded border border-gray-800 font-mono text-gray-400">QRIS</span>
            <span className="bg-[#12151f] px-2.5 py-1 rounded border border-gray-800 font-mono text-gray-400">JNE YES</span>
            <span className="bg-[#12151f] px-2.5 py-1 rounded border border-gray-800 font-mono text-gray-400">SiCepat</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
