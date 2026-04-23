import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Minus, X, CreditCard, Truck, ShieldCheck, ArrowRight, Trash2, Lock, Heart } from 'lucide-react';
import { CartItem } from '../constants';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  checkoutStatus: 'idle' | 'success';
}

export const Cart: React.FC<CartProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove,
  onCheckout,
  checkoutStatus
}) => {
  // GTM: View Cart Event
  React.useEffect(() => {
    if (isOpen && window.dataLayer) {
      window.dataLayer.push({
        event: 'view_cart',
        ecommerce: {
          value: total,
          currency: 'TL',
          items: items.map(item => ({
            item_name: item.name,
            item_id: item.id,
            price: item.price,
            quantity: item.quantity
          }))
        }
      });
    }
  }, [isOpen]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasPaidItems = items.some(item => item.price > 0);
  const MIN_ORDER_AMOUNT = 600;
  const isMeetingMinAmount = total >= MIN_ORDER_AMOUNT;
  const SHIPPING_FEE = 179;
  const FREE_SHIPPING_THRESHOLD = 3000;
  const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - total;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-earth-900/60 backdrop-blur-md z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 35, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#FCFBF7] z-50 shadow-2xl flex flex-col md:border-l border-earth-100"
      >
        {/* Header */}
        <div className="px-10 py-8 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl serif text-earth-900 tracking-tight">Sepetiniz</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-nature-500 rounded-full" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-earth-400">
                {itemCount > 0 ? `${itemCount} Ürün Seçildi` : 'Henüz Ürün Yok'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="group p-3 hover:bg-earth-50 text-earth-300 hover:text-earth-900 rounded-full transition-all duration-300"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-4 custom-scrollbar">
          {checkoutStatus === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="relative">
                <div className="w-28 h-28 bg-nature-50 text-nature-600 rounded-full flex items-center justify-center shadow-inner">
                  <ShieldCheck size={56} strokeWidth={1.5} />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-nature-500"
                >
                  <Heart size={20} fill="currentColor" />
                </motion.div>
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl serif text-earth-900">Teşekkür Ederiz!</h3>
                <p className="text-earth-600 text-sm leading-relaxed max-w-[300px] mx-auto">
                  Siparişiniz başarıyla alındı. Doğanın tazeliği en kısa sürede kapınızda olacak.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-earth-900 text-white rounded-full font-bold text-sm hover:bg-earth-800 transition-all shadow-xl hover:shadow-nature-900/20"
              >
                Alışverişe Devam Et
              </button>
            </motion.div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
              <div className="relative">
                <div className="w-32 h-32 bg-earth-50 text-earth-100 rounded-full flex items-center justify-center">
                  <ShoppingCart size={64} strokeWidth={1} />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-2xl serif text-earth-900">Sepetiniz Boş Görünüyor</p>
                <p className="text-earth-400 text-sm max-w-[240px] mx-auto">
                  Köyümüzün taze hasat ürünlerini sepetinize ekleyerek başlayabilirsiniz.
                </p>
              </div>
              <button 
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    document.getElementById('ürünler')?.scrollIntoView({ behavior: 'smooth' });
                  }, 300);
                }}
                className="px-10 py-4 border-2 border-earth-900 text-earth-900 rounded-full font-bold text-sm hover:bg-earth-900 hover:text-white transition-all duration-300 active:scale-95"
              >
                Ürünleri Keşfet
              </button>
            </div>
          ) : (
            <div className="space-y-10 pb-10">
              {/* Free Shipping Progress */}
              <div className="bg-white p-6 rounded-[2rem] border border-earth-100 shadow-sm space-y-5">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-earth-400">Teslimat</p>
                    <div className="flex items-center gap-2">
                      <Truck size={18} className="text-nature-600" />
                      <span className="text-sm font-bold text-earth-900">Yurt İçi Kargo</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {isFreeShipping ? (
                      <span className="text-xs font-bold text-nature-600 bg-nature-50 px-3 py-1.5 rounded-full">
                        Kargo Ücretsiz
                      </span>
                    ) : (
                      <p className="text-xs font-bold text-earth-900">
                        ₺{remainingForFreeShipping.toFixed(0)} <span className="text-earth-400 font-normal">daha</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="h-1.5 bg-earth-50 rounded-full overflow-hidden border border-earth-100/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                      className="h-full bg-nature-500 rounded-full"
                    />
                  </div>
                  {!isFreeShipping && (
                    <p className="text-[10px] text-earth-400 font-medium text-center italic">
                      3000 TL üzeri alışverişlerinizde kargo bizden hediye!
                    </p>
                  )}
                </div>
              </div>

              {/* Item List */}
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id} 
                      className="flex gap-6 group relative"
                    >
                      <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 bg-white border border-earth-100 shadow-sm group-hover:shadow-md transition-all duration-500 p-2">
                        <img 
                          src={item.images[0]} 
                          alt={item.name} 
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-base text-earth-900 leading-tight pr-6">{item.name}</h3>
                            {item.price > 0 && (
                              <button 
                                onClick={() => {
                                  // GTM: Remove from Cart
                                  if (window.dataLayer) {
                                    window.dataLayer.push({
                                      event: 'remove_from_cart',
                                      ecommerce: {
                                        items: [{
                                          item_name: item.name,
                                          item_id: item.id,
                                          price: item.price,
                                          quantity: item.quantity
                                        }]
                                      }
                                    });
                                  }
                                  onRemove(item.id);
                                }} 
                                className="absolute top-0 right-0 text-earth-200 hover:text-red-400 transition-colors p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-earth-400">{item.unit}</p>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center bg-white rounded-full border border-earth-100 p-1 shadow-sm">
                            <button 
                              onClick={() => item.price > 0 && onUpdateQuantity(item.id, -1)}
                              disabled={item.price === 0}
                              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${item.price === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-earth-50 text-earth-400 hover:text-earth-900'}`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-earth-900">{item.quantity}</span>
                            <button 
                              onClick={() => item.price > 0 && onUpdateQuantity(item.id, 1)}
                              disabled={item.price === 0}
                              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${item.price === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-earth-50 text-earth-400 hover:text-earth-900'}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-bold text-base text-nature-700">₺{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary Section (Now inside scrollable area) */}
              {items.length > 0 && checkoutStatus === 'idle' && (
                <div className="pt-10 space-y-8 border-t border-earth-100">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-earth-400 font-medium">Ara Toplam</span>
                      <span className="text-earth-900 font-bold tracking-tight">₺{total.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-earth-400 font-medium">Kargo Ücreti</span>
                      <span className={isFreeShipping ? "text-nature-600 font-bold" : "text-earth-900 font-bold"}>
                        {isFreeShipping ? 'Ücretsiz' : `₺${SHIPPING_FEE.toFixed(0)}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-earth-100">
                      <div className="space-y-0.5">
                        <span className="text-xl serif text-earth-900 block">Toplam Tutar</span>
                        <span className="text-[10px] text-earth-400 uppercase tracking-widest font-bold">KDV Dahil</span>
                      </div>
                      <span className="text-3xl font-bold text-nature-700 tracking-tighter">₺{(total + shippingCost).toFixed(0)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {!isMeetingMinAmount && items.length > 0 && (
                      <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-center">
                        <p className="text-xs text-orange-700 font-medium leading-relaxed">
                          Minimum sipariş tutarı kargo hariç <span className="font-bold">600 TL</span>'dir. 
                          Devam edebilmek için <span className="font-bold">₺{(MIN_ORDER_AMOUNT - total).toFixed(0)}</span> daha ürün eklemelisiniz.
                        </p>
                      </div>
                    )}
                    {!hasPaidItems && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center">
                        <p className="text-xs text-red-600 font-medium">
                          Hediye ürün alabilmek için sepetinizde en az bir ücretli ürün bulunmalıdır.
                        </p>
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        if (hasPaidItems && isMeetingMinAmount) {
                          // GTM: Begin Checkout
                          if (window.dataLayer) {
                            window.dataLayer.push({
                              event: 'begin_checkout',
                              ecommerce: {
                                value: total,
                                currency: 'TL',
                                items: items.map(item => ({
                                  item_name: item.name,
                                  item_id: item.id,
                                  price: item.price,
                                  quantity: item.quantity
                                }))
                              }
                            });
                          }
                          onCheckout();
                        } else {
                          onClose();
                          setTimeout(() => {
                            document.getElementById('urunler')?.scrollIntoView({ behavior: 'smooth' });
                          }, 300);
                        }
                      }}
                      disabled={items.length > 0 && (!hasPaidItems || !isMeetingMinAmount)}
                      className={`w-full flex items-center justify-between px-8 py-5 rounded-full font-bold transition-all shadow-2xl active:scale-[0.98] group ${(hasPaidItems && isMeetingMinAmount) ? 'bg-earth-900 text-white hover:bg-earth-800 hover:shadow-nature-900/20' : 'bg-earth-200 text-earth-500 cursor-not-allowed'}`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard size={20} className={(hasPaidItems && isMeetingMinAmount) ? "text-nature-400" : "text-earth-400"} />
                        <span className="text-base">{(hasPaidItems && isMeetingMinAmount) ? 'Ödemeye Geç' : (isMeetingMinAmount ? 'Ürün Ekleyin' : 'Min. Tutara Ulaşın')}</span>
                      </div>
                      <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                    </button>
                    
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-[10px] text-earth-400 uppercase tracking-widest font-bold">
                          <Lock size={12} className="text-nature-500" />
                          SSL Güvenli
                        </div>
                        <div className="w-1 h-1 bg-earth-200 rounded-full" />
                        <div className="flex items-center gap-1.5 text-[10px] text-earth-400 uppercase tracking-widest font-bold">
                          <ShieldCheck size={12} className="text-nature-500" />
                          Orijinal Hasat
                        </div>
                      </div>
                      <p className="text-[9px] text-earth-300 text-center leading-relaxed">
                        Siparişiniz onaylandıktan sonra 24 saat içerisinde kargoya verilir.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};
