import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './css/ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-content animate-in zoom-in duration-200">
                <button className="confirm-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="confirm-modal-body">
                    <div className={`confirm-modal-icon ${type}`}>
                        <AlertTriangle size={32} />
                    </div>

                    <h3 className="confirm-modal-title">{title}</h3>
                    <p className="confirm-modal-message">{message}</p>
                </div>

                <div className="confirm-modal-actions">
                    <button className="confirm-modal-btn cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className={`confirm-modal-btn confirm ${type}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
