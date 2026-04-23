import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Send, ShoppingCart, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../constants';

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product, onAddToCart }) => {
  // Generate reviews based on product ID to make them consistent but different for each product
  const getInitialReviews = () => {
    const reviewPool = [
      { user: 'Ahmet Y.', rating: 5, comment: 'Harika bir lezzet, tam beklediğim gibi.', date: '2024-03-20' },
      { user: 'Fatma K.', rating: 4, comment: 'Çok taze ve doğal. Tavsiye ederim.', date: '2024-03-18' },
      { user: 'Mehmet S.', rating: 5, comment: 'Hızlı kargo ve özenli paketleme için teşekkürler.', date: '2024-03-15' },
      { user: 'Zeynep A.', rating: 5, comment: 'Çocukluğumdaki o gerçek tadı buldum sonunda.', date: '2024-03-12' },
      { user: 'Can B.', rating: 4, comment: 'Kalitesi her halinden belli oluyor, çok memnun kaldık.', date: '2024-03-10' },
      { user: 'Ayşe G.', rating: 5, comment: 'Sofralarımızın vazgeçilmezi oldu, herkese tavsiye ederim.', date: '2024-03-08' },
    ];

    // Use product.id to determine how many reviews to show (3 to 6)
    const seed = parseInt(product.id) || 0;
    const count = (seed % 4) + 3; // 3, 4, 5, or 6
    
    return reviewPool.slice(0, count).map((r, i) => ({
      ...r,
      id: `${product.id}-${i}`
    }));
  };

  const [reviews, setReviews] = useState<Review[]>(getInitialReviews());
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'howToCook' | 'reviews'>('description');

  // Reset reviews when product changes
  React.useEffect(() => {
    setReviews(getInitialReviews());
    setCurrentImageIndex(0);
    setActiveTab('description');
  }, [product.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const review: Review = {
        id: Date.now().toString(),
        user: 'Misafir Kullanıcı',
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0],
      };
      setReviews([review, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-earth-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[90vh]"
          >
            {/* Close Button Mobile */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-full text-earth-900 md:hidden"
            >
              <X size={20} />
            </button>

            {/* Left Side: Images */}
            <div className="w-full md:w-1/2 relative bg-earth-50 flex flex-col p-8 md:p-12">
              <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentImageIndex}
                    src={product.images[currentImageIndex]} 
                    alt={product.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                  <button 
                    onClick={prevImage}
                    className="p-3 bg-white/90 backdrop-blur-md rounded-full text-earth-900 hover:bg-white transition-all shadow-lg pointer-events-auto"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="p-3 bg-white/90 backdrop-blur-md rounded-full text-earth-900 hover:bg-white transition-all shadow-lg pointer-events-auto"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="p-4 flex gap-2 overflow-x-auto bg-white/50 backdrop-blur-sm border-t border-earth-100">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all p-1 bg-white ${i === currentImageIndex ? 'border-nature-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-1/2 flex flex-col bg-white">
              <div className="p-8 md:p-12 flex-1 overflow-y-auto space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-nature-100 text-nature-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-nature-200">
                      <Leaf size={12} /> %100 DOĞAL
                    </span>
                    <span className="text-earth-400 text-xs font-bold uppercase tracking-widest">{product.category}</span>
                  </div>
                  <h2 className="text-4xl serif text-earth-900 leading-tight">{product.name}</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-earth-900">₺{product.price}</span>
                      <span className="text-earth-400 font-medium">{product.unit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < 4 ? "#f59e0b" : "none"} className={i < 4 ? "text-yellow-500" : "text-earth-200"} />
                      ))}
                      <span className="text-sm text-earth-400 font-bold ml-2">({reviews.length} Değerlendirme)</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-earth-100 overflow-x-auto">
                  <button 
                    onClick={() => setActiveTab('description')}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'description' ? 'border-nature-600 text-nature-700' : 'border-transparent text-earth-400 hover:text-earth-600'}`}
                  >
                    Ürün Bilgisi
                  </button>
                  {product.howToCook && (
                    <button 
                      onClick={() => setActiveTab('howToCook')}
                      className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'howToCook' ? 'border-nature-600 text-nature-700' : 'border-transparent text-earth-400 hover:text-earth-600'}`}
                    >
                      Nasıl Pişirilir?
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'reviews' ? 'border-nature-600 text-nature-700' : 'border-transparent text-earth-400 hover:text-earth-600'}`}
                  >
                    Yorumlar ({reviews.length})
                  </button>
                </div>

                <div className="min-h-[300px]">
                  {activeTab === 'description' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="prose prose-earth max-w-none">
                        {product.description.split('\n').map((paragraph, i) => (
                          <p key={i} className="text-earth-600 leading-relaxed text-base">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-earth-50 rounded-2xl border border-earth-100">
                          <h4 className="text-xs font-bold text-earth-400 uppercase tracking-widest mb-1">Saklama Koşulu</h4>
                          <p className="text-sm text-earth-800 font-medium">Serin ve kuru yerde muhafaza ediniz.</p>
                        </div>
                        <div className="p-4 bg-earth-50 rounded-2xl border border-earth-100">
                          <h4 className="text-xs font-bold text-earth-400 uppercase tracking-widest mb-1">Menşei</h4>
                          <p className="text-sm text-earth-800 font-medium">Türkiye (Ankara)</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'howToCook' && product.howToCook && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="prose prose-earth max-w-none">
                        {product.howToCook.split('\n').map((paragraph, i) => (
                          <p key={i} className="text-earth-600 leading-relaxed text-base">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      {/* Review Form */}
                      <form onSubmit={handleSubmit} className="space-y-4 bg-nature-50 p-6 rounded-3xl border border-nature-100">
                        <h3 className="font-bold text-earth-900">Deneyiminizi Paylaşın</h3>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="transition-transform active:scale-90"
                            >
                              <Star 
                                size={24} 
                                fill={star <= newReview.rating ? "#f59e0b" : "none"} 
                                className={star <= newReview.rating ? "text-yellow-500" : "text-earth-300"}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Ürün hakkındaki görüşleriniz..."
                          className="w-full p-4 bg-white border border-earth-200 rounded-2xl focus:ring-2 focus:ring-nature-500 outline-none min-h-[120px] text-sm"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-4 bg-nature-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-nature-700 transition-all disabled:opacity-50 shadow-lg shadow-nature-200"
                        >
                          {isSubmitting ? 'Gönderiliyor...' : (
                            <>
                              <Send size={18} />
                              Yorumu Yayınla
                            </>
                          )}
                        </button>
                      </form>

                      {/* Reviews List */}
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="space-y-3 pb-6 border-b border-earth-100 last:border-0">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-earth-900">{review.user}</h4>
                              <span className="text-xs text-earth-400">{review.date}</span>
                            </div>
                            <div className="flex text-yellow-500 gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                            <p className="text-sm text-earth-600 leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer Action */}
              <div className="p-8 border-t border-earth-100 bg-earth-50 flex items-center gap-4">
                <button 
                  onClick={() => onAddToCart(product)}
                  className="flex-1 py-5 bg-earth-900 text-white rounded-2xl font-bold text-lg hover:bg-nature-600 transition-all duration-500 shadow-xl flex items-center justify-center gap-3 group"
                >
                  <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
                  Sepete Ekle
                </button>
                <button 
                  onClick={onClose}
                  className="hidden md:flex p-5 bg-white border border-earth-200 text-earth-600 rounded-2xl hover:bg-earth-100 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
