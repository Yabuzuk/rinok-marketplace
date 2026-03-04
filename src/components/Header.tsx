import React, { useState } from 'react';
import { ShoppingCart, User, Search, MapPin, Users } from 'lucide-react';
import { User as UserType } from '../types';
import JoinGroupOrderModal from './JoinGroupOrderModal';

interface HeaderProps {
  user: UserType | null;
  cartItemsCount: number;
  onAuthClick: () => void;
  onCartClick: () => void;
  onLogin: (userType: 'customer' | 'seller' | 'admin', userData?: any) => void;
  onShowAuthModal: () => void;
  onDashboardClick: () => void;
  onHomeClick: () => void;
  products?: any[];
  onProductSelect?: (product: any) => void;
  onJoinGroupOrder?: (code: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, cartItemsCount, onAuthClick, onCartClick, onLogin, onShowAuthModal, onDashboardClick, onHomeClick, products = [], onProductSelect, onJoinGroupOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              onClick={onHomeClick}
              className="w-8 h-8 rounded-lg cursor-pointer hover:scale-105 transition-transform overflow-hidden"
            >
              <img 
                src="/icon-192x192.png" 
                alt="Азия-Сибирь" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">Азия-Сибирь</span>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'customer' && onJoinGroupOrder && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-1.5"
              >
                <Users size={14} />
                <span>Присоединиться</span>
              </button>
            )}
            {user ? (
              <button 
                onClick={onDashboardClick}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
              >
                {user.name}
              </button>
            ) : (
              <button 
                onClick={onShowAuthModal}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </header>
      
      <JoinGroupOrderModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={(code) => {
          if (onJoinGroupOrder) {
            onJoinGroupOrder(code);
          }
          setShowJoinModal(false);
        }}
      />
    </>
  );
};

export default Header;