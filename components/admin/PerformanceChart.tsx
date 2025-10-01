'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DailyStat {
  date: string;
  tasks_created: number;
  tasks_completed: number;
  urgent_tasks: number;
  high_priority_tasks: number;
  failed_call_tasks: number;
  completion_rate_percent: number;
}

interface PerformanceChartProps {
  data: DailyStat[] | any[];
  type: 'line' | 'bar' | 'pie';
  metric: 'tasks' | 'completion' | 'priority';
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function PerformanceChart({ data, type = 'line', metric = 'tasks' }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-sm text-gray-500">No data available for chart</p>
        </div>
      </div>
    );
  }

  // For single data points, we'll show a simpler visualization
  const isSingleDataPoint = data.length === 1;

  // Prepare data based on metric type
  const prepareData = () => {
    switch (metric) {
      case 'tasks':
        return data.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          created: item.tasks_created,
          completed: item.tasks_completed,
          failed_calls: item.failed_call_tasks
        }));
      
      case 'completion':
        return data.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rate: item.completion_rate_percent
        }));
      
      case 'priority':
        // For pie chart - aggregate priority data
        const totalUrgent = data.reduce((sum, item) => sum + item.urgent_tasks, 0);
        const totalHigh = data.reduce((sum, item) => sum + item.high_priority_tasks, 0);
        const totalOther = data.reduce((sum, item) => sum + Math.max(0, item.tasks_created - item.urgent_tasks - item.high_priority_tasks), 0);
        
        return [
          { name: 'Urgent', value: totalUrgent, color: '#EF4444' },
          { name: 'High', value: totalHigh, color: '#F59E0B' },
          { name: 'Medium/Low', value: totalOther, color: '#10B981' }
        ].filter(item => item.value > 0);
      
      default:
        return data;
    }
  };

  const chartData = prepareData();

  // Special case for single data point - show as simple metrics
  if (isSingleDataPoint && metric === 'tasks') {
    const todayData = data[0];
    return (
      <div className="h-48 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
        <div className="w-full">
          <div className="text-center mb-4">
            <div className="text-lg font-semibold text-gray-800">📊 Today's Task Overview</div>
            <div className="text-sm text-gray-600">Real-time metrics for {new Date(todayData.date).toLocaleDateString()}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 px-4">
            <div className="bg-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
              <div className="text-2xl font-bold text-blue-700">{todayData.tasks_created}</div>
              <div className="text-xs text-blue-600 mt-1">📝 Created Today</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg border border-green-200 shadow-sm">
              <div className="text-2xl font-bold text-green-700">{todayData.tasks_completed}</div>
              <div className="text-xs text-green-600 mt-1">✅ Completed Today</div>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg border border-orange-200 shadow-sm">
              <div className="text-2xl font-bold text-orange-700">{todayData.failed_call_tasks}</div>
              <div className="text-xs text-orange-600 mt-1">📞 Failed Calls</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    // Use data directly if it's already in the right format for pie charts
    const pieData = data.length > 0 && data[0].name ? data : chartData;
    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'Tasks']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'bar') {
    // Use data directly if it's already in the right format for bar charts
    const barData = data.length > 0 && data[0].name ? data : chartData;
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          {metric === 'priority' && (
            <>
              <Bar dataKey="urgent" fill="#EF4444" name="Urgent" radius={[2, 2, 0, 0]} />
              <Bar dataKey="high" fill="#F59E0B" name="High" radius={[2, 2, 0, 0]} />
              <Bar dataKey="medium" fill="#10B981" name="Medium/Low" radius={[2, 2, 0, 0]} />
            </>
          )}
          {metric === 'tasks' && (
            <>
              <Bar dataKey="created" fill="#3B82F6" name="Created" radius={[2, 2, 0, 0]} />
              <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[2, 2, 0, 0]} />
              <Bar dataKey="failed_calls" fill="#F59E0B" name="Failed Calls" radius={[2, 2, 0, 0]} />
            </>
          )}
          {metric === 'completion' && (
            <Bar dataKey="rate" fill="#10B981" name="Completion Rate %" radius={[2, 2, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Default to line chart
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          stroke="#6B7280"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#6B7280"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        {metric === 'tasks' && (
          <>
            <Line 
              type="monotone" 
              dataKey="created" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              name="Created"
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              name="Completed"
            />
            <Line 
              type="monotone" 
              dataKey="failed_calls" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              name="Failed Calls"
            />
          </>
        )}
        {metric === 'completion' && (
          <Line 
            type="monotone" 
            dataKey="rate" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            name="Completion Rate %"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Quick metrics display component
export function MetricsDisplay({ data }: { data: DailyStat[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No metrics data available
      </div>
    );
  }

  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : null;
  
  const calculateTrend = (current: number, previous: number | null) => {
    if (previous === null || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const completionTrend = calculateTrend(latest.completion_rate_percent, previous?.completion_rate_percent || null);
  const tasksTrend = calculateTrend(latest.tasks_created, previous?.tasks_created || null);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <div className="text-2xl font-bold text-blue-700">
          {latest.tasks_created}
        </div>
        <div className="text-xs text-blue-600">Tasks Created Today</div>
        {tasksTrend !== 0 && (
          <div className={`text-xs ${tasksTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {tasksTrend > 0 ? '↗' : '↘'} {Math.abs(tasksTrend).toFixed(1)}%
          </div>
        )}
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
        <div className="text-2xl font-bold text-green-700">
          {latest.completion_rate_percent.toFixed(1)}%
        </div>
        <div className="text-xs text-green-600">Completion Rate</div>
        {completionTrend !== 0 && (
          <div className={`text-xs ${completionTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {completionTrend > 0 ? '↗' : '↘'} {Math.abs(completionTrend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
