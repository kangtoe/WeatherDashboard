import { useState, useRef, useEffect } from 'react';
import { CITIES } from '../types/weather';
import type { Location } from '../types/weather';

interface LocationSelectorProps {
  selected: Location;
  onSelect: (location: Location) => void;
}

export function LocationSelector({ selected, onSelect }: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-fit">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 min-h-11 sm:min-h-0 rounded-lg text-gray-900 dark:text-white text-base font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      >
        {selected.name}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10">
          {CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => {
                onSelect(city);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                selected.name === city.name
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
