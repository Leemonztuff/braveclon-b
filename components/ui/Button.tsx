import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

// Minimum touch target size for mobile accessibility
const MIN_TOUCH_SIZE = 44;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, icon, className, children, ...props }, ref) => {
    const baseStyles = 'font-semibold tracking-wide rounded-lg transition-all active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation select-none';
    
    const variantStyles = {
      primary: 'bg-gradient-to-b from-amber-400 to-amber-600 text-black hover:from-amber-300 hover:to-amber-500 shadow-lg',
      secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700',
      danger: 'bg-gradient-to-b from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600',
      ghost: 'text-zinc-300 hover:text-white hover:bg-zinc-800/50',
    };

    const sizeStyles = {
      sm: `px-3 py-2.5 min-h-[${MIN_TOUCH_SIZE}px] text-xs`,
      md: `px-5 py-3 min-h-[${MIN_TOUCH_SIZE}px] text-sm`,
      lg: `px-6 py-4 min-h-[${MIN_TOUCH_SIZE}px] text-base`,
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <span className="animate-spin">⚙️</span>}
        {icon && !loading && <span>{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
