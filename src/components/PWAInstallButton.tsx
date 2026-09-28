import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallBanner } from './PWAInstallBanner';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstalled } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already installed and launched from home screen in standalone mode, hide button
  if (isInstalled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-black text-[11px] shadow-sm shadow-orange-500/20 transition-all cursor-pointer ${className}`}
        title="Installer Chez Bineta directement sur votre téléphone sans passer par le Play Store"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Installer l'App 📲</span>
      </button>

      {isModalOpen && (
        <PWAInstallBanner forceOpen={true} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};
