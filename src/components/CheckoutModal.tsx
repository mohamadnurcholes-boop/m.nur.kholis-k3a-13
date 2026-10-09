import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  CheckCircle,
  Copy,
  QrCode,
  UploadCloud,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../utils/formatters';
import { createOrder } from '../services/orderService';
import { Order, OrderItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onOpenUploadProof: (orderId: string) => void;
}

const COURIERS = [
  { id: 'sicepat', name: 'SiCepat BEST (1-2 Hari) - Recommended', fee: 35000 },
  { id: 'jne', name: 'JNE YES Express (1 Hari Kerja)', fee: 45000 },
  { id: 'jnt', name: 'J&T Premium Express (2-3 Hari)', fee: 28000 },
];

const PAYMENT_METHODS = [
  {
    id: 'bca',
    name: 'Transfer Bank BCA',
    bank: 'BCA',
    accountNumber: '8270921188',
    accountName: 'PT KHZZZ HOROLOGY INDONESIA',
    desc: 'Verifikasi cepat melalui mutasi bank otomatis',
  },
  {
    id: 'mandiri',
    name: 'Transfer Bank Mandiri',
    bank: 'Mandiri',
    accountNumber: '1370019283741',
    accountName: 'PT KHZZZ HOROLOGY INDONESIA',
    desc: 'Menerima transfer sesama Mandiri & Antar Bank',
  },
  {
    id: 'qris',
    name: 'QRIS Instant (Semua Bank & E-Wallet)',
    bank: 'QRIS',
    accountNumber: 'ID10202619827364',
    accountName: 'KHZZZ WATCH BOUTIQUE',
    desc: 'Scan barcode menggunakan BCA Mobile, GoPay, OVO, ShopeePay, DANA',
  },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  onOpenUploadProof,
}) => {
  const { items, subtotal, discount, clearCart } = useCart();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Jakarta Selatan');
  const [postalCode, setPostalCode] = useState('');
  const [selectedCourier, setSelectedCourier] = useState(COURIERS[0].id);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const courierObj = COURIERS.find((c) => c.id === selectedCourier) || COURIERS[0];
  const shippingFee = courierObj.fee;
  const totalAmount = Math.max(0, subtotal - discount + shippingFee);
  const paymentObj = PAYMENT_METHODS.find((p) => p.id === selectedPayment) || PAYMENT_METHODS[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setErrorMessage('Harap lengkapi seluruh formulir data pengiriman dengan benar.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Keranjang belanja Anda kosong.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
        category: item.product.category,
      }));

      const newOrder = await createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        city: city.trim(),
        postalCode: postalCode.trim() || '12000',
        courier: courierObj.name,
        paymentMethod: paymentObj.name,
        items: orderItems,
        subtotal,
        shippingFee,
        discount,
        totalAmount,
        status: 'pending_payment',
      });

      // Clear the cart
      clearCart();
      setCreatedOrder(newOrder);
      onOrderSuccess(newOrder);
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage('Terjadi kesalahan saat memproses pesanan. Silakan periksa koneksi dan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#11141c] border border-amber-900/40 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-gray-800 bg-[#0e1017] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif-display text-lg sm:text-xl font-bold text-white">
              {createdOrder ? 'Pesanan Berhasil Dibuat!' : 'Konfirmasi & Checkout Pesanan'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {createdOrder ? (
            /* SUCCESS INVOICE STATE */
            <div className="space-y-6 text-center max-w-xl mx-auto py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-mono-code text-amber-400 uppercase tracking-widest block mb-1">
                  Invoice Resmi Pembelian
                </span>
                <h3 className="font-serif-display text-2xl font-bold text-white">
                  Nomor Pesanan: {createdOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-400 mt-1.5">
                  Terima kasih <strong className="text-gray-200">{createdOrder.customerName}</strong>! Data pesanan Anda telah tersimpan di sistem pusat khzzz store.
                </p>
              </div>

              {/* Payment Instruction Card */}
              <div className="bg-[#161a25] border border-amber-500/30 rounded-2xl p-5 text-left space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800 text-xs">
                  <span className="text-gray-400">Metode Pembayaran:</span>
                  <span className="font-bold text-amber-300">{createdOrder.paymentMethod}</span>
                </div>

                {selectedPayment === 'qris' ? (
                  <div className="text-center py-2 space-y-3">
                    <p className="text-xs text-gray-300">
                      Scan kode QRIS berikut via BCA Mobile, GoPay, OVO, atau DANA:
                    </p>
                    <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-xl shadow-lg flex items-center justify-center">
                      <div className="w-full h-full border-2 border-dashed border-gray-900 rounded-lg flex flex-col items-center justify-center text-gray-900">
                        <QrCode className="w-24 h-24" />
                        <span className="text-[10px] font-bold font-mono tracking-tighter mt-1">
                          QRIS KHZZZ STORE
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">Nomor Rekening Tujuan:</div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e1017] border border-gray-800">
                      <div>
                        <div className="font-mono-code text-base font-bold text-white tracking-wider">
                          {paymentObj.accountNumber}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {paymentObj.accountName} ({paymentObj.bank})
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(paymentObj.accountNumber)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedText ? 'Tersalin!' : 'Salin Rekening'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <span className="text-xs text-gray-400">Total Yang Harus Ditransfer:</span>
                  <span className="font-mono-code text-xl font-bold text-amber-400">
                    {formatRupiah(createdOrder.totalAmount)}
                  </span>
                </div>

                <div className="text-[11px] text-amber-300/80 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Mohon selesaikan pembayaran dan unggah bukti transfer agar pesanan langsung diverifikasi oleh admin.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenUploadProof(createdOrder.id);
                  }}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  Unggah Bukti Transfer Sekarang
                </button>

                <button
                  onClick={onClose}
                  className="py-3.5 px-6 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Selesai & Lacak Nanti
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM STATE */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* 1. Customer Shipping Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-800">
                  <User className="w-4 h-4" />
                  1. Informasi Pembeli & Pengiriman
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Nama Lengkap *</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Cth: Muhammad Kholis"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Email Aktif *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Cth: kholis@example.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Nomor WhatsApp / HP *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Cth: 081234567890"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Kota / Kabupaten *</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Cth: Jakarta Selatan"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Alamat Lengkap Pengiriman *</label>
                  <textarea
                    required
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Nama Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan"
                    className="w-full p-3 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="w-full sm:w-1/2">
                  <label className="text-xs text-gray-400 block mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="12430"
                    className="w-full px-3 py-2.5 bg-[#151923] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 2. Expedition Selection */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-800">
                  <Truck className="w-4 h-4" />
                  2. Pilihan Ekspedisi Asuransi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {COURIERS.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourier(c.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedCourier === c.id
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#151923] border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <div className="font-semibold text-gray-200">{c.name}</div>
                      <div className="font-mono-code font-bold text-amber-400 mt-1">
                        {formatRupiah(c.fee)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-800">
                  <CreditCard className="w-4 h-4" />
                  3. Metode Pembayaran Resmi
                </h3>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPayment(p.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                        selectedPayment === p.id
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#151923] border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedPayment === p.id ? 'border-amber-400' : 'border-gray-600'
                          }`}
                        >
                          {selectedPayment === p.id && (
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-200">{p.name}</div>
                          <div className="text-[11px] text-gray-400">{p.desc}</div>
                        </div>
                      </div>
                      <span className="font-mono-code font-bold text-amber-400/90 text-xs">
                        {p.bank}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Final Breakdown & Submit */}
              <div className="bg-[#161a25] rounded-2xl p-4 border border-gray-800 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({items.length} item)</span>
                  <span className="font-mono-code text-gray-200">{formatRupiah(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Diskon Voucher</span>
                    <span className="font-mono-code">- {formatRupiah(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Ongkos Kirim ({courierObj.name.split(' ')[0]})</span>
                  <span className="font-mono-code text-gray-200">{formatRupiah(shippingFee)}</span>
                </div>
                <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Pembayaran</span>
                  <span className="font-mono-code text-lg text-amber-400">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Menghubungkan ke Database...</span>
                ) : (
                  <>
                    <span>Buat Pesanan Sekarang ({formatRupiah(totalAmount)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
