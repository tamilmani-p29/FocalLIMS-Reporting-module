import React, { useState, useCallback } from 'react';
import { BarChart3, Settings, FileText, Calendar, Play, Save as SaveIcon, ArrowLeft } from 'lucide-react';
import { ReportConfig, FilterGroup, ReportColumn, ScheduleConfig } from '../types';
import { savedReports as initialSavedReports, availableFields } from '../data/mockData';
import { useReportData } from '../hooks/useReportData';
import { ColumnSelector } from './ColumnSelector';
import { FilterBuilder } from './FilterBuilder';
import { ReportTable } from './ReportTable';
import { ExportModal } from './ExportModal';
import { SavedReports } from './SavedReports';
import { SchedulingModal } from './SchedulingModal';
import { ReportsManagement } from './ReportsManagement';

const defaultColumns: ReportColumn[] = [
  { id: 'col-1', fieldId: 'sample_id', label: 'Sample ID', width: 150, sortable: true, visible: true },
  { id: 'col-2', fieldId: 'product_name', label: 'Product Name', width: 200, sortable: true, visible: true },
  { id: 'col-3', fieldId: 'test_type', label: 'Test Type', width: 120, sortable: true, visible: true },
  { id: 'col-4', fieldId: 'status', label: 'Status', width: 100, sortable: true, visible: true },
  { id: 'col-5', fieldId: 'priority', label: 'Priority', width: 100, sortable: true, visible: true },
  { id: 'col-6', fieldId: 'analyst', label: 'Analyst', width: 150, sortable: true, visible: true },
  { id: 'col-7', fieldId: 'created_date', label: 'Created Date', width: 180, sortable: true, visible: true },
];

const defaultFilters: FilterGroup = {
  id: 'root',
  type: 'group',
  operator: 'AND',
  conditions: [],
};

