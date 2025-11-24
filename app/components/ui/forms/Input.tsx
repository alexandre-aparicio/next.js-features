import React from 'react';
import { ValidationConfig } from './Validation';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  name: string;
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  validate?: ValidationConfig;
  error?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  name,
  id,
  label,
  placeholder,
  value = '',
  required = false,
  disabled = false,
  onChange,
  onBlur,
  validate,
  error,
  className = '',
}) => {
  const inputId = id || name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId}>
          {label}
          {(required || validate?.required) && ' *'}
        </label>
      )}

      <input
        type={type}
        id={inputId}
        name={name}
        placeholder={placeholder}
        value={value}
        required={required || validate?.required}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
      />

      {error && <div>{error}</div>}
    </div>
  );
};

export default Input;