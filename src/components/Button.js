import React from 'react';

function Button({ children, onClick, variant = 'primary', type = 'button', className = '' }) {
  const variantClass = variant === 'primary'
    ? 'app-button-primary'
    : 'app-button-secondary';

  return (
    <button type={type} onClick={onClick} className={`app-button ${variantClass} ${className}`.trim()}>
      {children}
    </button>
  );
}

export default Button;
