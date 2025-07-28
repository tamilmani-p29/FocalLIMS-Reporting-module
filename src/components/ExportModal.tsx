import React, { useState } from 'react';
import { X, Download, FileText, File } from 'lucide-react';
import { ReportColumn } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ReportColumn[];
  onExport: (selectedColumns: string[], format: string) => void;
}

export function ExportModal({ isOpen, onClose, columns, onExport }: ExportModalProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.filter(col => col.visible).map(col => col.id)
  );
  const [format, setFormat] = useState<string>('csv');
  const [includeHeaders, setIncludeHeaders] = useState(true);

  if (!isOpen) return null;

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(columns.map(col => col.id));
  };

  const handleSelectNone = () => {
    setSelectedColumns([]);
  };

  const handleExport = () => {
    onExport(selectedColumns, format);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Export Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                <FileText size={16} className="mr-2 text-gray-500" />
                CSV (Comma Separated Values)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                <File size={16} className="mr-2 text-gray-500" />
                PDF (Portable Document Format)
              </label>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="mr-2"
              />
              Include column headers
            </label>
          </div>

          {/* Column Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Columns ({selectedColumns.length} of {columns.length})
              </label>
              <div className="space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={handleSelectNone}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Select None
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
              {columns.map(column => (
                <label
                  key={column.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.id)}
                    onChange={() => handleColumnToggle(column.id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {column.label}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selectedColumns.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={16} />
            Export ({selectedColumns.length} columns)
          </button>
        </div>
      </div>
    </div>
  );
}