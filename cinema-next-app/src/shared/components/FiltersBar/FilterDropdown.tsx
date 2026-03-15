'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import styles from './FilterDropdown.module.scss';

export interface FilterOption {
  value: string;
  label: string;
}

const ChevronIcon = ({ up }: { up?: boolean }) => (
  <svg
    className={`${styles.arrow} ${up ? styles['arrow--up'] : ''}`}
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1 1l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
    <path
      d="M1 4l3 3 5-6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void,
) {
  const onCloseStable = useCallback(onClose, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCloseStable();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, ref, onCloseStable]);
}

export interface FilterDropdownProps {
  label: string;
  value: string;
  options: FilterOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const FilterDropdown = ({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  onClose,
}: FilterDropdownProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const isActive = !!value;
  const selectedLabel = options.find((o) => o.value === value)?.label;

  useClickOutside(wrapRef, isOpen, onClose);

  return (
    <div ref={wrapRef} className={styles.dropdownWrap}>
      <button
        type="button"
        className={[
          styles.filterBtn,
          isActive ? styles['filterBtn--active'] : '',
          isOpen ? styles['filterBtn--open'] : '',
        ].join(' ')}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {isActive ? selectedLabel : label}
        <ChevronIcon up={isOpen} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="listbox">
          {isActive && (
            <button
              type="button"
              role="option"
              aria-selected={false}
              className={`${styles.dropdownOption} ${styles['dropdownOption--clear']}`}
              onClick={() => {
                onSelect('');
                onClose();
              }}
            >
              Не выбрано
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              className={[
                styles.dropdownOption,
                value === opt.value ? styles['dropdownOption--selected'] : '',
              ].join(' ')}
              onClick={() => {
                onSelect(opt.value);
                onClose();
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export interface FilterMultiDropdownProps {
  label: string;
  value: string[];
  options: FilterOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string[]) => void;
  onClose: () => void;
}

export const FilterMultiDropdown = ({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  onClose,
}: FilterMultiDropdownProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const isActive = value.length > 0;

  useClickOutside(wrapRef, isOpen, onClose);

  const buttonLabel = () => {
    if (!isActive) return label;
    if (value.length === 1) return options.find((o) => o.value === value[0])?.label ?? label;
    return `${label} · ${value.length}`;
  };

  const toggle = (optValue: string) => {
    const next = value.includes(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onSelect(next);
  };

  return (
    <div ref={wrapRef} className={styles.dropdownWrap}>
      <button
        type="button"
        className={[
          styles.filterBtn,
          isActive ? styles['filterBtn--active'] : '',
          isOpen ? styles['filterBtn--open'] : '',
        ].join(' ')}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-multiselectable="true"
      >
        {buttonLabel()}
        <ChevronIcon up={isOpen} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="listbox" aria-multiselectable="true">
          {isActive && (
            <button
              type="button"
              role="option"
              aria-selected={false}
              className={`${styles.dropdownOption} ${styles['dropdownOption--clear']}`}
              onClick={() => onSelect([])}
            >
              Сбросить выбор
            </button>
          )}
          {options.map((opt) => {
            const selected = value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={[
                  styles.dropdownOption,
                  selected ? styles['dropdownOption--selected'] : '',
                ].join(' ')}
                onClick={() => toggle(opt.value)}
              >
                {opt.label}
                {selected && <CheckIcon />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
