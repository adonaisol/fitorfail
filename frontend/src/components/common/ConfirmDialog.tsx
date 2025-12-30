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
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'bg-red-100',
      iconColor: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icon: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    default: {
      icon: 'bg-primary-100',
      iconColor: 'text-primary-600',
      button: 'btn-primary'
    },
    secondary: {
      icon: 'bg-gray-100',
      iconColor: 'text-gray-600',
      button: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
    }
  };

  const styles = variantStyles[variant];

  const getButtonStyle = (buttonVariant?: 'danger' | 'warning' | 'default' | 'secondary') => {
    return variantStyles[buttonVariant || variant].button;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 transform transition-all">
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${styles.icon} flex items-center justify-center mx-auto mb-4`}>
            <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Actions */}
          {actions ? (
            <div className="flex flex-col gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`w-full px-4 py-2.5 rounded-lg font-medium transition-colors ${getButtonStyle(action.variant)}`}
                >
                  {action.label}
                </button>
              ))}
              <button
                onClick={onCancel}
                className="w-full px-4 py-2 text-gray-500 font-medium hover:text-gray-700 transition-colors"
              >
                {cancelLabel}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {cancelLabel}
              </button>
              {onConfirm && (
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${styles.button}`}
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
