import React, { useState } from 'react';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { FilterGroup, FilterCondition } from '../types';
import { availableFields } from '../data/mockData';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup;
  onFiltersChange: (filters: FilterGroup) => void;
}

interface FilterConditionEditorProps {
  condition: FilterCondition;
  onUpdate: (condition: FilterCondition) => void;
  onRemove: () => void;
  index: number;
  groupOperator: 'AND' | 'OR';
  onOperatorChange: (operator: 'AND' | 'OR') => void;
  showOperator: boolean;
}

const operatorOptions = [
  { value: 'equals', label: 'is' },
  { value: 'not_equals', label: "isn't" },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: "doesn't contain" },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than', label: 'less than' },
  { value: 'between', label: 'between' },
  { value: 'in', label: 'in' },
  { value: 'not_in', label: 'not in' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' },
];

const datePresets = [
  'Today',
  'Tomorrow', 
  'Starting tomorrow',
  'Yesterday',
  'Till Yesterday',
  'Previous Month',
  'Current Month',
  'Next Month',
  'This Week',
  'Last Week',
  'Next Week',
  'This Quarter',
  'Last Quarter',
  'This Year',
  'Last Year'
];

function FilterConditionEditor({ 
  condition, 
  onUpdate, 
  onRemove, 
  index, 
  groupOperator, 
  onOperatorChange, 
  showOperator 
}: FilterConditionEditorProps) {
  const [showDatePresets, setShowDatePresets] = useState(false);
  const field = availableFields.find(f => f.id === condition.field);

  const handleFieldChange = (fieldId: string) => {
    const newField = availableFields.find(f => f.id === fieldId);
    if (!newField) return;

    onUpdate({
      ...condition,
      field: fieldId,
      operator: 'equals',
      value: newField.type === 'boolean' ? false : '',
    });
  };

  const getAvailableOperators = () => {
    if (!field) return operatorOptions.slice(0, 2);
    
    switch (field.type) {
      case 'text':
        return operatorOptions.filter(op => 
          ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'].includes(op.value)
        );
      case 'number':
      case 'date':
        return operatorOptions.filter(op => 
          ['equals', 'not_equals', 'greater_than', 'less_than', 'between', 'is_empty', 'is_not_empty'].includes(op.value)
        );
      case 'select':
        return operatorOptions.filter(op => 
          ['equals', 'not_equals', 'in', 'not_in', 'is_empty', 'is_not_empty'].includes(op.value)
        );
      case 'boolean':
        return operatorOptions.filter(op => ['equals', 'not_equals'].includes(op.value));
      default:
        return operatorOptions.slice(0, 2);
    }
  };

  const renderValueInput = () => {
    if (!field || ['is_empty', 'is_not_empty'].includes(condition.operator)) return null;

    switch (field.type) {
      case 'select':
        if (['in', 'not_in'].includes(condition.operator)) {
          return (
            <div className="relative">
              <input
                type="text"
                value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
                onChange={(e) => onUpdate({ 
                  ...condition, 
                  value: e.target.value.split(',').map(v => v.trim()) 
                })}
                placeholder="Enter values separated by commas..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          );
        }
        return (
          <div className="relative">
            <select
              value={condition.value}
              onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">Select value...</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        );
      
      case 'boolean':
        return (
          <div className="relative">
            <select
              value={String(condition.value)}
              onChange={(e) => onUpdate({ ...condition, value: e.target.value === 'true' })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        );
      
      case 'date':
        if (condition.operator === 'between') {
          const values = Array.isArray(condition.value) ? condition.value : ['', ''];
          return (
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={values[0]}
                  onChange={(e) => onUpdate({ 
                    ...condition, 
                    value: [e.target.value, values[1]] 
                  })}
                  placeholder="dd/MM/yyyy"
                  className="w-24 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select className="px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>01:00 AM</option>
                <option>02:00 AM</option>
                <option>03:00 AM</option>
              </select>
              <span className="text-gray-500">and</span>
              <div className="relative">
                <input
                  type="text"
                  value={values[1]}
                  onChange={(e) => onUpdate({ 
                    ...condition, 
                    value: [values[0], e.target.value] 
                  })}
                  placeholder="dd/MM/yyyy"
                  className="w-24 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select className="px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>01:00 AM</option>
                <option>02:00 AM</option>
                <option>03:00 AM</option>
              </select>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={condition.value}
                onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
                placeholder="dd/MM/yyyy"
                onFocus={() => setShowDatePresets(true)}
                className="w-32 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {showDatePresets && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  {datePresets.map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        onUpdate({ ...condition, value: preset });
                        setShowDatePresets(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select className="px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>01:00 AM</option>
              <option>02:00 AM</option>
              <option>03:00 AM</option>
            </select>
          </div>
        );
      
      case 'number':
        if (condition.operator === 'between') {
          const values = Array.isArray(condition.value) ? condition.value : ['', ''];
          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={values[0]}
                onChange={(e) => onUpdate({ 
                  ...condition, 
                  value: [e.target.value, values[1]] 
                })}
                placeholder="Min"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500 text-sm">and</span>
              <input
                type="number"
                value={values[1]}
                onChange={(e) => onUpdate({ 
                  ...condition, 
                  value: [values[0], e.target.value] 
                })}
                placeholder="Max"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          );
        }
        return (
          <input
            type="number"
            value={condition.value}
            onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={condition.value}
            onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
            placeholder="Click to Select Users..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      {showOperator && (
        <div className="flex justify-center">
          <button
            onClick={() => onOperatorChange(groupOperator === 'AND' ? 'OR' : 'AND')}
            className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
              groupOperator === 'AND' 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            {groupOperator}
          </button>
        </div>
      )}
      
      <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
            {index + 1}
          </span>
        </div>

        <div className="relative min-w-0 flex-1">
          <select
            value={condition.field}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="">Select field...</option>
            {availableFields.map(field => (
              <option key={field.id} value={field.id}>{field.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>

        <div className="relative min-w-0 flex-1">
          <select
            value={condition.operator}
            onChange={(e) => onUpdate({ ...condition, operator: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            disabled={!field}
          >
            {getAvailableOperators().map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>

        <div className="min-w-0 flex-1">
          {renderValueInput()}
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Add condition"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-red-500 hover:bg-red-50 rounded"
            title="Remove condition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function FilterModal({ isOpen, onClose, filters, onFiltersChange }: FilterModalProps) {
  if (!isOpen) return null;

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: `cond-${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      type: 'condition',
    };

    onFiltersChange({
      ...filters,
      conditions: [...filters.conditions, newCondition],
    });
  };

  const updateCondition = (index: number, condition: FilterCondition) => {
    const newConditions = [...filters.conditions];
    newConditions[index] = condition;
    onFiltersChange({ ...filters, conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    onFiltersChange({
      ...filters,
      conditions: filters.conditions.filter((_, i) => i !== index),
    });
  };

  const updateOperator = (operator: 'AND' | 'OR') => {
    onFiltersChange({ ...filters, operator });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add Filter</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick View Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Quick View Filter</h3>
            <p className="text-sm text-gray-600 mb-4">This filter will be available in reports view for quick updates.</p>
            
            {filters.conditions.length > 0 && (
              <div className="space-y-3">
                {filters.conditions.map((condition, index) => (
                  <FilterConditionEditor
                    key={condition.id}
                    condition={condition as FilterCondition}
                    onUpdate={(updated) => updateCondition(index, updated)}
                    onRemove={() => removeCondition(index)}
                    index={index}
                    groupOperator={filters.operator}
                    onOperatorChange={updateOperator}
                    showOperator={index > 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Advanced Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Advanced Filter</h3>
            <p className="text-sm text-gray-600 mb-4">Add criteria based on fields across all the related modules.</p>
            
            {filters.conditions.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm">No filters applied</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Filter" to start filtering your data</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={addCondition}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
          >
            <Plus size={16} />
            Add Filter
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}