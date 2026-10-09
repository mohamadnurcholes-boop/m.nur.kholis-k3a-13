import React from 'react';
import { Award, Shield, Sparkles, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onCategorySelect: (cat: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onCategorySelect }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#10131a] via-[#0c0e12] to-[#0c0e12] border-b border-amber-900/20 py-10 sm:py-16">
      {/* Subtle radial ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Koleksi Masterpiece Horologi 2026
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-display font-bold text-white tracking-tight leading-tight">
              Presisi Abadi di Pergelangan Anda,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                khzzz store.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl font-light leading-relaxed">
              Pilihan curated 12 jam tangan mewah dengan 3 kategori prestisius:{' '}
              <span className="text-amber-200 font-medium">Chronograph & Luxury</span>,{' '}
              <span className="text-amber-200 font-medium">Sport & Diver</span>, serta{' '}
              <span className="text-amber-200 font-medium">Classic & Minimalist</span>.
              Seluruh produk terhubung langsung ke basis data stok realtime dengan jaminan 100% original.
            </p>

            {/* Quick Category Action Cards */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => onCategorySelect('Chronograph & Luxury')}
                className="group p-3 rounded-xl bg-[#141720]/80 border border-gray-800 hover:border-amber-500/60 transition-all text-left cursor-pointer"
              >
                <span className="text-[10px] text-amber-400 font-mono-code uppercase block mb-1">
                  Kategori 01
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-200 group-hover:text-amber-300 block line-clamp-1">
                  Chronograph & Luxury
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                  4 Koleksi <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => onCategorySelect('Sport & Diver')}
                className="group p-3 rounded-xl bg-[#141720]/80 border border-gray-800 hover:border-amber-500/60 transition-all text-left cursor-pointer"
              >
                <span className="text-[10px] text-amber-400 font-mono-code uppercase block mb-1">
                  Kategori 02
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-200 group-hover:text-amber-300 block line-clamp-1">
                  Sport & Diver
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                  4 Koleksi <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => onCategorySelect('Classic & Minimalist')}
                className="group p-3 rounded-xl bg-[#141720]/80 border border-gray-800 hover:border-amber-500/60 transition-all text-left cursor-pointer"
              >
                <span className="text-[10px] text-amber-400 font-mono-code uppercase block mb-1">
                  Kategori 03
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-200 group-hover:text-amber-300 block line-clamp-1">
                  Classic & Minimalist
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                  4 Koleksi <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Feature Box */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl p-1 bg-gradient-to-b from-amber-500/30 via-amber-900/20 to-gray-800/20 shadow-2xl shadow-amber-950/30">
              <div className="relative bg-[#11141b] rounded-[14px] overflow-hidden p-6 border border-amber-500/20">
                <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden mb-4 border border-gray-800 group">
                  <img
                    src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80"
                    alt="KHZZZ Royal Chronograph"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="bg-amber-500/90 text-black font-bold px-2.5 py-1 rounded-md uppercase tracking-wider text-[10px]">
                      Flagship Model
                    </span>
                    <span className="bg-black/70 backdrop-blur-md text-amber-300 font-mono-code px-2 py-0.5 rounded border border-amber-500/30">
                      Automatic Chrono Cal. 4130
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif-display text-lg font-bold text-white">
                    KHZZZ Royal Cosmograph Black Onyx
                  </h3>
                  <p className="text-xs text-gray-400">
                    Bezel keramik tachymeter anti-gores, sapphire crystal ganda, dan caseback pameran.
                  </p>
                </div>

                {/* 4 Trust Badges */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-800/80 text-[11px] text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Garansi Mesin 2 Tahun</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>100% Produk Original</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Asuransi Ekspedisi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Sertifikat & Box Mewah</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
