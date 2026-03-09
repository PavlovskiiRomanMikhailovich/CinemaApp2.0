import React, { useState, useRef, useEffect } from 'react';
import styles from 'components/Dropdow/Dropdow.module.scss';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
}

const Dropdown = ({
  options,
  value = [],
  onChange,
  multiple = false,
  placeholder = 'Выберите',
  className = '',
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(value);
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    let newSelected: string[];
    if (multiple) {
      newSelected = selected.includes(optionValue)
        ? selected.filter(v => v !== optionValue)
        : [...selected, optionValue];
    } else {
      newSelected = [optionValue];
      setIsOpen(false);
    }
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const displayText = () => {
    if (selected.length === 0) return placeholder;
    const labels = selected.map(v => options.find(o => o.value === v)?.label || v);
    return labels.join(', ');
  };

  return (
    <div 
      ref={dropdownRef} 
      className={`${styles.dropdown} ${className} ${isOpen ? styles.open : ''}`}
    >
      <div 
        className={styles.header} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {displayText()}
        <img src='/images/ArrowDown.svg'/>
      </div>
      
      {isOpen && (
        <div className={styles.options}>
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`${styles.option} ${
                hoveredIndex === index ? styles.hovered : ''
              }`}
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(-1)}
            >
              <span className={selected.includes(option.value) ? styles.selected : ''}>
                {option.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
