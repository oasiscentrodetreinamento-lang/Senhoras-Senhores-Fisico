
import React, { InputHTMLAttributes } from 'react';
import { Classification } from '../services/calculations';

interface InputGroupProps extends InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  suffix?: string;
  as?: 'input' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  feedback?: Classification;
}

export const InputGroup: React.FC<InputGroupProps> = ({ 
  label, 
  error, 
  suffix, 
  as = 'input', 
  options, 
  className, 
  feedback,
  ...props 
}) => {
  const baseInputStyles = "w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors outline-none bg-gray-50 text-gray-700 placeholder-gray-300";
  
  const getFeedbackColor = (status: string) => {
    switch(status) {
        case 'success': return 'text-green-600 bg-green-50 border-green-100';
        case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-100';
        case 'error': return 'text-red-600 bg-red-50 border-red-100';
        default: return 'text-gray-500';
    }
  };

  return (
    <div className={`flex flex-col ${className || ''}`}>
      <label className="text-sm font-semibold text-gray-700 mb-1 ml-1">
        {label}
      </label>
      <div className="relative">
        {as === 'select' ? (
          <select className={baseInputStyles} {...(props as any)}>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : as === 'textarea' ? (
          <textarea className={baseInputStyles} rows={4} {...(props as any)} />
        ) : (
          <input className={baseInputStyles} {...props} />
        )}
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      
      {feedback && feedback.status !== 'neutral' && (
        <div className={`mt-1.5 text-xs px-2 py-1 rounded border w-fit font-medium ${getFeedbackColor(feedback.status)}`}>
            {feedback.label}
        </div>
      )}
      
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
};
