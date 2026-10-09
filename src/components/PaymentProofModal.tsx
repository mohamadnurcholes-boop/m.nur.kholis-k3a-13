import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { uploadPaymentProof } from '../services/orderService';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  onSuccess?: () => void;
}

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
  onSuccess,
}) => {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal 5MB.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setErrorMessage('Nomor Pesanan / ID wajib diisi.');
      return;
    }
    if (!imagePreview) {
      setErrorMessage('Silakan pilih foto bukti transfer terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const cleanId = orderId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      await uploadPaymentProof(cleanId, imagePreview);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Upload proof error:', err);
      setErrorMessage('Gagal mengunggah bukti pembayaran. Pastikan Nomor Pesanan sesuai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-lg bg-[#11141c] border border-amber-900/40 rounded-3xl shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-serif-display text-xl font-bold text-white">
              Bukti Pembayaran Terkirim!
            </h3>
            <p className="text-xs text-gray-300 max-w-sm mx-auto">
              Bukti transfer untuk pesanan <strong className="text-amber-400">{orderId}</strong> berhasil diunggah ke database. Tim admin khzzz store akan segera memverifikasi dan memproses pesanan Anda.
            </p>
            <button
              onClick={() => {
                setIsSuccess(false);
                setImagePreview(null);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors"
            >
              Tutup Jendela
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-display text-lg font-bold text-white">
                  Unggah Bukti Pembayaran
                </h3>
                <p className="text-xs text-gray-400">
                  Kirim struk / tangkapan layar transfer BCA, Mandiri, atau QRIS
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-300 block mb-1">
                Nomor Pesanan / ID Order *
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Cth: KHZ-261008-8821"
                className="w-full px-3 py-2.5 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 uppercase focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1.5">
                Pilih Foto Struk / Bukti Transfer *
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-black/40 p-2">
                  <img
                    src={imagePreview}
                    alt="Preview Bukti"
                    className="w-full max-h-56 object-contain rounded-xl mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-4 right-4 bg-black/80 hover:bg-rose-600 text-white text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Ganti Foto
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-800 hover:border-amber-500/60 rounded-2xl cursor-pointer bg-[#151923]/60 transition-colors group">
                  <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-amber-400 transition-colors mb-2" />
                  <span className="text-xs text-gray-300 font-medium">
                    Klik untuk pilih gambar struk transfer
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1">
                    Mendukung format PNG, JPG, JPEG (Maks. 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !imagePreview}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-40 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              {isSubmitting ? 'Mengunggah ke Server...' : 'Kirim Bukti Pembayaran'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
