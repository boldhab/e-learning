import React from 'react';

export const Card = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  footer, 
  className = '', 
  variant = 'glass', 
  ...props 
}) => {
  const variants = {
    glass: 'glass border border-white/40',
    white: 'bg-white border border-slate-100',
    dark: 'bg-slate-900 text-white',
    primary: 'bg-primary-600 text-white shadow-xl shadow-primary-200',
  };

  return (
    <div 
      className={`rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                <Icon size={24} />
              </div>
            )}
            <div>
              {title && <h3 className="text-xl font-bold text-slate-800">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
      {footer && (
        <div className="mt-6 pt-6 border-t border-slate-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
