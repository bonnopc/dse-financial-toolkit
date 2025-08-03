import React from 'react';
import './InputLabel.css';

interface InputLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}

const InputLabel: React.FC<InputLabelProps> = ({
  htmlFor,
  children,
  className = '',
}) => {
  return (
    <label htmlFor={htmlFor} className={`input-label ${className}`}>
      {children}
    </label>
  );
};

export default InputLabel;
