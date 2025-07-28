import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Plus, Search, ChevronDown, Edit } from 'lucide-react';
import { ReportColumn } from '../types';
import { availableFields } from '../data/mockData';

interface ColumnSelectorProps {
  columns: ReportColumn[];
  onColumnsChange: (columns: ReportColumn[]) => void;
  rowGroups: string[];
  onRowGroupsChange: (groups: string[]) => void;
  columnGroups: string[];
  onColumnGroupsChange: (groups: string[]) => void;
}

interface SortableColumnProps {
  column: ReportColumn;
  onVisibilityToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

function SortableColumn({ column, onVisibilityToggle, onRemove }: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={14} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{column.label}</div>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onVisibilityToggle(column.id)}
          className={`p-1 rounded ${
            column.visible 
              ? 'text-blue-600 hover:bg-blue-50' 
              : 'text-gray-400 hover:bg-gray-50'
          }`}
        >
          {column.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        
        <button
          onClick={() => onRemove(column.id)}
          className="p-1 text-red-500 hover:bg-red-50 rounded text-xs"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ColumnSelector({ 
  columns, 
  onColumnsChange, 
  rowGroups, 
  onRowGroupsChange,
  columnGroups,
  onColumnGroupsChange 
}: ColumnSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('All Modules');
  const [selectedType, setSelectedType] = useState('All Types');
  const [showAddFields, setShowAddFields] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = columns.findIndex(col => col.id === active.id);
      const newIndex = columns.findIndex(col => col.id === over.id);
      onColumnsChange(arrayMove(columns, oldIndex, newIndex));
    }
  };

  const handleVisibilityToggle = (columnId: string) => {
    onColumnsChange(
      columns.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleRemove = (columnId: string) => {
    onColumnsChange(columns.filter(col => col.id !== columnId));
  };

  const availableToAdd = availableFields.filter(
    field => !columns.some(col => col.fieldId === field.id) &&
    (searchTerm === '' || field.label.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addColumn = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    if (!field) return;

    const newColumn: ReportColumn = {
      id: `col-${Date.now()}`,
      fieldId: field.id,
      label: field.label,
      width: 150,
      sortable: true,
      visible: true,
    };

    onColumnsChange([...columns, newColumn]);
  };

  const handleSelectAll = () => {
    onColumnsChange(
      columns.map(col => ({ ...col, visible: true }))
    );
  };

  const handleClearAll = () => {
    onColumnsChange(
      columns.map(col => ({ ...col, visible: false }))
    );
  };

  const addRowGroup = (fieldId: string) => {
    if (!rowGroups.includes(fieldId)) {
      onRowGroupsChange([...rowGroups, fieldId]);
    }
  };

  const removeRowGroup = (fieldId: string) => {
    onRowGroupsChange(rowGroups.filter(id => id !== fieldId));
  };

  return (
    <div className="space-y-6">
      {/* Columns Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Columns</h3>
          <button
            onClick={() => setShowAddFields(!showAddFields)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add
          </button>
        </div>

        {/* Add Fields Section */}
        {showAddFields && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
            {/* Module and Type Filters */}
            <div className="space-y-2">
              <div className="relative">
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option>All Modules</option>
                  <option>Sample Info</option>
                  <option>Testing</option>
                  <option>Progress</option>
                  <option>Personnel</option>
                  <option>Timeline</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option>All Types</option>
                  <option>Text</option>
                  <option>Number</option>
                  <option>Date</option>
                  <option>Select</option>
                  <option>Boolean</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Available Fields */}
            <div className="max-h-48 overflow-y-auto space-y-1">
              {availableToAdd.map(field => (
                <label
                  key={field.id}
                  className="flex items-center p-2 hover:bg-white rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    onChange={() => addColumn(field.id)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{field.label}</div>
                    <div className="text-xs text-gray-500">{field.category}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-2 border-t">
              <button
                onClick={() => setShowAddFields(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddFields(false)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Selected Columns */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{columns.filter(c => c.visible).length} of {columns.length} selected</span>
            <div className="space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={columns.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {columns.map(column => (
                  <SortableColumn
                    key={column.id}
                    column={column}
                    onVisibilityToggle={handleVisibilityToggle}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Row Groups Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Row Groups</h3>
          <Edit size={16} className="text-gray-400" />
        </div>
        
        <div className="space-y-2">
          {rowGroups.length === 0 ? (
            <div className="text-sm text-gray-500">No Group Selected</div>
          ) : (
            rowGroups.map(groupId => {
              const field = availableFields.find(f => f.id === groupId);
              return (
                <div key={groupId} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <GripVertical size={14} className="text-gray-400" />
                  <span className="flex-1 text-sm">{field?.label}</span>
                  <button
                    onClick={() => removeRowGroup(groupId)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded text-xs"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
          
          <select
            onChange={(e) => {
              if (e.target.value) {
                addRowGroup(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Add Row Group...</option>
            {availableFields
              .filter(field => !rowGroups.includes(field.id))
              .map(field => (
                <option key={field.id} value={field.id}>{field.label}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Column Groups Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Column Groups</h3>
          <Edit size={16} className="text-gray-400" />
        </div>
        
        <div className="space-y-2">
          {columnGroups.length === 0 ? (
            <div className="text-sm text-gray-500">No Group Selected</div>
          ) : (
            columnGroups.map(groupId => {
              const field = availableFields.find(f => f.id === groupId);
              return (
                <div key={groupId} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <GripVertical size={14} className="text-gray-400" />
                  <span className="flex-1 text-sm">{field?.label}</span>
                  <button
                    onClick={() => onColumnGroupsChange(columnGroups.filter(id => id !== groupId))}
                    className="text-red-500 hover:bg-red-50 p-1 rounded text-xs"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
          
          <select
            onChange={(e) => {
              if (e.target.value && !columnGroups.includes(e.target.value)) {
                onColumnGroupsChange([...columnGroups, e.target.value]);
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Add Column Group...</option>
            {availableFields
              .filter(field => !columnGroups.includes(field.id))
              .map(field => (
                <option key={field.id} value={field.id}>{field.label}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Aggregate Columns Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Aggregate Columns</h3>
          <Edit size={16} className="text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <GripVertical size={14} className="text-gray-400" />
            <span className="flex-1 text-sm">Sum of Expected Rev...</span>
          </div>
        </div>
      </div>
    </div>
  );
}