import React, { useState } from 'react';
import { shelterService } from '../firebase/services.js';
import './PremiumModal.css';

function PremiumModal({ isOpen, onClose, shelterId, shelterName, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Un solo plan premium simplificado
  const premiumPlan = {
    name: 'Premium',
    price: '$9.99',
    duration: 'mensual',
    features: [
      'Mascotas en dos columnas',
      'Mascotas destacadas al inicio',
      'Badge premium visible',
      'Mayor visibilidad en búsquedas'
    ]
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Activar premium por 1 mes
      await shelterService.activatePremium(shelterId, 1);
      
      // Mostrar mensaje de éxito
      alert(`¡Felicidades! ${shelterName} ahora tiene suscripción premium.`);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error activating premium:', error);
      alert('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay">
      <div className="premium-modal">
        <div className="premium-modal-header">
          <h2>⭐ Actualizar a Premium</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="premium-modal-content">
          <div className="shelter-info">
            <h3>{shelterName}</h3>
            <p>Mejora la visibilidad de tus mascotas</p>
          </div>

          <div className="plan-card selected">
            <div className="plan-header">
              <h4>{premiumPlan.name}</h4>
            </div>
            
            <div className="plan-price">
              <span className="price">{premiumPlan.price}</span>
              <span className="duration">/{premiumPlan.duration}</span>
            </div>

            <ul className="plan-features">
              {premiumPlan.features.map((feature, index) => (
                <li key={index}>
                  <span className="feature-icon">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="payment-info">
            <p className="payment-note">
              💳 Simulación de pago - Sin cargo real
            </p>
          </div>
        </div>

        <div className="premium-modal-footer">
          <button 
            className="cancel-button"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button 
            className="purchase-button"
            onClick={handlePurchase}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : `Activar Premium`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PremiumModal;
