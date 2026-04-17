import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700 hover:shadow-primary-300',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700',
    danger: 'bg-red-500 text-white shadow-lg shadow-red-100 hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
