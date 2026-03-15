'use client';

import { useState, useCallback } from 'react';
import styles from './FiltersBar.module.scss';
import { FilterDropdown, FilterMultiDropdown, type FilterOption } from './FilterDropdown';
import {
  type FiltersState,
  EMPTY_FILTERS,
  YEAR_OPTIONS,
  RATING_OPTIONS,
  DURATION_OPTIONS,
  AGE_OPTIONS,
  countActiveFilters,
} from './filtersConfig';

type OpenDropdown = 'genres' | 'year' | 'rating' | 'duration' | null;

interface FiltersBarProps {
  filters: FiltersState;
  categoryOptions: FilterOption[];
  onChange: (filters: FiltersState) => void;
}

const FiltersBar = ({ filters, categoryOptions, onChange }: FiltersBarProps) => {
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const activeCount = countActiveFilters(filters);

  const toggle = (name: OpenDropdown) =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  const close = useCallback(() => setOpenDropdown(null), []);

  return (
    <div className={styles.bar} role="group" aria-label="Фильтры">
      <div className={styles.scrollArea}>
        <FilterMultiDropdown
          label="Жанр"
          value={filters.genres}
          options={categoryOptions}
          isOpen={openDropdown === 'genres'}
          onToggle={() => toggle('genres')}
          onSelect={(v) => onChange({ ...filters, genres: v })}
          onClose={close}
        />

        <FilterDropdown
          label="Год"
          value={filters.year}
          options={YEAR_OPTIONS}
          isOpen={openDropdown === 'year'}
          onToggle={() => toggle('year')}
          onSelect={(v) => onChange({ ...filters, year: v })}
          onClose={close}
        />

        <FilterDropdown
          label="Рейтинг"
          value={filters.rating}
          options={RATING_OPTIONS}
          isOpen={openDropdown === 'rating'}
          onToggle={() => toggle('rating')}
          onSelect={(v) => onChange({ ...filters, rating: v })}
          onClose={close}
        />

        <FilterDropdown
          label="Длительность"
          value={filters.duration}
          options={DURATION_OPTIONS}
          isOpen={openDropdown === 'duration'}
          onToggle={() => toggle('duration')}
          onSelect={(v) => onChange({ ...filters, duration: v })}
          onClose={close}
        />

        <span className={styles.divider} aria-hidden="true" />

        <div className={styles.ageGroup} role="group" aria-label="Возрастной рейтинг">
          {AGE_OPTIONS.map((opt) => {
            const active = filters.age.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                className={`${styles.chip} ${active ? styles['chip--active'] : ''}`}
                onClick={() => {
                  const age = active
                    ? filters.age.filter((a) => a !== opt.value)
                    : [...filters.age, opt.value];
                  onChange({ ...filters, age });
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => {
              setOpenDropdown(null);
              onChange(EMPTY_FILTERS);
            }}
            aria-label={`Сбросить фильтры: ${activeCount}`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path
                d="M1 1l8 8M9 1L1 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Сбросить
            <span className={styles.badge}>{activeCount}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FiltersBar;
