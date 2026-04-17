import React from 'react';
import { Card } from './Card';
import { Construction } from 'lucide-react';

export const PagePlaceholder = ({ title, description }) => {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Card 
        variant="glass" 
        className="max-w-md w-full flex flex-col items-center p-12"
      >
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
           <Construction size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{title || 'Under Construction'}</h2>
        <p className="text-slate-500 mb-8">
          {description || "We're currently building this module to bring you a premium educational experience."}
        </p>
        <div className="flex gap-4">
           <div className="w-2 h-2 rounded-full bg-primary-200 animate-bounce"></div>
           <div className="w-2 h-2 rounded-full bg-primary-300 animate-bounce [animation-delay:-0.15s]"></div>
           <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce [animation-delay:-0.3s]"></div>
        </div>
      </Card>
    </div>
  );
};

export default PagePlaceholder;
