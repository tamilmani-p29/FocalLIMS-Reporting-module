import React, { useState } from 'react';
import { Save, Copy, Trash2, Edit, Calendar, Play } from 'lucide-react';
import { ReportConfig } from '../types';
import { format } from 'date-fns';

interface SavedReportsProps {
  reports: ReportConfig[];
  currentReport: ReportConfig | null;
  onLoad: (report: ReportConfig) => void;
  onSave: (name: string, description?: string) => void;
  onClone: (report: ReportConfig) => void;
  onDelete: (reportId: string) => void;
  onRename: (reportId: string, newName: string) => void;
  onSchedule: (report: ReportConfig) => void;
}

export function SavedReports({
  reports,
  currentReport,
  onLoad,
  onSave,
  onClone,
  onDelete,
  onRename,
  onSchedule,
}: SavedReportsProps) {
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportDescription, setNewReportDescription] = useState('');
  const [editingReport, setEditingReport] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleSaveNewReport = () => {
    if (newReportName.trim()) {
      onSave(newReportName.trim(), newReportDescription.trim() || undefined);
      setNewReportName('');
      setNewReportDescription('');
      setIsNewReportModalOpen(false);
    }
  };

  const handleRename = (reportId: string) => {
    if (editName.trim()) {
      onRename(reportId, editName.trim());
      setEditingReport(null);
      setEditName('');
    }
  };

  const startEditing = (report: ReportConfig) => {
    setEditingReport(report.id);
    setEditName(report.name);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Saved Reports</h3>
        <button
          onClick={() => setIsNewReportModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Save size={16} />
          Save Current
        </button>
      </div>

      <div className="grid gap-4">
        {reports.map(report => (
          <div
            key={report.id}
            className={`p-4 border rounded-lg transition-colors hover:bg-gray-50 ${
              currentReport?.id === report.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {editingReport === report.id ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(report.id);
                        if (e.key === 'Escape') {
                          setEditingReport(null);
                          setEditName('');
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleRename(report.id)}
                      className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingReport(null);
                        setEditName('');
                      }}
                      className="px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-medium text-gray-900 truncate">
                      {report.name}
                    </h4>
                    {currentReport?.id === report.id && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                )}
                
                {report.description && (
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{report.columns.filter(c => c.visible).length} columns</span>
                  <span>{report.filters.conditions.length} filters</span>
                  <span>Updated {format(new Date(report.updatedAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => onLoad(report)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Load Report"
                >
                  <Play size={16} />
                </button>
                
                <button
                  onClick={() => onSchedule(report)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                  title="Schedule Report"
                >
                  <Calendar size={16} />
                </button>
                
                <button
                  onClick={() => startEditing(report)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                  title="Rename Report"
                >
                  <Edit size={16} />
                </button>
                
                <button
                  onClick={() => onClone(report)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                  title="Clone Report"
                >
                  <Copy size={16} />
                </button>
                
                <button
                  onClick={() => onDelete(report.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete Report"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No saved reports yet. Save your first report to get started.</p>
        </div>
      )}

      {/* New Report Modal */}
      {isNewReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Save Report</h2>
              <button
                onClick={() => setIsNewReportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Name *
                </label>
                <input
                  type="text"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  placeholder="Enter report name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newReportDescription}
                  onChange={(e) => setNewReportDescription(e.target.value)}
                  placeholder="Enter report description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setIsNewReportModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewReport}
                disabled={!newReportName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}