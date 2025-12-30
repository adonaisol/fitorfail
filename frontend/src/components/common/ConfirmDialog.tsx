import { useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ActionButton {
  label: string;
  variant?: 'danger' | 'warning' | 'default' | 'secondary';
  onClick: () => void;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm?: () => void;
  onCancel: () => void;
  actions?: ActionButton[];
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  actions
}: ConfirmDialogProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }

    // Focus trap
    if (e.key === 'Tab' && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [onCancel]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the current active element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the dialog
      setTimeout(() => {
        const firstButton = dialogRef.current?.querySelector<HTMLElement>('button');
        firstButton?.focus();
      }, 0);

      // Add keyboard listener
      document.addEventListener('keydown', handleKeyDown);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';

      // Restore focus when dialog closes
      if (previousActiveElement.current && !isOpen) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'bg-red-100',
      iconColor: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    },
    warning: {
      icon: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500'
    },
    default: {
      icon: 'bg-primary-100',
      iconColor: 'text-primary-600',
      button: 'btn-primary focus:ring-primary-500'
    },
    secondary: {
      icon: 'bg-gray-100',
      iconColor: 'text-gray-600',
      button: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-500'
    }
  };

  const styles = variantStyles[variant];

  const getButtonStyle = (buttonVariant?: 'danger' | 'warning' | 'default' | 'secondary') => {
    return variantStyles[buttonVariant || variant].button;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not the dialog
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const titleId = 'confirm-dialog-title';
  const descId = 'confirm-dialog-description';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* Dialog */}
      <div
        className="flex min-h-full items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div
          ref={dialogRef}
          className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${styles.icon} flex items-center justify-center mx-auto mb-4`}>
            <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} aria-hidden="true" />
          </div>

          {/* Content */}
          <h3
            id={titleId}
            className="text-lg font-semibold text-gray-900 text-center mb-2"
          >
            {title}
          </h3>
          <p
            id={descId}
            className="text-sm text-gray-600 text-center mb-6"
          >
            {message}
          </p>

          {/* Actions */}
          {actions ? (
            <div className="flex flex-col gap-2" role="group" aria-label="Dialog actions">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonStyle(action.variant)}`}
                >
                  {action.label}
                </button>
              ))}
              <button
                onClick={onCancel}
                className="w-full px-4 py-2 text-gray-500 font-medium hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-lg"
              >
                {cancelLabel}
              </button>
            </div>
          ) : (
            <div className="flex gap-3" role="group" aria-label="Dialog actions">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                {cancelLabel}
              </button>
              {onConfirm && (
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button}`}
                >
                  {confirmLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
