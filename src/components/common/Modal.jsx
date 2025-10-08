import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ 
  show, 
  onHide, 
  title, 
  children, 
  size = 'lg',
  onSave,
  saveText = 'Guardar',
  cancelText = 'Cancelar',
  loading = false,
  hideFooter = false
}) => {
  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleBackdropClick}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]}`}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {title}
              </h3>
              <button
                onClick={onHide}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div>
              {children}
            </div>
          </div>
          {!hideFooter && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {onSave && (
                <Button 
                  onClick={onSave}
                  loading={loading}
                  className="w-full sm:ml-3 sm:w-auto"
                >
                  {saveText}
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={onHide}
                disabled={loading}
                className="mt-3 w-full sm:mt-0 sm:w-auto"
              >
                {cancelText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;