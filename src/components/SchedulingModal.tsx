import React, { useState } from 'react';
import { X, Calendar, Mail, Clock } from 'lucide-react';
import { ReportConfig, ScheduleConfig } from '../types';

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportConfig | null;
  onSchedule: (config: ScheduleConfig) => void;
}

export function SchedulingModal({ isOpen, onClose, report, onSchedule }: SchedulingModalProps) {
  const [config, setConfig] = useState<ScheduleConfig>({
    frequency: 'daily',
    time: '09:00',
    recipients: [''],
    includeData: true,
    format: 'csv',
  });

  if (!isOpen || !report) return null;

  const handleAddRecipient = () => {
    setConfig(prev => ({
      ...prev,
      recipients: [...prev.recipients, ''],
    }));
  };

  const handleRemoveRecipient = (index: number) => {
    setConfig(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  const handleRecipientChange = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      recipients: prev.recipients.map((email, i) => i === index ? value : email),
    }));
  };

  const handleSubmit = () => {
    const validRecipients = config.recipients.filter(email => email.trim());
    if (validRecipients.length === 0) return;

    onSchedule({
      ...config,
      recipients: validRecipients,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1">{report.name}</h3>
            {report.description && (
              <p className="text-sm text-gray-600">{report.description}</p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Frequency
            </label>
            <select
              value={config.frequency}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                frequency: e.target.value as any 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Time
            </label>
            <input
              type="time"
              value={config.time}
              onChange={(e) => setConfig(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Day of Week for Weekly */}
          {config.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                value={config.dayOfWeek || 1}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  dayOfWeek: Number(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
                <option value={0}>Sunday</option>
              </select>
            </div>
          )}

          {/* Day of Month for Monthly */}
          {config.frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Month
              </label>
              <select
                value={config.dayOfMonth || 1}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  dayOfMonth: Number(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 28 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email Recipients
            </label>
            <div className="space-y-2">
              {config.recipients.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleRecipientChange(index, e.target.value)}
                    placeholder="Enter email address..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {config.recipients.length > 1 && (
                    <button
                      onClick={() => handleRemoveRecipient(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddRecipient}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add another recipient
              </button>
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={config.format}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                format: e.target.value as any 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          {/* Include Data */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.includeData}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  includeData: e.target.checked 
                }))}
                className="mr-2"
              />
              Include data in email attachment
            </label>
            <p className="text-sm text-gray-500 mt-1">
              If unchecked, only a summary will be sent via email
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleSubmit}
            disabled={config.recipients.filter(email => email.trim()).length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  );
}