import React from 'react';
import styles from '../styles/Modal.module.css';
import { useTranslation } from 'react-i18next';

const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
    const { t } = useTranslation();

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>{title || t('confirmation')}</h3>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.content}>
                    {children}
                </div>
                <div className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onClose}>{t('cancel')}</button>
                    <button className={styles.confirmButton} onClick={onConfirm}>{t('confirm')}</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;