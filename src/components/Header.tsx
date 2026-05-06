'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backPath?: string;
  rightElement?: React.ReactNode;
}

export function Header({ title, showBackButton = true, backPath = '/dashboard', rightElement }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-100 p-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {showBackButton ? (
          <button 
            onClick={() => router.push(backPath)}
            className="flex items-center gap-2 text-gray-500 font-medium hover:text-primary transition-colors flex-1"
          >
            <ChevronLeft className="w-5 h-5" /> 
            <span className="hidden sm:inline">Voltar</span>
          </button>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex flex-col items-center flex-[2]">
          <img 
            src="https://ik.imagekit.io/decoimgsfunil/Logo_Bariatrica_Caseira.webp" 
            alt="Bariátrica Caseira" 
            className="h-8 md:h-10 w-auto mb-1" 
          />
          <h1 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</h1>
        </div>

        <div className="flex-1 flex justify-end">
          {rightElement || <div className="w-10" />}
        </div>
      </div>
    </header>
  );
}
