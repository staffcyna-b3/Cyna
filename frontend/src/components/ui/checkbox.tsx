import { InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        className="w-5 h-5 rounded-2xl  text-[#3632F5] bg-white cursor-pointer accent-[#3632F5] focus:ring-[#3632F5]"
        {...props}
      />
      {label && (
        <label htmlFor={props.id} className="text-sm font-medium cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}