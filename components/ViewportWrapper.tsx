'use client';

import { useMemo } from 'react';

interface ViewportWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function ViewportWrapper({ children, className = '' }: ViewportWrapperProps) {
  // Use CSS-based approach with media queries instead of JS state
  // This avoids the setState-in-effect error
  return (
    <div className={`viewport-wrapper ${className}`}>
      <div className="viewport-content">
        {children}
      </div>
    </div>
  );
}