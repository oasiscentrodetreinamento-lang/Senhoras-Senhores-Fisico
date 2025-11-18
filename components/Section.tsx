import React, { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 ${className}`}>
      <h3 className="text-lg font-bold text-brand-blue mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
};