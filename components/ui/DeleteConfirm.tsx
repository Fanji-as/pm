"use client";

import Modal from "./Modal";
import Button from "./Button";
import { useLanguage } from "@/lib/i18n/context";

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  itemDescription?: string;
  isLoading?: boolean;
}

export default function DeleteConfirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  itemDescription,
  isLoading = false,
}: Readonly<DeleteConfirmProps>) {
  const { t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p style={{ color: "var(--color-text)" }}>{message}</p>
        {itemName && (
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor: "var(--color-border)",
            }}
          >
            <p
              className="font-medium"
              style={{ color: "var(--color-text)" }}
            >
              {itemName}
            </p>
            {itemDescription && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {itemDescription}
              </p>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t.common.cancel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t.common.loading : t.common.delete}
          </Button>
        </div>
      </div>
    </Modal>
  );
}