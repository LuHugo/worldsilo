import { SPECIES_CATEGORIES, type SpeciesCategory } from '@/types';

interface CategoryTabsProps {
  activeCategory: SpeciesCategory | 'all';
  onCategoryChange: (category: SpeciesCategory | 'all') => void;
  getCount: (key: SpeciesCategory | 'all') => number;
}

export function CategoryTabs({ activeCategory, onCategoryChange, getCount }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
      {SPECIES_CATEGORIES.map((cat) => {
        const count = getCount(cat.key);
        const isActive = activeCategory === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => onCategoryChange(cat.key)}
            className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors shrink-0 ${
              isActive
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {cat.label} <span className="opacity-60 ml-1">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
