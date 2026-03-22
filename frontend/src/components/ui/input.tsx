import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full h-11 rounded-[10px] border p-2.5 bc-input placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${
        error 
            ? 'border-red-300 bg-red-50 focus-visible:border-outline-input focus-visible:ring-[#3632F5]' 
            : 'border-gray-300 focus-visible:border-outline-input focus-visible:ring-[#3632F5]'
        }`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
