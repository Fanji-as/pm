import { cn } from "@/lib/utils";
import "@/styles/components/Input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
}

export default function Input({
  label,
  error,
  className,
  ...props
}: Readonly<InputProps>) {
  return (
    <div className="input-container">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <input
        className={cn(
          "input-field",
          error && "input-error",
          className,
        )}
        {...props}
      />
      {error && <p className="input-error-message">{error}</p>}
    </div>
  );
}
