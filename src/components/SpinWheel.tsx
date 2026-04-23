import React, { useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { REWARDS, Reward } from '../constants';

interface SpinWheelProps {
  onWin: (reward: Reward) => void;
  onClose: () => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ onWin, onClose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Reward | null>(null);
  const controls = useAnimation();

  const spin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // Weighted random selection
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedIndex = 0;

    for (let i = 0; i < REWARDS.length; i++) {
      cumulativeProbability += REWARDS[i].probability;
      if (random <= cumulativeProbability) {
        selectedIndex = i;
        break;
      }
    }

    const segmentAngle = 360 / REWARDS.length;
    const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-10 full spins
    const centerAngle = selectedIndex * segmentAngle + segmentAngle / 2;
    const targetRotation = extraSpins * 360 + (360 - centerAngle);

    await controls.start({
      rotate: targetRotation,
      transition: { duration: 5, ease: [0.15, 0, 0.15, 1] }
    });

    setIsSpinning(false);
    const wonReward = REWARDS[selectedIndex];
    setResult(wonReward);
    onWin(wonReward);
  };

  const getPathData = (index: number, total: number) => {
    const startAngle = (index * 360) / total;
    const endAngle = ((index + 1) * 360) / total;
    
    const x1 = Math.cos((startAngle - 90) * (Math.PI / 180)) * 100;
    const y1 = Math.sin((startAngle - 90) * (Math.PI / 180)) * 100;
    const x2 = Math.cos((endAngle - 90) * (Math.PI / 180)) * 100;
    const y2 = Math.sin((endAngle - 90) * (Math.PI / 180)) * 100;
    
    return `M 0 0 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-earth-900/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: -100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col items-center justify-center py-12 md:py-16 px-6"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 hover:bg-earth-100 rounded-full transition-colors z-50"
        >
          <X size={24} className="text-earth-800" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl serif mb-4 text-nature-800">Şans Çarkı</h2>
          <p className="text-lg text-nature-700 max-w-md mx-auto">
            Yörem06'dan size küçük bir hediye! Çarkı çevirin, bugün şansınıza ne çıkacağını görün.
          </p>
        </div>

        <div className="relative w-64 h-64 md:w-96 md:h-96">
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-40">
            <div className="w-6 h-8 bg-earth-800 rounded-b-full shadow-lg relative flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-earth-800"></div>
            </div>
          </div>
          
          {/* Wheel Container */}
          <motion.div
            animate={controls}
            className="w-full h-full relative"
            style={{ transformOrigin: 'center' }}
          >
            <svg 
              viewBox="-105 -105 210 210" 
              className="w-full h-full drop-shadow-2xl"
            >
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                  <feOffset dx="0" dy="2" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer Border */}
              <circle cx="0" cy="0" r="102" fill="#241d17" />
              
              {REWARDS.map((reward, index) => {
                const angle = 360 / REWARDS.length;
                const textAngle = index * angle + angle / 2 - 90;
                const textX = Math.cos(textAngle * (Math.PI / 180)) * 65;
                const textY = Math.sin(textAngle * (Math.PI / 180)) * 65;

                return (
                  <g key={reward.id}>
                    <path
                      d={getPathData(index, REWARDS.length)}
                      fill={reward.color}
                      stroke="#241d17"
                      strokeWidth="1"
                    />
                    <g transform={`translate(${textX}, ${textY}) rotate(${textAngle + 90})`}>
                      <text
                        fill="white"
                        fontSize="6"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="select-none pointer-events-none"
                        style={{ fontSize: '5px' }}
                      >
                        {reward.label.split(' ').map((word, i) => (
                          <tspan 
                            key={i} 
                            x="0" 
                            dy={i === 0 ? 0 : 6}
                          >
                            {word}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Center Pin */}
              <circle cx="0" cy="0" r="15" fill="#f5f2ed" stroke="#241d17" strokeWidth="2" />
              <circle cx="0" cy="0" r="5" fill="#241d17" />
            </svg>
          </motion.div>

          {/* Spin Button */}
          <button
            onClick={spin}
            disabled={isSpinning || !!result}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-16 h-16 md:w-20 md:h-20 rounded-full bg-earth-800 text-white font-bold text-xs md:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-4 border-earth-100 ${isSpinning || !!result ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSpinning ? '...' : result ? '✓' : 'ÇEVİR'}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-nature-50 border-2 border-nature-500 rounded-2xl shadow-xl text-center w-full max-w-sm"
            >
              <h3 className="text-2xl serif text-nature-800 mb-2">Tebrikler! 🎉</h3>
              <p className="text-xl font-bold text-nature-600">{result.label} kazandınız!</p>
              <p className="text-sm text-nature-500 mt-2">
                {result.productId 
                  ? 'Hediye ürününüz sepetinize eklendi.' 
                  : `Kupon kodunuz: YOREM06-HEDIYE-${result.id}`}
              </p>
              <button 
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-nature-600 text-white rounded-xl font-bold text-sm hover:bg-nature-700 transition-colors"
              >
                Kapat
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
