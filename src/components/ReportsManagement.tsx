import React, { useState } from 'react';
import { BarChart3, Plus, Search, Filter, Calendar, FileText, Edit, Copy, Trash2, Eye } from 'lucide-react';
import { ReportConfig } from '../types';
import { format } from 'date-fns';

interface ReportsManagementProps {
  reports: ReportConfig[];
  onCreateReport: (module: string) => void;
  onEditReport: (report: ReportConfig) => void;
  onViewReport: (report: ReportConfig) => void;
  onCloneReport: (report: ReportConfig) => void;
  onDeleteReport: (reportId: string) => void;
  onScheduleReport: (report: ReportConfig) => void;
}

const modules = [
  { id: 'samples', name: 'Samples', description: 'Sample tracking and management reports' },
  { id: 'tests', name: 'Tests', description: 'Testing procedures and results reports' },
  { id: 'instruments', name: 'Instruments', description: 'Equipment and calibration reports' },
  { id: 'inventory', name: 'Inventory', description: 'Stock and materials management reports' },
  { id: 'quality', name: 'Quality Control', description: 'QC and compliance reports' },
  { id: 'personnel', name: 'Personnel', description: 'Staff and training reports' },
];

export function ReportsManagement({
  reports,
  onCreateReport,
  onEditReport,
  onViewReport,
  onCloneReport,
  onDeleteReport,
  onScheduleReport,
}: ReportsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesModule = selectedModule === 'all' || report.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateReport = (moduleId: string) => {
    onCreateReport(moduleId);
    setShowModuleSelector(false);
  };

  const getModuleName = (moduleId: string) => {
    return modules.find(m => m.id === moduleId)?.name || 'Unknown';
  };

  const getStatusColor = (report: ReportConfig) => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(report.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate < 7) return 'bg-green-100 text-green-800';
    if (daysSinceUpdate < 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-blue-600" size={28} />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Reports Management
                </h1>
                <p className="text-sm text-gray-500">
                  Pharma LIMS Reporting Module
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowModuleSelector(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Create Report
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>{module.name}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{filteredReports.length} reports</span>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid gap-4">
          {paginatedReports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewReport(report)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {report.name}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report)}`}>
                      {getModuleName(report.module || 'samples')}
                    </span>
                  </div>
                  
                  {report.description && (
                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  )}
                  
                  <div className="flex items-center gap-6 text-xs text-gray-500">
                    <span>{report.columns.filter(c => c.visible).length} columns</span>
                    <span>{report.filters.conditions.length} filters</span>
                    <span>{report.groupBy.length} groups</span>
                    <span>Updated {format(new Date(report.updatedAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewReport(report);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                    title="View Report"
                  >
                    <Eye size={16} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditReport(report);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Edit Report"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onScheduleReport(report);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                    title="Schedule Report"
                  >
                    <Calendar size={16} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloneReport(report);
                    }}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                    title="Clone Report"
                  >
                    <Copy size={16} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteReport(report.id);
                    }}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReports.length)} of {filteredReports.length} reports
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
              ))}
              
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

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search criteria' : 'Create your first report to get started'}
            </p>
            <button
              onClick={() => setShowModuleSelector(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Create Report
            </button>
          </div>
        )}
      </div>

      {/* Module Selector Modal */}
      {showModuleSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Select Module</h2>
              <button
                onClick={() => setShowModuleSelector(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Choose the module you want to create a report for:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {modules.map(module => (
                  <button
                    key={module.id}
                    onClick={() => handleCreateReport(module.id)}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">{module.name}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}