import React from 'react';

function Input({ as = 'input', className = '', ...props }) {
  const Component = as;
  const baseClass = as === 'textarea'
    ? 'app-textarea'
    : as === 'select'
      ? 'app-select'
      : 'app-input';

  return <Component className={`${baseClass} ${className}`.trim()} {...props} />;
}

export default Input;
