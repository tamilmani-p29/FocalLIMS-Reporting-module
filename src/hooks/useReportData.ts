import { useState, useEffect, useMemo } from 'react';
import { SampleData, FilterGroup, FilterCondition, ReportConfig } from '../types';
import { mockSampleData, availableFields } from '../data/mockData';

export function useReportData(config: ReportConfig | null) {
  const [data, setData] = useState<SampleData[]>(mockSampleData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const evaluateCondition = (item: SampleData, condition: FilterCondition): boolean => {
    const fieldValue = item[condition.field as keyof SampleData];
    const { operator, value } = condition;

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(fieldValue);
      case 'between':
        return Array.isArray(value) && value.length === 2 && 
               Number(fieldValue) >= Number(value[0]) && 
               Number(fieldValue) <= Number(value[1]);
      default:
        return true;
    }
  };

  const evaluateFilterGroup = (item: SampleData, group: FilterGroup): boolean => {
    if (group.conditions.length === 0) return true;

    const results = group.conditions.map(condition => {
      if (condition.type === 'group') {
        return evaluateFilterGroup(item, condition as FilterGroup);
      } else {
        return evaluateCondition(item, condition as FilterCondition);
      }
    });

    return group.operator === 'AND' 
      ? results.every(Boolean) 
      : results.some(Boolean);
  };

  const filteredData = useMemo(() => {
    if (!config) return data;

    let filtered = [...data];

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    filtered = filtered.filter(item => evaluateFilterGroup(item, config.filters));

    // Apply sorting
    if (config.sortBy.length > 0) {
      filtered.sort((a, b) => {
        for (const sort of config.sortBy) {
          const aVal = a[sort.fieldId as keyof SampleData];
          const bVal = b[sort.fieldId as keyof SampleData];
          
          if (aVal === bVal) continue;
          
          const result = aVal < bVal ? -1 : 1;
          return sort.direction === 'asc' ? result : -result;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, config, searchTerm]);

  return {
    data: filteredData,
    loading,
    searchTerm,
    setSearchTerm,
    refetch: () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setData([...mockSampleData]);
        setLoading(false);
      }, 500);
    }
  };
}