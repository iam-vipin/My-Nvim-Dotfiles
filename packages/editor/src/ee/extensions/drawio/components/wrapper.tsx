import { FloatingOverlay, FloatingPortal } from "@floating-ui/react";
import React, { useEffect } from "react";

type DrawioDialogWrapperProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const DrawioDialogWrapper: React.FC<DrawioDialogWrapperProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <FloatingPortal>
      <FloatingOverlay lockScroll style={{ zIndex: 99 }}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 animate-in fade-in duration-200" onClick={onClose} />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div
            className="relative bg-white rounded-xl shadow-2xl overflow-hidden w-[95vw] h-[90vh] max-w-[1400px] max-h-[900px]"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      </FloatingOverlay>
    </FloatingPortal>
  );
};
