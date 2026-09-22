import React, { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ns-modal-backdrop" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className={`ns-modal ns-modal--${maxWidth}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-desc' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ns-modal__header">
          <div>
            <h2 id="modal-title" className="ns-modal__title">
              {title}
            </h2>
            {description && (
              <p id="modal-desc" className="ns-modal__desc text-muted">
                {description}
              </p>
            )}
          </div>
          <IconButton
            icon={<X size={18} />}
            aria-label="Close dialog"
            onClick={onClose}
            size="sm"
          />
        </div>

        <div className="ns-modal__body">{children}</div>

        {footer && <div className="ns-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};
