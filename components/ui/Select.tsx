"use client";

import "@/styles/components/Input.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  readonly label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  size?: "sm" | "md";
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  size = "md",
  required = false,
  disabled = false,
  className = "",
}: Readonly<SelectProps>) {
  const sizeClass = size === "sm" ? "input-select-sm" : "input-select";
  
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={sizeClass}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}