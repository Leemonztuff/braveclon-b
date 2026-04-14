import React from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

export interface ModalActionButtonProps {
  onClick: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const ModalActionButton: React.FC<ModalActionButtonProps> = ({ 
  onClick, 
  label, 
  variant = 'primary' 
}) => {
  const variantStyles = {
    primary: 'bg-amber-400 hover:bg-amber-300 text-black',
    secondary: 'bg-zinc-700 hover:bg-zinc-600 text-white',
    danger: 'bg-red-500 hover:bg-red-400 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-xl font-bold transition-colors ${variantStyles[variant]}`}
    >
      {label}
    </button>
  );
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-slideUp">
        <div className={`${sizeStyles[size]} w-full bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            {title && <h2 className="text-lg font-bold">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-zinc-800 rounded-lg transition-colors ml-auto"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
