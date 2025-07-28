export interface Field {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  category: string;
  options?: string[];
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'between' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  type: 'condition';
}

export interface FilterGroup {
  id: string;
  type: 'group';
  operator: 'AND' | 'OR';
  conditions: (FilterCondition | FilterGroup)[];
}

export interface ReportColumn {
  id: string;
  fieldId: string;
  label: string;
  width?: number;
  sortable: boolean;
  visible: boolean;
}

export interface GroupBy {
  fieldId: string;
  direction: 'asc' | 'desc';
}

export interface ReportConfig {
  id: string;
  name: string;
  description?: string;
  module?: string;
  columns: ReportColumn[];
  filters: FilterGroup;
  groupBy: GroupBy[];
  sortBy: { fieldId: string; direction: 'asc' | 'desc' }[];
  pageSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface SampleData {
  id: string;
  sample_id: string;
  batch_number: string;
  product_name: string;
  test_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  analyst: string;
  created_date: string;
  completion_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  facility: string;
  result: string;
  specification: string;
  deviation_flag: boolean;
}

export interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients: string[];
  includeData: boolean;
  format: 'csv' | 'pdf' | 'excel';
}