import React from 'react';
import useStore from '../store/useStore';

const CustomPopup = () => {
  const { dialog, closeDialog } = useStore();

  if (!dialog) return null;

  const { title, message, type, onConfirm, onCancel } = dialog;

  const handleConfirm = () => {
    closeDialog();
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    closeDialog();
    if (onCancel) onCancel();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-md bg-ag-surface border border-ag-border rounded-3xl shadow-2xl overflow-hidden scale-in max-h-[90vh] flex flex-col fade-in-up">
        
        {/* Header Icon & Title */}
        <div className="p-6 pb-4 flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl ${
            type === 'confirm' 
              ? 'bg-ag-red/10 text-ag-red border border-ag-red/20' 
              : 'bg-ag-purple/10 text-ag-purple border border-ag-purple/20'
          }`}>
            {type === 'confirm' ? '⚠️' : 'ℹ️'}
          </div>
          
          <div className="flex-grow min-w-0">
            <h3 className="font-extrabold text-lg text-ag-white leading-snug">
              {title}
            </h3>
            <p className="text-sm text-ag-muted mt-2 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        {/* Buttons Footer */}
        <div className="px-6 py-4 bg-ag-black/50 border-t border-ag-border/50 flex items-center justify-end space-x-3">
          {type === 'confirm' && (
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 bg-transparent hover:bg-ag-surface/50 border border-ag-border rounded-xl text-xs font-bold text-ag-muted hover:text-ag-white transition-all focus:outline-none"
            >
              Cancel
            </button>
          )}
          
          <button
            onClick={handleConfirm}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all focus:outline-none shadow-md ${
              type === 'confirm'
                ? 'bg-ag-red hover:bg-red-500 shadow-ag-red/10'
                : 'bg-ag-purple hover:bg-ag-violet shadow-ag-purple/10'
            }`}
          >
            {type === 'confirm' ? 'Confirm' : 'Got it'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomPopup;
