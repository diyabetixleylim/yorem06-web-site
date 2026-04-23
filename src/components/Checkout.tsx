import React, { useState } from 'react';
import { X, ShieldCheck, Truck, Info } from 'lucide-react';
import { CartItem } from '../constants';
import { LegalModal } from './LegalModal';
import { LEGAL_CONTENT } from '../legalContent';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onComplete: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onClose, items }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    email: '',
    agreedToTerms: false,
    agreedToReturnPolicy: false
  });

  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: keyof typeof LEGAL_CONTENT | null }>({
    isOpen: false,
    type: null
  });

  const [error, setError] = useState<string | null>(null);
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const SHIPPING_FEE = 179;
  const FREE_SHIPPING_THRESHOLD = 3000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paytrToken || isProcessing) return;

    setError(null);

    if (formData.agreedToTerms && formData.agreedToReturnPolicy) {
      setIsProcessing(true);
      try {
        // Step 1: Get PayTR Token
        const response = await fetch('/api/paytr/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            customerInfo: {
              fullName: formData.fullName,
              address: formData.address,
              phone: formData.phone,
              email: formData.email,
            },
            total: total,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setPaytrToken(data.token);
          
          // Step 2: Store order details temporarily for completion after payment
          localStorage.setItem('yorem06_pending_order', JSON.stringify({
            orderDetails: items.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            customerInfo: {
              fullName: formData.fullName,
              address: formData.address,
              phone: formData.phone,
              email: formData.email,
            },
            total: total.toFixed(2),
          }));
        } else {
          setError(data.message || 'Ödeme sistemi başlatılamadı.');
        }
      } catch (err) {
        console.error('Checkout Error:', err);
        setError('Ödeme sistemiyle iletişim kurulurken bir ağ hatası oluştu.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setError('Lütfen tüm sözleşmeleri okuyup kabul ettiğinizi onaylayın.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 md:p-8 overflow-y-auto">
      <div className="bg-[#F5F5F3] w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-8 py-6 flex items-center justify-between bg-white border-b border-earth-100">
            <h2 className="text-2xl serif text-earth-900">
              {paytrToken ? 'Güvenli Ödeme' : 'Ödeme Ekranı'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-earth-50 rounded-full transition-colors text-earth-400 hover:text-earth-900"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {paytrToken ? (
              <div key="paytr-container" className="w-full flex flex-col items-center gap-6">
                <div className="w-full bg-white rounded-3xl p-4 shadow-sm border border-earth-100 min-h-[600px] flex items-center justify-center relative">
                   <iframe 
                    src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`} 
                    id="paytriframe" 
                    frameBorder="0" 
                    scrolling="yes" 
                    style={{ width: '100%', minHeight: '600px' }}
                    title="PayTR Ödeme"
                  />
                </div>
                <p className="text-xs text-earth-400 font-medium text-center max-w-md">
                  Ödemeniz PayTR altyapısı ile güvence altındadır. İşlem tamamlandığında otomatik olarak yönlendirileceksiniz.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Order Summary */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-earth-100">
                    <h3 className="text-lg font-bold text-earth-900 mb-6 border-b border-earth-50 pb-4">Sipariş Özeti</h3>
                    <div className="space-y-4 mb-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-earth-600">{item.name} ({item.unit})</span>
                          <span className="text-earth-900 font-bold">{item.quantity} x {item.price.toFixed(2)} TL</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 pt-4 border-t border-earth-50">
                      <div className="flex justify-between text-sm">
                        <span className="text-earth-400">Kargo Ücreti:</span>
                        <span className="text-earth-900 font-bold">{shippingCost === 0 ? 'Ücretsiz' : `${shippingCost.toFixed(2)} TL`}</span>
                      </div>
                      <div className="flex justify-between text-lg pt-2">
                        <span className="serif text-earth-900">Toplam:</span>
                        <span className="font-bold text-nature-700">{total.toFixed(2)} TL</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-earth-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-earth-900">PayTR Güvenli Ödeme</h3>
                      <div className="flex gap-2">
                        <div className="px-2 py-1 border border-earth-100 rounded bg-white flex items-center">
                          <span className="text-[10px] font-black text-blue-800 italic">VISA</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-red-500 rounded-full -mr-1.5 opacity-80"></div>
                          <div className="w-4 h-4 bg-yellow-500 rounded-full opacity-80"></div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-earth-50 flex flex-col items-center gap-6">
                      {error && (
                        <div className="w-full p-4 bg-red-50 border border-red-100 rounded-xl text-center">
                          <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                      )}
                      <button 
                        type="submit"
                        disabled={isProcessing}
                        className="w-full md:w-auto px-12 py-4 bg-[#4A7C2C] text-white rounded-xl font-bold hover:bg-[#3D6624] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {isProcessing ? 'Yükleniyor...' : 'Ödemeye Geç'}
                      </button>
                      
                      <div className="w-full flex flex-col items-center gap-4 py-4 border-t border-earth-50">
                        <div className="flex flex-wrap justify-center items-center gap-6 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 object-contain" referrerPolicy="no-referrer" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-8 object-contain" referrerPolicy="no-referrer" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Troy_logo.svg/1200px-Troy_logo.svg.png" alt="Troy" className="h-6 object-contain" referrerPolicy="no-referrer" />
                          <div className="flex items-center gap-1 text-[#00A870] font-bold">
                            <ShieldCheck size={24} />
                            <span className="text-sm">SSL</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-earth-400 text-center font-medium uppercase tracking-wider">
                          Kredi kartı bilgileriniz PayTR güvencesiyle korunmaktadır.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Delivery Info */}
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-earth-100">
                    <h3 className="text-lg font-bold text-earth-900 mb-6 border-b border-earth-50 pb-4">Teslimat Bilgileri</h3>
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-earth-400 uppercase tracking-wider">İsim Soyisim</label>
                        <input 
                          required
                          type="text" 
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nature-500 transition-all" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-earth-400 uppercase tracking-wider">Adres</label>
                        <textarea 
                          required
                          rows={4}
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nature-500 transition-all resize-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-earth-400 uppercase tracking-wider">Telefon</label>
                        <input 
                          required
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nature-500 transition-all" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-earth-400 uppercase tracking-wider">E-posta</label>
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nature-500 transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Full Width */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-earth-100 space-y-4">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center pt-1">
                        <input 
                          type="checkbox" 
                          required
                          checked={formData.agreedToTerms}
                          onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-earth-200 bg-white transition-all checked:bg-nature-600 checked:border-nature-600" 
                        />
                        <ShieldCheck className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                      </div>
                      <span className="text-sm text-earth-600 leading-relaxed group-hover:text-earth-900 transition-colors">
                        <button 
                          type="button"
                          onClick={() => setLegalModal({ isOpen: true, type: 'distanceSales' })}
                          className="font-bold hover:text-nature-600 transition-colors"
                        >
                          Mesafeli Satış Sözleşmesi
                        </button>'ni ve <button 
                          type="button"
                          onClick={() => setLegalModal({ isOpen: true, type: 'preliminary' })}
                          className="font-bold hover:text-nature-600 transition-colors"
                        >
                          Ön Bilgilendirme Formu
                        </button>'nu okudum, kabul ediyorum.
                      </span>
                    </label>

                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center pt-1">
                        <input 
                          type="checkbox" 
                          required
                          checked={formData.agreedToReturnPolicy}
                          onChange={(e) => setFormData({...formData, agreedToReturnPolicy: e.target.checked})}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-earth-200 bg-white transition-all checked:bg-nature-600 checked:border-nature-600" 
                        />
                        <ShieldCheck className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5" />
                      </div>
                      <span className="text-sm text-earth-600 leading-relaxed group-hover:text-earth-900 transition-colors">
                        Gıda ürünlerinde <button 
                          type="button"
                          onClick={() => setLegalModal({ isOpen: true, type: 'returnPolicy' })}
                          className="font-bold hover:text-nature-600 transition-colors"
                        >
                          ambalaj açıldıktan sonra iade olmadığını
                        </button> kabul ediyorum.
                      </span>
                    </label>

                    <div className="bg-[#FFF9F0] p-4 rounded-2xl border border-[#FFE8CC] flex items-start gap-3">
                      <Info className="text-[#FF922B] shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-[#862E00] font-medium">
                        <span className="font-bold">Dikkat:</span> Açılmış gıda ürünleri, hijyen kuralları gereği iade alınmaz.
                      </p>
                    </div>
                  </div>

                  {/* Footer Links */}
                  <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-4 pb-8 text-[11px] text-earth-400 font-medium uppercase tracking-widest">
                    <button type="button" onClick={() => setLegalModal({ isOpen: true, type: 'distanceSales' })} className="hover:text-earth-900 transition-colors">Mesafeli Satış Sözleşmesi</button>
                    <div className="hidden md:block w-px h-3 bg-earth-200"></div>
                    <button type="button" onClick={() => setLegalModal({ isOpen: true, type: 'preliminary' })} className="hover:text-earth-900 transition-colors">Ön Bilgilendirme Formu</button>
                    <div className="hidden md:block w-px h-3 bg-earth-200"></div>
                    <button type="button" onClick={() => setLegalModal({ isOpen: true, type: 'returnPolicy' })} className="hover:text-earth-900 transition-colors">İade ve İptal Politikası</button>
                    <div className="hidden md:block w-px h-3 bg-earth-200"></div>
                    <button type="button" onClick={() => setLegalModal({ isOpen: true, type: 'kvkk' })} className="hover:text-earth-900 transition-colors">Gizlilik & KVKK Politikası</button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {legalModal.isOpen && (
            <LegalModal 
              isOpen={legalModal.isOpen}
              onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
              title={legalModal.type ? LEGAL_CONTENT[legalModal.type].title : ''}
              content={legalModal.type ? LEGAL_CONTENT[legalModal.type].content : ''}
            />
          )}
      </div>
    </div>
  );
};
