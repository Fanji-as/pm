"use client";

import "@/styles/components/Input.css";

interface TextAreaProps {
  readonly label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  required = false,
  disabled = false,
  className = "",
}: Readonly<TextAreaProps>) {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className="input-textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}