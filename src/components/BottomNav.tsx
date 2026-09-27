import React from 'react';
import { Home, UtensilsCrossed, ShoppingBag, PackageCheck, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

interface NavItem {
  id: 'home' | 'menu' | 'cart' | 'tracking' | 'more';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cartCount, themeMode, orders, customerOrderIds, reopenWelcome } = useApp();
  const isLight = themeMode === 'light-orange';

  const activeOrdersCount = orders.filter(
    (o) => customerOrderIds?.includes(o.id) && o.status !== 'completed'
  ).length;

  const navItems: NavItem[] = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'cart', label: 'Panier', icon: ShoppingBag, badge: cartCount },
    { id: 'tracking', label: 'Suivi', icon: PackageCheck, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined },
    { id: 'more', label: 'Plus', icon: MoreHorizontal },
  ];

  const handleNavClick = (id: NavItem['id']) => {
    if (id === 'home') {
      reopenWelcome();
    }
    setActiveTab(id);
  };

  return (
    <nav className="fixed bottom-3.5 left-4 right-4 max-w-md mx-auto z-40 md:hidden select-none">
      <div
        className={`rounded-full ios-glass-nav border shadow-[0_16px_40px_rgba(0,0,0,0.22)] p-1.5 grid grid-cols-5 items-center transition-colors ${
          isLight
            ? 'bg-white/80 border-white/80 shadow-orange-500/10'
            : 'bg-[#151311]/80 border-white/15 shadow-black/60'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleNavClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all cursor-pointer ${
                isActive
                  ? isLight
                    ? 'text-orange-600 font-black'
                    : 'text-orange-400 font-black'
                  : isLight
                  ? 'text-zinc-500 hover:text-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="iosDockPill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className={`absolute inset-0 rounded-full ${
                    isLight ? 'bg-orange-500/15' : 'bg-orange-500/20 border border-orange-500/30'
                  }`}
                />
              )}

              <div className="relative z-10">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center shadow"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </div>
              <span className="relative z-10 text-[10px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
