import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Leaf, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../constants';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAdd = () => {
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-earth-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-earth-50 p-6">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImageIndex}
            src={product.images[currentImageIndex]} 
            alt={`${product.name} - ${currentImageIndex + 1}`} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
          <button 
            type="button"
            onClick={prevImage}
            className="p-2 bg-white/90 backdrop-blur-md rounded-full text-earth-900 hover:bg-white hover:scale-110 transition-all shadow-md cursor-pointer pointer-events-auto"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            type="button"
            onClick={nextImage}
            className="p-2 bg-white/90 backdrop-blur-md rounded-full text-earth-900 hover:bg-white hover:scale-110 transition-all shadow-md cursor-pointer pointer-events-auto"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {product.images.map((_, i) => (
            <div 
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
            />
          ))}
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          <span className="bg-white/90 backdrop-blur-md text-nature-700 text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-nature-100">
            <Leaf size={10} className="text-nature-500" /> %100 DOĞAL
          </span>
          {product.price > 100 && (
            <span className="bg-earth-900/90 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              PREMIUM
            </span>
          )}
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-earth-900/0 group-hover:bg-earth-900/5 transition-colors duration-500 pointer-events-none" />

        <AnimatePresence>
          {isAdded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-nature-600/90 backdrop-blur-md flex items-center justify-center z-30"
            >
              <div className="text-white text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ShoppingCart size={20} />
                </div>
                <p className="text-sm font-bold tracking-tight">Sepete Eklendi</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-nature-600 font-bold uppercase tracking-widest mb-1">{product.category}</p>
            <h3 className="text-lg serif text-earth-900 leading-tight truncate group-hover:text-nature-700 transition-colors">{product.name}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-earth-900">₺{product.price}</p>
            <p className="text-[10px] text-earth-400 font-medium">{product.unit}</p>
          </div>
        </div>
        
        <p className="text-earth-500 text-[12px] line-clamp-2 leading-relaxed font-medium min-h-[36px]">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-earth-50">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={10} 
                  fill={i < 4 ? "#f59e0b" : "none"} 
                  className={i < 4 ? "text-yellow-500" : "text-earth-200"} 
                />
              ))}
            </div>
            <span className="text-[10px] text-earth-400 font-bold tracking-tighter">({((parseInt(product.id) || 0) % 4) + 3} Yorum)</span>
          </div>
          <button 
            onClick={() => {
              // GTM: Select Item & View Item Event
              if (window.dataLayer) {
                window.dataLayer.push({ ecommerce: null });
                window.dataLayer.push({
                  event: 'select_item',
                  ecommerce: {
                    item_list_id: 'main_products',
                    item_list_name: 'Ana Ürün Listesi',
                    items: [{
                      item_id: product.id,
                      item_name: product.name,
                      price: product.price,
                      item_category: product.category
                    }]
                  }
                });
                window.dataLayer.push({
                  event: 'view_item',
                  ecommerce: {
                    currency: 'TL',
                    value: product.price,
                    items: [{
                      item_id: product.id,
                      item_name: product.name,
                      price: product.price,
                      item_category: product.category
                    }]
                  }
                });
              }
              setIsDetailModalOpen(true);
            }}
            className="text-[10px] text-earth-500 font-bold hover:text-nature-600 transition-colors flex items-center gap-1"
          >
            Detaylar
          </button>
        </div>

        <button 
          onClick={handleAdd}
          className="w-full mt-1 flex items-center justify-center gap-2 py-3 bg-earth-900 text-white rounded-xl font-bold text-xs hover:bg-nature-600 transition-all duration-500 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <ShoppingCart size={14} />
          Sepete Ekle
        </button>
      </div>

      <ProductDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        product={product}
        onAddToCart={onAddToCart}
      />
    </motion.div>
  );
};
