import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, MoreHorizontal, Download, Calendar } from 'lucide-react';
import { ReportColumn, SampleData } from '../types';
import { availableFields } from '../data/mockData';
import { format } from 'date-fns';

interface ReportTableProps {
  data: SampleData[];
  columns: ReportColumn[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onExport: () => void;
  onSchedule: () => void;
  rowGroups: string[];
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface NestedGroupData {
  [key: string]: SampleData[] | NestedGroupData;
}

export function ReportTable({ 
  data, 
  columns, 
  loading, 
  searchTerm, 
  onSearchChange,
  onExport,
  onSchedule,
  rowGroups 
}: ReportTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [resizing, setResizing] = useState<{ columnId: string; startX: number; startWidth: number } | null>(null);

  const visibleColumns = columns.filter(col => col.visible);

  const getColumnWidth = (column: ReportColumn) => {
    return columnWidths[column.id] || column.width || 150;
  };

  const handleMouseDown = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    const startX = e.clientX;
    const column = visibleColumns.find(col => col.id === columnId);
    const startWidth = getColumnWidth(column!);
    
    setResizing({ columnId, startX, startWidth });
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      const diff = e.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff);
      setColumnWidths(prev => ({ ...prev, [columnId]: newWidth }));
    };
    
    const handleMouseUp = () => {
      setResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof SampleData];
      const bValue = b[sortConfig.key as keyof SampleData];

      if (aValue === bValue) return 0;
      
