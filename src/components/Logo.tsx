import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',      // Increased from w-6 h-6
    md: 'w-12 h-12',    // Increased from w-8 h-8
    lg: 'w-16 h-16',    // Increased from w-12 h-12
    xl: 'w-20 h-20'     // New extra large size
  };

  // 🎯 Using imported logo from components folder
  // const logoPath = newslyLogo;
  
  // Alternative: If you move logo to public folder, use this instead:
  const logoPath = "/newslylogo.png";

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <img
        src={logoPath}
        alt="Newsly Logo"
        className="w-full h-full object-cover rounded-full border-2 border-white shadow-lg"
        onError={(e) => {
          // Fallback to circular text if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextSibling) return;
          
          const fallback = document.createElement('div');
          fallback.className = 'w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white';
          fallback.style.fontSize = size === 'sm' ? '12px' : size === 'md' ? '16px' : size === 'lg' ? '20px' : '24px';
          fallback.textContent = 'N';
          target.parentNode?.appendChild(fallback);
        }}
      />
    </div>
  );
}