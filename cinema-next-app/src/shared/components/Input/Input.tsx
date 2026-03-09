import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import styles from './Input.module.scss';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Дополнительный класс для обертки */
  wrapperClassName?: string;
  /** Размер инпута */
  size?: 'sm' | 'md' | 'lg';
  /** Текст ошибки */
  error?: string;
  /** Лейбл инпута */
  label?: string;
}

export interface InputRef {
  /** Возвращает текущее значение инпута */
  getValue: () => string;
  /** Устанавливает фокус на инпут */
  focus: () => void;
  /** Очищает значение инпута */
  clear: () => void;
}

const Input = forwardRef<InputRef, InputProps>((props, ref) => {
  const {
    wrapperClassName = '',
    size = 'md',
    error,
    label,
    className = '',
    placeholder,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    disabled = false,
    readOnly = false,
    required = false,
    type = 'text',
    id,
    name,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => inputRef.current?.value || '',
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) {
        inputRef.current.value = '';
        const event = new Event('input', { bubbles: true });
        inputRef.current.dispatchEvent(event);
      }
    },
  }));

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const wrapperClasses = [
    styles.wrapper,
    wrapperClassName,
    error ? styles.error : '',
    disabled ? styles.disabled : '',
    readOnly ? styles.readonly : '',
    styles[size],
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          id={inputId}
          type={type}
          className={`${styles.input} ${className}`}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
      </div>
      
      {error && (
        <span id={`${inputId}-error`} className={styles.errorMessage}>
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