      const result = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [data, sortConfig]);

  // Create nested grouping structure
  const createNestedGroups = (data: SampleData[], groupFields: string[]): NestedGroupData => {
    if (groupFields.length === 0) {
      return { 'All Data': data };
    }

    const [currentField, ...remainingFields] = groupFields;
    const groups: NestedGroupData = {};

    data.forEach(item => {
      const groupValue = item[currentField as keyof SampleData] as string;
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      (groups[groupValue] as SampleData[]).push(item);
    });

    // If there are more grouping levels, recursively group
    if (remainingFields.length > 0) {
      Object.keys(groups).forEach(key => {
        groups[key] = createNestedGroups(groups[key] as SampleData[], remainingFields);
      });
    }

    return groups;
  };

  const groupedData = useMemo(() => {
    return createNestedGroups(sortedData, rowGroups);
  }, [sortedData, rowGroups]);

  const handleSort = (columnKey: string) => {
    setSortConfig(current => {
      if (current?.key === columnKey) {
        return current.direction === 'asc' 
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const formatCellValue = (value: any, fieldId: string) => {
    if (value === null || value === undefined) return '-';
    
    if (fieldId.includes('date') && value) {
      try {
        return format(new Date(value), 'dd/MM/yyyy');
      } catch {
        return value;
      }
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCellContent = (value: any, fieldId: string) => {
    const formattedValue = formatCellValue(value, fieldId);
    
    if (fieldId === 'status') {
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
          {formattedValue}
        </span>
      );
    }
    
    if (fieldId === 'priority') {
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(value)}`}>
          {formattedValue}
        </span>
      );
    }
    
    if (fieldId === 'deviation_flag') {
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    if (fieldId === 'sample_id' || fieldId === 'product_name' || fieldId === 'analyst') {
      return (
        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
          {formattedValue}
        </span>
      );
    }
    
    return <span className="truncate">{formattedValue}</span>;
  };

  const countTotalRecords = (groups: NestedGroupData): number => {
    let total = 0;
    Object.values(groups).forEach(value => {
      if (Array.isArray(value)) {
        total += value.length;
      } else {
        total += countTotalRecords(value);
      }
    });
    return total;
  };

  const renderGroupRows = (
    groups: NestedGroupData, 
    level: number = 0, 
    parentKey: string = '',
    groupIndex: number = 0
  ): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];

    Object.entries(groups).forEach(([groupKey, groupData], index) => {
      const fullGroupKey = parentKey ? `${parentKey}-${groupKey}` : groupKey;
      const isExpanded = expandedGroups.has(fullGroupKey);
      
      if (Array.isArray(groupData)) {
        // This is the final level - render group header and data rows
        const groupField = rowGroups[level];
        const fieldLabel = availableFields.find(f => f.id === groupField)?.label || groupField;
        
        rows.push(
          <tr key={`group-${fullGroupKey}`} className="bg-gray-50">
            <td 
              className="px-6 py-3 text-sm font-medium text-gray-900 bg-blue-50 border-r border-gray-200 cursor-pointer hover:bg-blue-100"
              onClick={() => toggleGroup(fullGroupKey)}
              style={{ paddingLeft: `${24 + level * 20}px`, width: 200 }}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronUp size={14} />
                )}
                {groupIndex} - {groupKey} ({groupData.length})
              </div>
            </td>
            {visibleColumns.map(column => (
              <td key={column.id} className="px-6 py-3" style={{ width: getColumnWidth(column) }}></td>
            ))}
          </tr>
        );

        // Render data rows if expanded
        if (isExpanded) {
          groupData.forEach((row) => {
            rows.push(
              <tr 
                key={row.id} 
                className="hover:bg-gray-50 transition-colors"
              >
                <td 
                  className="px-6 py-4 text-sm text-gray-500 bg-blue-50 border-r border-gray-200"
                  style={{ paddingLeft: `${44 + level * 20}px`, width: 200 }}
                >
                  {/* Empty for data rows */}
                </td>
                {visibleColumns.map(column => (
                  <td 
                    key={column.id} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    style={{ width: getColumnWidth(column) }}
                  >
                    {renderCellContent(row[column.fieldId as keyof SampleData], column.fieldId)}
                  </td>
                ))}
              </tr>
            );
          });
        }
      } else {
        // This is a nested group - render group header and recurse
        const groupField = rowGroups[level];
        const fieldLabel = availableFields.find(f => f.id === groupField)?.label || groupField;
        const totalCount = countTotalRecords({ [groupKey]: groupData });
        
        rows.push(
          <tr key={`group-${fullGroupKey}`} className="bg-gray-50">
            <td 
              className="px-6 py-3 text-sm font-medium text-gray-900 bg-blue-50 border-r border-gray-200 cursor-pointer hover:bg-blue-100"
              onClick={() => toggleGroup(fullGroupKey)}
              style={{ paddingLeft: `${24 + level * 20}px`, width: 200 }}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronUp size={14} />
                )}
                {groupIndex} - {groupKey} ({totalCount})
              </div>
            </td>
            {visibleColumns.map(column => (
              <td key={column.id} className="px-6 py-3" style={{ width: getColumnWidth(column) }}></td>
            ))}
          </tr>
        );

        // Render nested groups if expanded
        if (isExpanded) {
          rows.push(...renderGroupRows(groupData, level + 1, fullGroupKey, 0));
        }
      }
    });

    return rows;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalRecords = countTotalRecords(groupedData);
  const groupHeaderLabel = rowGroups.length > 0 
    ? availableFields.find(f => f.id === rowGroups[0])?.label?.toUpperCase() || 'GROUP'
    : 'ANALYST';

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search in table..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSchedule}
            className="flex items-center gap-2 px-3 py-2 text-green-600 border border-green-300 rounded-md hover:bg-green-50 transition-colors"
          >
            <Calendar size={16} />
            Schedule
          </button>
          
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Group Header */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 border-r border-gray-200 relative" style={{ width: 200 }}>
                  <div className="flex items-center gap-2">
                    <span>{groupHeaderLabel}</span>
                    <ChevronDown size={12} className="text-gray-400" />
                  </div>
                </th>
                {visibleColumns.map((column, index) => (
                  <th
                    key={column.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors relative"
                    style={{ width: getColumnWidth(column) }}
                    onClick={() => column.sortable && handleSort(column.fieldId)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            size={12} 
                            className={`${
                              sortConfig?.key === column.fieldId && sortConfig.direction === 'asc'
                                ? 'text-blue-600' 
                                : 'text-gray-400'
                            }`}
                          />
                          <ChevronDown 
                            size={12} 
                            className={`-mt-1 ${
                              sortConfig?.key === column.fieldId && sortConfig.direction === 'desc'
                                ? 'text-blue-600' 
                                : 'text-gray-400'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleMouseDown(e, column.id)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderGroupRows(groupedData)}

              {/* Grand Total Row */}
              <tr className="bg-gray-100 font-medium">
                <td className="px-6 py-3 text-sm text-gray-900 bg-blue-100 border-r border-gray-200" style={{ width: 200 }}>
                  Grand Total
                </td>
                {visibleColumns.map(column => (
                  <td key={column.id} className="px-6 py-3 text-sm text-gray-900" style={{ width: getColumnWidth(column) }}>
                    {column.fieldId === 'sample_id' ? totalRecords : ''}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (page > totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm border rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}