import React from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const LegalModal: React.FC<LegalModalProps> = ({ onClose, title, content }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <div
        className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="px-8 py-6 flex items-center justify-between border-b border-earth-100 bg-white sticky top-0 z-10">
          <h2 className="text-2xl serif text-earth-900">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-earth-50 rounded-full transition-colors text-earth-400 hover:text-earth-900"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar bg-[#FCFBF7]">
          <div className="prose prose-earth max-w-none">
            {content.split('\n').map((line, i) => {
              if (line.trim() === '---') {
                return <hr key={i} className="my-8 border-earth-100" />;
              }
              if (line.trim().startsWith('•')) {
                return <li key={i} className="text-earth-700 mb-2 list-none flex items-start gap-2">
                  <span className="text-nature-500 mt-1">•</span>
                  {line.trim().substring(1).trim()}
                </li>;
              }
              if (line.trim() === '') return <br key={i} />;
              
              return (
                <p key={i} className="text-earth-700 leading-relaxed mb-4">
                  {line.trim()}
                </p>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-earth-100 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-earth-900 text-white rounded-xl font-bold hover:bg-nature-600 transition-all"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
