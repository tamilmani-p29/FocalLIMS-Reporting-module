import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { FilterGroup } from '../types';
import { FilterModal } from './FilterModal';

interface FilterBuilderProps {
  filters: FilterGroup;
  onFiltersChange: (filters: FilterGroup) => void;
}

export function FilterBuilder({ filters, onFiltersChange }: FilterBuilderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        <div className="text-xs text-gray-500">
          {filters.conditions.length} filter{filters.conditions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-3">
        {filters.conditions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Filter className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm">No filters applied</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Filter" to start filtering your data</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filters.conditions.map((condition, index) => (
              <div key={condition.id} className="p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Filter {index + 1}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    filters.operator === 'AND' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {filters.operator}
                  </span>
                </div>
                <div className="text-gray-600 mt-1">
                  {condition.field || 'No field selected'}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full justify-center"
        >
          <Plus size={14} />
          Add Filter
        </button>
      </div>

      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    </div>
  );
}