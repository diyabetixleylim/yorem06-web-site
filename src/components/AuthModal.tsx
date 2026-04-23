import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { fullName: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgotPassword' | 'enterCode' | 'setNewPassword'>('login');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    code: ''
  });
  const [tempCode, setTempCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, fullName: formData.fullName, password: formData.password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // GTM: Sign Up Event
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'sign_up',
              method: 'email'
            });
          }
          await fetch('/api/registration-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, fullName: formData.fullName })
          });
          
          onSuccess(data.user);
          onClose();
        } else {
          setMessage({ type: 'error', text: data.message || 'Kayıt başarısız.' });
        }
      } else if (mode === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // GTM: Login Event
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'login',
              method: 'email'
            });
          }
          onSuccess(data.user);
          onClose();
        } else {
          setMessage({ type: 'error', text: data.message || 'Giriş başarısız.' });
        }
      } else if (mode === 'forgotPassword') {
        const email = formData.email.toLowerCase().trim();
        const users = JSON.parse(localStorage.getItem('yorem06_registered_users') || '[]');
        const user = users.find((u: any) => u.email.toLowerCase().trim() === email);
        
        if (!user) {
          setMessage({ type: 'error', text: 'Kullanıcı bulunamadı.' });
          setIsLoading(false);
          return;
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setTempCode(code);

        const response = await fetch('/api/auth/send-temp-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code })
        });
        
        if (response.ok) {
          setMessage({ type: 'success', text: 'Kod gönderildi.' });
          setMode('enterCode');
        } else {
          setMessage({ type: 'error', text: 'Kod gönderilemedi.' });
        }
      } else if (mode === 'enterCode') {
        if (formData.code.trim() === tempCode) {
          setMessage({ type: 'success', text: 'Kod doğrulandı.' });
          setMode('setNewPassword');
        } else {
          setMessage({ type: 'error', text: 'Hatalı kod.' });
        }
      } else if (mode === 'setNewPassword') {
        const email = formData.email.toLowerCase().trim();
        const users = JSON.parse(localStorage.getItem('yorem06_registered_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.email.toLowerCase().trim() === email);
        
        if (userIndex !== -1) {
          users[userIndex].password = formData.password;
          localStorage.setItem('yorem06_registered_users', JSON.stringify(users));
          setMessage({ type: 'success', text: 'Şifreniz güncellendi.' });
          setTimeout(() => {
            setMode('login');
            setMessage(null);
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setMessage({ type: 'error', text: 'Hata oluştu.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="relative p-8 md:p-12">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-earth-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          <div className="text-center mb-10">
            <h2 className="text-4xl serif mb-2">
              {mode === 'login' ? 'Tekrar Hoş Geldiniz' : 
               mode === 'register' ? 'Ailemize Katılın' : 
               mode === 'forgotPassword' ? 'Şifremi Unuttum' : 
               mode === 'enterCode' ? 'Kodu Giriniz' : 'Yeni Şifre'}
            </h2>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-2xl text-sm font-medium ${message.type === 'success' ? 'bg-nature-50 text-nature-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Adınız Soyadınız"
                  className="w-full pl-12 pr-6 py-4 bg-earth-50 border border-earth-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-nature-500"
                />
              </div>
            )}
            {(mode === 'login' || mode === 'register' || mode === 'forgotPassword') && (
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="E-posta Adresiniz"
                  className="w-full pl-12 pr-6 py-4 bg-earth-50 border border-earth-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-nature-500"
                />
              </div>
            )}

            {mode === 'enterCode' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" size={20} />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="6 Haneli Kod"
                  className="w-full pl-12 pr-6 py-4 bg-earth-50 border border-earth-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-nature-500 text-center tracking-[0.5em] font-bold text-xl"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'setNewPassword') && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" size={20} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Şifreniz"
                  className="w-full pl-12 pr-6 py-4 bg-earth-50 border border-earth-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-nature-500"
                />
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full py-5 bg-earth-800 text-white rounded-2xl font-bold text-lg hover:bg-earth-900 transition-all shadow-xl disabled:opacity-50"
            >
              {isLoading ? 'İşleniyor...' : 
               (mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Kayıt Ol' : 
                mode === 'forgotPassword' ? 'Kod Gönder' : mode === 'enterCode' ? 'Doğrula' : 'Şifreyi Güncelle')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-nature-600 font-bold hover:underline"
              >
                {mode === 'login' ? 'Yeni Kayıt Oluştur' : 'Giriş Yap'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