export function ReportingModule() {
  const [currentReport, setCurrentReport] = useState<ReportConfig | null>(null);
  const [columns, setColumns] = useState<ReportColumn[]>(defaultColumns);
  const [filters, setFilters] = useState<FilterGroup>(defaultFilters);
  const [rowGroups, setRowGroups] = useState<string[]>(['analyst']); // Default to analyst grouping
  const [columnGroups, setColumnGroups] = useState<string[]>([]);
  const [savedReports, setSavedReports] = useState(initialSavedReports);
  const [activeTab, setActiveTab] = useState<'columns' | 'filters'>('columns');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [reportToSchedule, setReportToSchedule] = useState<ReportConfig | null>(null);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [showReportsManagement, setShowReportsManagement] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [viewMode, setViewMode] = useState(false);

  // Create current report config
  const reportConfig: ReportConfig = {
    id: currentReport?.id || 'temp',
    name: currentReport?.name || 'Untitled Report',
    description: currentReport?.description,
    module: selectedModule || 'samples',
    columns,
    filters,
    groupBy: rowGroups.map(fieldId => ({ fieldId, direction: 'asc' as const })),
    sortBy: [{ fieldId: 'created_date', direction: 'desc' }],
    pageSize: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, loading, searchTerm, setSearchTerm, refetch } = useReportData(reportConfig);

  const handleCreateReport = useCallback((module: string) => {
    setSelectedModule(module);
    setShowReportsManagement(false);
    setCurrentReport(null);
    setColumns(defaultColumns);
    setFilters(defaultFilters);
    setRowGroups(['analyst']);
    setViewMode(false);
  }, []);

  const handleEditReport = useCallback((report: ReportConfig) => {
    setCurrentReport(report);
    setSelectedModule(report.module || 'samples');
    setColumns(report.columns);
    setFilters(report.filters);
    setRowGroups(report.groupBy.map(g => g.fieldId));
    setShowReportsManagement(false);
    setViewMode(false);
  }, []);

  const handleViewReport = useCallback((report: ReportConfig) => {
    setCurrentReport(report);
    setSelectedModule(report.module || 'samples');
    setColumns(report.columns);
    setFilters(report.filters);
    setRowGroups(report.groupBy.map(g => g.fieldId));
    setShowReportsManagement(false);
    setViewMode(true);
  }, []);

  const handleLoadReport = useCallback((report: ReportConfig) => {
    setCurrentReport(report);
    setColumns(report.columns);
    setFilters(report.filters);
    setRowGroups(report.groupBy.map(g => g.fieldId));
    setShowSavedReports(false);
  }, []);

  const handleSaveReport = useCallback((name: string, description?: string) => {
    const newReport: ReportConfig = {
      ...reportConfig,
      id: `rpt-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedReports(prev => [...prev, newReport]);
    setCurrentReport(newReport);
  }, [reportConfig]);

  const handleCloneReport = useCallback((report: ReportConfig) => {
    const clonedReport: ReportConfig = {
      ...report,
      id: `rpt-${Date.now()}`,
      name: `${report.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedReports(prev => [...prev, clonedReport]);
  }, []);

  const handleDeleteReport = useCallback((reportId: string) => {
    setSavedReports(prev => prev.filter(r => r.id !== reportId));
    if (currentReport?.id === reportId) {
      setCurrentReport(null);
    }
  }, [currentReport]);

  const handleRenameReport = useCallback((reportId: string, newName: string) => {
    setSavedReports(prev =>
      prev.map(report =>
        report.id === reportId
          ? { ...report, name: newName, updatedAt: new Date().toISOString() }
          : report
      )
    );

    if (currentReport?.id === reportId) {
      setCurrentReport(prev => prev ? { ...prev, name: newName } : null);
    }
  }, [currentReport]);

  const handleExport = useCallback((selectedColumnIds: string[], format: string) => {
    const selectedColumns = columns.filter(col => selectedColumnIds.includes(col.id));
    
    if (format === 'csv') {
      const csvHeaders = selectedColumns.map(col => col.label).join(',');
      const csvRows = data.map(row =>
        selectedColumns.map(col => {
          const value = row[col.fieldId as keyof typeof row];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      );

      const csvContent = [csvHeaders, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportConfig.name}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // For PDF export, we'll create a simple HTML table and print it
      const htmlContent = `
        <html>
          <head>
            <title>${reportConfig.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>${reportConfig.name}</h1>
            <table>
              <thead>
                <tr>
                  ${selectedColumns.map(col => `<th>${col.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map(row => 
                  `<tr>
                    ${selectedColumns.map(col => 
                      `<td>${row[col.fieldId as keyof typeof row] || ''}</td>`
                    ).join('')}
                  </tr>`
                ).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }, [columns, data, reportConfig.name]);

  const handleSchedule = useCallback((report: ReportConfig) => {
    setReportToSchedule(report);
    setIsSchedulingModalOpen(true);
  }, []);

  const handleScheduleSubmit = useCallback((config: ScheduleConfig) => {
    console.log('Scheduling report:', reportToSchedule, 'with config:', config);
    alert('Report scheduled successfully! You will receive emails according to your schedule.');
    setIsSchedulingModalOpen(false);
    setReportToSchedule(null);
  }, [reportToSchedule]);

  const handleBackToManagement = () => {
    setShowReportsManagement(true);
    setCurrentReport(null);
    setViewMode(false);
  };

  if (showReportsManagement) {
    return (
      <ReportsManagement
        reports={savedReports}
        onCreateReport={handleCreateReport}
        onEditReport={handleEditReport}
        onViewReport={handleViewReport}
        onCloneReport={handleCloneReport}
        onDeleteReport={handleDeleteReport}
        onScheduleReport={handleSchedule}
      />
    );
  }

  if (showSavedReports) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToManagement}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <ArrowLeft size={20} />
                </button>
                <BarChart3 className="text-blue-600" size={28} />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Pharma LIMS Reports
                  </h1>
                  <p className="text-sm text-gray-500">Saved Reports</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowSavedReports(false)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Settings size={16} />
                Report Builder
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SavedReports
              reports={savedReports}
              currentReport={currentReport}
              onLoad={handleLoadReport}
              onSave={handleSaveReport}
              onClone={handleCloneReport}
              onDelete={handleDeleteReport}
              onRename={handleRenameReport}
              onSchedule={handleSchedule}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToManagement}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft size={20} />
              </button>
              <BarChart3 className="text-blue-600" size={28} />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentReport ? currentReport.name : 'Pharma LIMS Pipeline'}
                </h1>
                <p className="text-sm text-gray-500">
                  {selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1)} Module
                  {viewMode && ' - View Mode'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!viewMode && (
                <>
                  <button
                    onClick={() => setShowSavedReports(true)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={16} />
                    Saved Reports ({savedReports.length})
                  </button>
                  
                  <button
                    onClick={refetch}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <Play size={16} />
                    Run
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => {
                        const name = prompt('Enter report name:');
                        if (name) handleSaveReport(name);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <SaveIcon size={16} />
                      Save
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Only show in edit mode */}
          {!viewMode && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    <button
                      onClick={() => setActiveTab('columns')}
                      className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'columns'
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Columns
                    </button>
                    <button
                      onClick={() => setActiveTab('filters')}
                      className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'filters'
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Filters
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'columns' ? (
                    <ColumnSelector 
                      columns={columns} 
                      onColumnsChange={setColumns}
                      rowGroups={rowGroups}
                      onRowGroupsChange={setRowGroups}
                      columnGroups={columnGroups}
                      onColumnGroupsChange={setColumnGroups}
                    />
                  ) : (
                    <FilterBuilder filters={filters} onFiltersChange={setFilters} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Preview Notice - Only show in edit mode */}
              {!viewMode && (
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      </div>
                      Preview shown with limited number of rows. Run the report to see actual aggregate values.
                    </div>
                  </div>
                </div>
              )}

              {/* Table Content */}
              <div className="p-6">
                <ReportTable
                  data={data}
                  columns={columns}
                  loading={loading}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onExport={() => setIsExportModalOpen(true)}
                  onSchedule={() => setIsSchedulingModalOpen(true)}
                  rowGroups={rowGroups}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        columns={columns}
        onExport={handleExport}
      />

      {/* Scheduling Modal */}
      <SchedulingModal
        isOpen={isSchedulingModalOpen}
        onClose={() => setIsSchedulingModalOpen(false)}
        report={reportToSchedule || reportConfig}
        onSchedule={handleScheduleSubmit}
      />
    </div>
  );
}