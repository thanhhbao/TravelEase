import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

interface FilterSection {
  title: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  value?: any;
  onChange: (value: any) => void;
}

interface FilterPanelProps {
  filters: FilterSection[];
  onClearAll?: () => void;
  className?: string;
}

export default function FilterPanel({ filters, onClearAll, className = '' }: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  const renderFilterInput = (filter: FilterSection) => {
    switch (filter.type) {
      case 'checkbox':
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(filter.value) && filter.value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(filter.value) ? filter.value : [];
                    if (e.target.checked) {
                      filter.onChange([...currentValues, option.value]);
                    } else {
                      filter.onChange(currentValues.filter((v: any) => v !== option.value));
                    }
                  }}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-700">
                  {option.label}
                  {option.count && (
                    <span className="text-gray-500 ml-1">({option.count})</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {filter.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={filter.title}
                  value={option.value}
                  checked={filter.value === option.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-700">
                  {option.label}
                  {option.count && (
                    <span className="text-gray-500 ml-1">({option.count})</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  value={filter.value?.min || filter.min}
                  onChange={(e) => filter.onChange({
                    ...filter.value,
                    min: parseInt(e.target.value) || filter.min
                  })}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  value={filter.value?.max || filter.max}
                  onChange={(e) => filter.onChange({
                    ...filter.value,
                    max: parseInt(e.target.value) || filter.max
                  })}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
            </div>
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              step={filter.step}
              value={filter.value?.max || filter.max}
              onChange={(e) => filter.onChange({
                ...filter.value,
                max: parseInt(e.target.value)
              })}
              className="w-full"
            />
          </div>
        );

      case 'select':
        return (
          <select
            value={filter.value || ''}
            onChange={(e) => filter.onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
          >
            <option value="">All</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {onClearAll && (
          <button
            onClick={onClearAll}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {filters.map((filter) => {
          const isExpanded = expandedSections.has(filter.title);
          
          return (
            <div key={filter.title} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
              <button
                onClick={() => toggleSection(filter.title)}
                className="flex items-center justify-between w-full text-left mb-4"
              >
                <h4 className="font-medium text-gray-900">{filter.title}</h4>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              <div className={`transition-all duration-200 ${isExpanded ? 'block' : 'hidden'}`}>
                {renderFilterInput(filter)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


