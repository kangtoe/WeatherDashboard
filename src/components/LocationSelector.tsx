import { CITIES } from '../types/weather';
import type { Location } from '../types/weather';

interface LocationSelectorProps {
  selected: Location;
  onSelect: (location: Location) => void;
}

export function LocationSelector({ selected, onSelect }: LocationSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CITIES.map((city) => (
        <button
          key={city.name}
          onClick={() => onSelect(city)}
          className={`px-4 py-2 min-h-11 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            selected.name === city.name
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }`}
        >
          {city.name}
        </button>
      ))}
    </div>
  );
}
