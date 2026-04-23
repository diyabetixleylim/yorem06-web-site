import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Instagram, 
  Facebook, 
  Twitter, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight,
  ArrowRight,
  Leaf,
  Truck,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { PRODUCTS, Product, CartItem, Reward } from './constants';
import { ProductCard } from './components/ProductCard';
import { SpinWheel } from './components/SpinWheel';
import { Cart } from './components/Cart';
import { AuthModal } from './components/AuthModal';
import { Checkout } from './components/Checkout';
import { LegalModal } from './components/LegalModal';
import { LEGAL_CONTENT } from './legalContent';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('yorem06_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSpinWheelOpen, setIsSpinWheelOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: keyof typeof LEGAL_CONTENT | null }>({
    isOpen: false,
    type: null
  });

  const triggerSpinWheel = async (userOverride?: { email: string }) => {
    // Check if user has already played
    const currentUser = userOverride || user;
    const userEmail = currentUser?.email || 'guest';
    
    // 1. Permanent check for registered users via server
    if (currentUser) {
      try {
        const response = await fetch(`/api/user/spin-status?email=${encodeURIComponent(currentUser.email)}`);
        const data = await response.json();
        if (data.hasSpun) return;
      } catch (err) {
        console.error('Error fetching spin status:', err);
      }
    }

    // 2. Browser-level check (fallback for guests or if server fails)
    const hasPlayed = localStorage.getItem(`yorem06_wheel_played_${userEmail}`);
    if (hasPlayed) return;

    const today = new Date().toLocaleDateString();
    const lastShown = localStorage.getItem('yorem06_wheel_last_shown');
    
    if (lastShown !== today) {
      setIsSpinWheelOpen(true);
      localStorage.setItem('yorem06_wheel_last_shown', today);
    }
  };

  useEffect(() => {
    // Open spin wheel after a short delay on page load if not shown today
    const timer = setTimeout(() => {
      triggerSpinWheel();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check for payment status from PayTR redirect
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');

    if (status === 'success') {
      const orderId = params.get('oid') || 'TR_' + Date.now();
      // Send order notification only now that payment is confirmed
      const pendingOrder = localStorage.getItem('yorem06_pending_order');
      if (pendingOrder) {
        try {
          const orderData = JSON.parse(pendingOrder);

          // GTM: Purchase Event (GA4 Schema)
          if (window.dataLayer) {
            window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object
            window.dataLayer.push({
              event: 'purchase',
              ecommerce: {
                transaction_id: orderId,
                value: parseFloat(orderData.total),
                currency: 'TL',
                items: orderData.orderDetails.map((item: any) => ({
                  item_id: item.id || 'N/A',
                  item_name: item.name,
                  price: parseFloat(item.price),
                  quantity: parseInt(item.quantity)
                }))
              }
            });
          }

          fetch('/api/order-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          }).catch(err => console.error('Delayed notification error:', err));
          
          localStorage.removeItem('yorem06_pending_order');
        } catch (err) {
          console.error('Error processing pending order:', err);
        }
      }

      setCartItems([]);
      localStorage.removeItem('yorem06_cart');
      setCheckoutStatus('success');
      // Remove params from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'fail') {
      alert('Ödeme sırasında bir hata oluştu veya işlem iptal edildi. Lütfen tekrar deneyin.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success'>('idle');
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success'>('idle');
  const [selectedDoc, setSelectedDoc] = useState<{ title: string; img: string } | null>(null);
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(() => {
    const saved = localStorage.getItem('yorem06_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('yorem06_user');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // GTM: Newsletter Signup
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'newsletter_signup'
      });
    }
    setNewsletterStatus('success');
    (e.target as HTMLFormElement).reset();
    setTimeout(() => setNewsletterStatus('idle'), 5000);
  };

  useEffect(() => {
    localStorage.setItem('yorem06_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product) => {
    // GTM: Add to Cart Event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          items: [{
            item_name: product.name,
            item_id: product.id,
            price: product.price,
            quantity: 1
          }]
        }
      });
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleWin = (reward: Reward) => {
    // GTM: Wheel Spin Event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'wheel_spin',
        reward_name: reward.label
      });
    }

    // Mark as played for this user
    const userEmail = user?.email || 'guest';
    localStorage.setItem(`yorem06_wheel_played_${userEmail}`, 'true');

    // Permanent mark for registered users
    if (user) {
      fetch('/api/user/mark-spun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      }).catch(err => console.error('Error marking spun on server:', err));
    }

    if (reward.productId) {
      const product = PRODUCTS.find(p => p.id === reward.productId);
      if (product) {
        const giftProduct = {
          ...product,
          name: `🎁 HEDİYE: ${product.name}`,
          price: 0, // Gift is free
          id: `gift-${product.id}-${Date.now()}` // Unique ID for the gift
        };
        
        setCartItems(prev => [...prev, { ...giftProduct, quantity: reward.quantity || 1 }]);
        setTimeout(() => setIsCartOpen(true), 1000);
      }
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const completeCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutStatus('success');
    setCartItems([]);
    setIsCartOpen(true); // Open cart to show success message
    setTimeout(() => {
      setCheckoutStatus('idle');
      setIsCartOpen(false);
    }, 5000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // GTM: Contact Form Submission
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'contact_form_submit'
      });
    }
    setContactStatus('sending');
    setTimeout(() => {
      setContactStatus('success');
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setContactStatus('idle'), 5000);
    }, 1500);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        // Prevent modifying quantity for gift items (price 0)
        if (item.price === 0) return item;
        
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { name: 'Anasayfa', id: 'anasayfa' },
    { name: 'Ürünler', id: 'urunler' },
    { name: 'Hikayemiz', id: 'hikayemiz' },
    { name: 'Belgelerimiz', id: 'belgelerimiz' },
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-nature-200 selection:text-nature-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-earth-100/80 backdrop-blur-md border-b border-earth-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 hover:bg-earth-200 rounded-full transition-colors">
              <Menu size={24} />
            </button>
            <a href="#" className="text-3xl serif font-bold tracking-tight text-earth-900">Yörem<span className="text-nature-600">06</span></a>
            
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <a 
                  key={item.id} 
                  href={`#${item.id}`}
                  className="text-sm font-bold uppercase tracking-widest text-earth-700 hover:text-nature-600 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-white border border-earth-200 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <ShoppingCart size={20} className="text-earth-800 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-nature-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-bold text-earth-400 uppercase tracking-widest">Hoş Geldiniz</span>
                  <span className="text-sm font-bold text-earth-900">{user.fullName}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-100"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:block px-6 py-3 bg-earth-800 text-white rounded-2xl font-bold text-sm hover:bg-earth-900 transition-all shadow-lg hover:shadow-xl"
              >
                Giriş Yap
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 h-full w-80 bg-earth-50 z-50 p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-2xl serif font-bold">Yörem06</span>
                <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
              </div>
              <div className="flex flex-col gap-6">
                {navItems.map((item) => (
                  <a 
                    key={item.id} 
                    href={`#${item.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-xl serif hover:text-nature-600 transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-earth-200 pt-20" id="anasayfa">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&q=80&w=1920" 
              alt="Wheat Field" 
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-earth-100/90 via-earth-100/40 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-nature-100 text-nature-800 rounded-full text-xs font-bold tracking-widest uppercase border border-nature-200">
                <Leaf size={14} /> %100 DOĞAL & KATKISIZ
              </div>
              <h1 className="text-7xl md:text-8xl serif leading-[1.1] text-earth-900">
                Toprağın <br /> <span className="italic text-nature-700">Bereketini</span> <br /> Sofranıza Getiriyoruz
              </h1>
              <p className="text-xl text-earth-700 leading-relaxed max-w-lg">
                Ankara'nın bereketli topraklarından, geleneksel yöntemlerle üretilen en taze ve doğal köy ürünleri Yörem06 güvencesiyle kapınızda.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <a href="#ürünler" className="px-10 py-5 bg-earth-800 text-white rounded-2xl font-bold text-lg hover:bg-earth-900 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 group">
                  Hemen Alışverişe Başla
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#hikayemiz" className="px-10 py-5 bg-white text-earth-800 border-2 border-earth-800 rounded-2xl font-bold text-lg hover:bg-earth-50 transition-all flex items-center gap-2">
                  Hikayemizi Dinle
                </a>
              </div>
            </motion.div>
          </div>

          {/* Floating Badges */}
          <div className="absolute bottom-12 right-12 hidden xl:flex flex-col gap-4">
            {[
              { icon: <Truck />, text: "Hızlı Teslimat" },
              { icon: <ShieldCheck />, text: "Güvenli Ödeme" },
              { icon: <Heart />, text: "Yerli Üretim" }
            ].map((badge, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/40"
              >
                <div className="w-10 h-10 bg-nature-100 text-nature-600 rounded-full flex items-center justify-center">
                  {badge.icon}
                </div>
                <span className="font-bold text-earth-800">{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Products Section */}
        <section className="py-32 bg-earth-50 natural-texture" id="urunler">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div className="space-y-4">
                <h2 className="text-6xl serif text-earth-900">Doğal Ürünlerimiz</h2>
                <p className="text-lg text-earth-600 max-w-xl leading-relaxed">
                  Her biri özenle seçilmiş, hiçbir katkı maddesi içermeyen, tarladan sofranıza uzanan lezzet yolculuğu.
                </p>
              </div>
            </div>

            <motion.div 
              layout
              onViewportEnter={() => {
                if (window.dataLayer) {
                  window.dataLayer.push({ ecommerce: null });
                  window.dataLayer.push({
                    event: 'view_item_list',
                    ecommerce: {
                      item_list_id: 'main_products',
                      item_list_name: 'Ana Ürün Listesi',
                      items: PRODUCTS.map((product, index) => ({
                        item_id: product.id,
                        item_name: product.name,
                        index: index + 1,
                        price: product.price,
                        item_category: product.category
                      }))
                    }
                  });
                }
              }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              <AnimatePresence mode='popLayout'>
                {PRODUCTS.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={addToCart} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-32 bg-earth-900 text-earth-100 relative overflow-hidden" id="hikayemiz">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none hidden lg:block">
            <img 
              src="https://images.unsplash.com/photo-1501430654243-c93f86792685?auto=format&fit=crop&q=80&w=1200" 
              alt="Wheat Field" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-earth-900"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h2 className="text-7xl serif leading-tight">Bizim <br /> <span className="italic text-nature-400">Hikayemiz</span></h2>
                  <div className="w-24 h-1 bg-nature-500"></div>
                </div>

                <div className="space-y-8 text-lg text-earth-200 leading-relaxed font-light max-w-xl">
                  <div className="space-y-4">
                    <p className="text-2xl serif text-white italic">"Bazı hikâyeler bir şirket kurmakla başlamaz. Bir sözle başlar."</p>
                    <p>Bizim hikâyemiz de öyle başladı.</p>
                  </div>

                  <p>
                    Yıllar önce mutfaklarımızda pişen yemeklerin kokusu başkaydı. 
                    Pilavın kokusu ayrıydı, bulgurun tadı ayrıydı. 
                    Nohut, fasulye, mercimek… hepsinin kendine has bir lezzeti vardı.
                  </p>

                  <p>
                    Çünkü o zamanlar gıda sadece bir ürün değildi. Toprağın gerçek haliydi. 
                    Zamanla raflar değişti. Tohumlar değişti. Lezzetler değişti. 
                    Ama biz bir şeyi değiştirmemeye karar verdik.
                  </p>

                  <p>
                    Toprağın bize emanet ettiği o eski tohumları korumaya… 
                    Gerçek gıdanın nasıl olması gerektiğini unutturmamaya… 
                    İşte <span className="text-nature-400 font-bold">Yörem06</span> böyle doğdu.
                  </p>

                  <p>
                    Bugün pirincimiz, bulgurumuz, nohutumuz, fasulyemiz, mercimeğimiz ve unumuz var. 
                    Ama aslında hepsinin ortak bir tarafı var: Hepsi toprağın bize verdiği haliyle. 
                    Katkısız. Doğal. Olduğu gibi.
                  </p>

                  <p>
                    Biz rafları doldurmak için ürün üretmiyoruz. 
                    Biz sofralara gerçek lezzeti yeniden hatırlatmaya çalışıyoruz.
                  </p>

                  <div className="p-8 bg-earth-800/50 rounded-3xl border border-earth-700 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-nature-500/30">
                        <img 
                          src="https://i.imgur.com/48Jm2nA.jpeg" 
                          alt="Çömlekçatlatan Pirinç" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl serif text-nature-400">Çömlekçatlatan Pirinç</h3>
                        <p className="text-sm leading-relaxed">
                          Bu hikâyenin kalbi... Adını eski usul pilavdan alır. 
                          Çömlekte piştiğinde öyle kabarır, öyle bereketlenir ki 
                          “Bu pirinç çömleği bile çatlatır.” derler. 
                        </p>
                      </div>
                    </div>
                    <p className="text-sm italic text-earth-300">
                      Biz bu adı bir marka olsun diye değil, bir geleneği yaşatmak için taşıyoruz.
                    </p>
                  </div>

                  <p>
                    Bugün binlerce sofraya ulaşıyorsak bu bizim başarımız değil. 
                    Bu; toprağın, emeğin ve bize güvenen insanların hikâyesidir.
                  </p>

                  <div className="pt-8 border-t border-earth-800">
                    <p className="text-xl serif italic text-white">
                      “İşte gerçek gıdanın tadı bu.”
                    </p>
                    <p className="text-sm text-earth-400 mt-2">
                      Bir sofrada bu sözü duyduğumuz an anlarız ki doğru yoldayız.
                    </p>
                  </div>

                  <div className="pt-10 flex items-center gap-6">
                    <div>
                      <p className="text-2xl serif text-white">Emrah Eren</p>
                      <p className="text-sm font-bold uppercase tracking-widest text-nature-500">Yörem06 Kurucusu</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative hidden lg:block"
              >
                <div className="aspect-[3/4] rounded-[60px] overflow-hidden border-8 border-earth-800 shadow-2xl relative group">
                  <img 
                    src="https://i.imgur.com/B3HEJMx.jpeg" 
                    alt="Çömlekçatlatan Pirinç Hasadı" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-earth-900/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-12 left-12 right-12">
                    <p className="text-4xl serif text-white leading-tight">
                      Geleneksel <br /> <span className="text-nature-400">Hasat</span> Ruhu
                    </p>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-nature-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-nature-500/20 rounded-full blur-3xl"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section className="py-32 bg-[#FBFBF9]" id="belgelerimiz">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24 space-y-4">
              <span className="text-nature-600 font-bold tracking-[0.2em] uppercase text-sm">Kalite Güvencemiz</span>
              <h2 className="text-5xl md:text-6xl serif text-earth-900">Belgelerimiz & Sertifikalarımız</h2>
              <div className="w-24 h-1 bg-nature-500 mx-auto rounded-full opacity-30 mt-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
              {[
                { title: 'Marka Tescil Belgesi', desc: 'Türk Patent ve Marka Kurumu', img: 'https://i.imgur.com/J9QTLmf.jpeg' },
                { title: 'Gıda İşletme Kayıt Belgesi', desc: 'Tarım ve Orman Bakanlığı', img: 'https://i.imgur.com/cKNpZEq.jpeg' },
                { title: 'Analiz Raporu', desc: 'Kalite ve Hijyen Raporu', img: 'https://i.imgur.com/w6KoBRc.jpeg' }
              ].map((doc, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                  onClick={() => setSelectedDoc(doc)}
                  className="cursor-pointer group"
                >
                  <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 group-hover:-translate-y-4 group-hover:shadow-[0_45px_80px_-20px_rgba(45,35,25,0.25)]">
                    {/* Artistic Frame */}
                    <div className="absolute inset-0 border-[16px] border-white z-10 transition-all duration-700 group-hover:border-[12px]"></div>
                    <div className="absolute inset-0 border border-earth-100 z-10"></div>
                    
                    <img 
                      src={doc.img} 
                      alt={doc.title} 
                      className="w-full h-full object-cover grayscale-[0.2] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0" 
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-nature-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-50 group-hover:scale-100 transition-transform duration-500">
                        <ArrowRight size={32} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center space-y-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <h4 className="text-2xl serif text-earth-900">{doc.title}</h4>
                    <p className="text-sm text-earth-500 font-medium tracking-wide uppercase italic">{doc.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-earth-100 border-t border-earth-200 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <span className="text-3xl serif font-bold">Yörem06</span>
              <p className="text-earth-600 leading-relaxed">
                Doğanın kalbinden sofranıza, en taze ve katkısız köy ürünlerini ulaştırıyoruz. Sağlıklı nesiller için doğal beslenmeyi destekliyoruz.
              </p>
              <div className="space-y-4">
                <a href="mailto:info@yorem06.com" className="flex items-center gap-3 text-earth-600 hover:text-nature-600 transition-colors group">
                  <Mail size={18} className="text-nature-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-sm">info@yorem06.com</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-earth-900 uppercase tracking-widest mb-8">Hızlı Linkler</h4>
              <ul className="space-y-4 text-earth-600">
                {navItems.filter(item => item.id !== 'anasayfa').map(item => (
                  <li key={item.id}><a href={`#${item.id}`} className="hover:text-nature-600 transition-colors">{item.name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-earth-900 uppercase tracking-widest mb-8">Kategoriler</h4>
              <ul className="space-y-4 text-earth-600">
                {['Bakliyat', 'Unlar', 'Kuruyemiş', 'Atıştırmalık'].map(item => (
                  <li key={item}><a href="#urunler" className="hover:text-nature-600 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-earth-900 uppercase tracking-widest mb-8">Bülten</h4>
              <p className="text-sm text-earth-600 mb-6">Yeni ürünler ve kampanyalardan haberdar olun.</p>
              {newsletterStatus === 'success' ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-nature-600 font-bold text-sm"
                >
                  Kaydınız başarıyla oluşturuldu!
                </motion.p>
              ) : (
                <form className="flex gap-2" onSubmit={handleNewsletterSubmit}>
                  <input required type="email" className="flex-1 px-4 py-3 bg-white border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nature-500" placeholder="E-posta" />
                  <button type="submit" className="p-3 bg-earth-800 text-white rounded-xl hover:bg-earth-900 transition-all">
                    <ChevronRight size={20} />
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="pt-12 border-t border-earth-200 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-earth-500">
            <div className="flex flex-col gap-4">
              <p>© 2026 Yörem06. Tüm hakları saklıdır.</p>
              <div className="flex flex-wrap items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3 object-contain" referrerPolicy="no-referrer" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 object-contain" referrerPolicy="no-referrer" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Troy_logo.svg/1200px-Troy_logo.svg.png" alt="Troy" className="h-4 object-contain" referrerPolicy="no-referrer" />
                <div className="flex items-center gap-1 text-[#00A870] font-bold">
                  <ShieldCheck size={18} />
                  <span className="text-xs">SSL</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <button onClick={() => setLegalModal({ isOpen: true, type: 'distanceSales' })} className="hover:text-earth-900 transition-colors">Mesafeli Satış Sözleşmesi</button>
              <button onClick={() => setLegalModal({ isOpen: true, type: 'returnPolicy' })} className="hover:text-earth-900 transition-colors">İade ve İptal Politikası</button>
              <button onClick={() => setLegalModal({ isOpen: true, type: 'kvkk' })} className="hover:text-earth-900 transition-colors">KVKK & Gizlilik</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      {legalModal.isOpen && (
        <LegalModal 
          isOpen={legalModal.isOpen}
          onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
          title={legalModal.type ? LEGAL_CONTENT[legalModal.type].title : ''}
          content={legalModal.type ? LEGAL_CONTENT[legalModal.type].content : ''}
        />
      )}

      {/* Cart Sidebar */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        checkoutStatus={checkoutStatus}
      />

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={(userData) => {
            setUser(userData);
            localStorage.setItem('yorem06_user', JSON.stringify(userData));
            // Trigger spin wheel on login
            setTimeout(() => triggerSpinWheel(userData), 500); 
          }}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <Checkout
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          onComplete={completeCheckout}
        />
      )}

      {/* Spin Wheel Modal */}
      <AnimatePresence>
        {isSpinWheelOpen && (
          <SpinWheel 
            onWin={handleWin} 
            onClose={() => setIsSpinWheelOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Document Lightbox */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDoc(null)}
            className="fixed inset-0 z-[100] bg-earth-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.button 
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
              onClick={() => setSelectedDoc(null)}
            >
              <X size={40} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full aspect-[3/4] bg-white rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedDoc.img} 
                alt={selectedDoc.title} 
                className="w-full h-full object-contain p-4 md:p-8" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent">
                <h3 className="text-3xl serif text-earth-900 text-center">{selectedDoc.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Instagram Button */}
      <a 
        href="https://www.instagram.com/yorem06?igsh=MXkwbTc1MHUyM3V2cA==" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group"
      >
        <Instagram size={32} />
        <span className="absolute right-full mr-4 px-4 py-2 bg-white text-earth-900 text-sm font-bold rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Bizi Takip Edin!
        </span>
      </a>

      {/* Scroll to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 left-8 z-40 w-12 h-12 bg-white/80 backdrop-blur-md border border-earth-200 text-earth-800 rounded-full flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 transition-all"
      >
        <ArrowRight size={24} className="-rotate-90" />
      </button>
    </div>
  );
}
