import { useEffect } from "react";
import { X } from "lucide-react";
import "@/styles/components/Modal.css";

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: React.ReactNode;
  readonly closeAriaLabel?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  closeAriaLabel = "Close modal",
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button
          className="modal-backdrop"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onClose();
            }
          }}
          aria-label={closeAriaLabel}
        />
        <div className="modal-content">
          <button
            onClick={onClose}
            className="modal-close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h2 className="modal-title">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}
