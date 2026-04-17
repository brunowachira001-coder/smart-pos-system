import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-400',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400',
    outline: 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 disabled:border-emerald-300'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="animate-spin">⏳</span>}
      {children}
    </button>
  );
};
