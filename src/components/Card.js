import React from 'react';

function Card({ children, className = '' }) {
  return (
    <div className={`app-card ${className}`.trim()}>
      {children}
    </div>
  );
}

export default Card;
