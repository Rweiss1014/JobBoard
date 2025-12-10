'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { JobFilters, JobCategory, ExperienceLevel, EmploymentType } from '@/types';

interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
}

const categories: { value: JobCategory; label: string }[] = [
  { value: 'instructional-design', label: 'Instructional Design' },
  { value: 'elearning-development', label: 'E-Learning Development' },
  { value: 'training-facilitation', label: 'Training & Facilitation' },
  { value: 'learning-management', label: 'Learning Management' },
  { value: 'curriculum-development', label: 'Curriculum Development' },
  { value: 'corporate-training', label: 'Corporate Training' },
  { value: 'learning-technology', label: 'Learning Technology' },
  { value: 'talent-development', label: 'Talent Development' },
];

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'director', label: 'Director' },
];

const employmentTypes: { value: EmploymentType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
];

const locationTypes: { value: 'remote' | 'hybrid' | 'onsite'; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

export default function JobFiltersComponent({ filters, onFiltersChange }: JobFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    experience: true,
    employment: true,
    location: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleArrayFilter = <T extends string>(
    key: keyof JobFilters,
    value: T
  ) => {
    const currentValues = (filters[key] as T[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [key]: newValues.length > 0 ? newValues : undefined });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    (filters.categories?.length || 0) > 0 ||
    (filters.experienceLevels?.length || 0) > 0 ||
    (filters.employmentTypes?.length || 0) > 0 ||
    (filters.locationTypes?.length || 0) > 0;

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string;
    sectionKey: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        type="button"
        className="flex items-center justify-between w-full text-left"
        onClick={() => toggleSection(sectionKey)}
      >
        <span className="font-medium text-gray-900">{title}</span>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expandedSections[sectionKey] && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );

  const CheckboxFilter = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="text-sm text-gray-600 group-hover:text-gray-900">{label}</span>
    </label>
  );

  const FiltersContent = () => (
    <>
      <FilterSection title="Category" sectionKey="category">
        {categories.map((cat) => (
          <CheckboxFilter
            key={cat.value}
            label={cat.label}
            checked={filters.categories?.includes(cat.value) || false}
            onChange={() => toggleArrayFilter('categories', cat.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Experience Level" sectionKey="experience">
        {experienceLevels.map((level) => (
          <CheckboxFilter
            key={level.value}
            label={level.label}
            checked={filters.experienceLevels?.includes(level.value) || false}
            onChange={() => toggleArrayFilter('experienceLevels', level.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Employment Type" sectionKey="employment">
        {employmentTypes.map((type) => (
          <CheckboxFilter
            key={type.value}
            label={type.label}
            checked={filters.employmentTypes?.includes(type.value) || false}
            onChange={() => toggleArrayFilter('employmentTypes', type.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Work Location" sectionKey="location">
        {locationTypes.map((loc) => (
          <CheckboxFilter
            key={loc.value}
            label={loc.label}
            checked={filters.locationTypes?.includes(loc.value) || false}
            onChange={() => toggleArrayFilter('locationTypes', loc.value)}
          />
        ))}
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
              {(filters.categories?.length || 0) +
                (filters.experienceLevels?.length || 0) +
                (filters.employmentTypes?.length || 0) +
                (filters.locationTypes?.length || 0)}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-8rem)]">
              <FiltersContent />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Clear all
            </button>
          )}
        </div>
        <FiltersContent />
      </div>
    </>
  );
}
