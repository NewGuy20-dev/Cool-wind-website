import { NextResponse } from 'next/server';

interface Task {
  id: string;
  task_number: string;
  customer_name: string;
  phone_number: string;
  location: string | null;
  title: string;
  description: string | null;
  problem_description: string;
  status: string;
  priority: string;
  category: string | null;
  source: string;
  estimated_duration: string | null;
  actual_duration: string | null;
  due_date: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  ai_priority_reason: string | null;
  urgency_keywords: string[] | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  metadata: any;
  chat_context: any;
}

interface ApiResponse {
  success: boolean;
  data?: Task[];
  error?: string;
  count?: number;
}

// Mock data for comparison and testing
const mockTasks: Task[] = [
  {
    id: 'mock-1',
    task_number: 'TASK-001',
    customer_name: 'John Doe',
    phone_number: '9876543210',
    location: 'Thiruvalla, Kerala',
    title: 'AC Repair Request',
    description: 'AC not cooling properly',
    problem_description: 'AC unit is running but not producing cold air. Filter might be clogged.',
    status: 'pending',
    priority: 'high',
    category: 'AC Repair',
    source: 'admin-manual',
    estimated_duration: '2 hours',
    actual_duration: null,
    due_date: '2025-08-30',
    completed_at: null,
    assigned_to: null,
    assigned_at: null,
    ai_priority_reason: 'High priority due to hot weather',
    urgency_keywords: ['not cooling', 'hot weather'],
    created_at: '2025-08-28T10:00:00Z',
    updated_at: '2025-08-28T10:00:00Z',
    deleted_at: null,
    metadata: { source: 'debug-page' },
    chat_context: null
  },
  {
    id: 'mock-2',
    task_number: 'TASK-002',
    customer_name: 'Jane Smith',
    phone_number: '8765432109',
    location: 'Pathanamthitta, Kerala',
    title: 'Refrigerator Service',
    description: 'Refrigerator making strange noise',
    problem_description: 'Refrigerator is making loud humming noise and not maintaining temperature properly.',
    status: 'in_progress',
    priority: 'medium',
    category: 'Refrigerator Repair',
    source: 'admin-manual',
    estimated_duration: '3 hours',
    actual_duration: null,
    due_date: '2025-08-29',
    completed_at: null,
    assigned_to: 'tech-001',
    assigned_at: '2025-08-28T11:00:00Z',
    ai_priority_reason: 'Medium priority - food preservation issue',
    urgency_keywords: ['strange noise', 'temperature issue'],
    created_at: '2025-08-28T09:00:00Z',
    updated_at: '2025-08-28T11:00:00Z',
    deleted_at: null,
    metadata: { source: 'debug-page' },
    chat_context: null
  }
];

async function fetchTasks(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tasks?limit=100`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export default async function DebugPage() {
  const result = await fetchTasks();
  
  // Calculate statistics for real data
  const realTaskCount = result.data?.length || 0;
  const realStatusBreakdown = result.data?.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  // Calculate statistics for mock data
  const mockTaskCount = mockTasks.length;
  const mockStatusBreakdown = mockTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div style={{ fontFamily: 'monospace', padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        🔍 Admin Debug Page - Task Data Troubleshooting
      </h1>
      
      {/* Summary Statistics */}
      <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2 style={{ marginTop: 0, color: '#555' }}>📊 Summary</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3 style={{ color: '#666' }}>Real API Data</h3>
            <p><strong>Total Tasks:</strong> {realTaskCount}</p>
            <p><strong>API Response Success:</strong> {result.success ? '✅ Yes' : '❌ No'}</p>
            {result.error && (
              <p style={{ color: 'red' }}><strong>Error:</strong> {result.error}</p>
            )}
            
            {Object.keys(realStatusBreakdown).length > 0 && (
              <div>
                <p><strong>Status Breakdown:</strong></p>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  {Object.entries(realStatusBreakdown).map(([status, count]) => (
                    <li key={status}>{status}: {count}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div>
            <h3 style={{ color: '#666' }}>Mock Data (For Comparison)</h3>
            <p><strong>Total Tasks:</strong> {mockTaskCount}</p>
            <p><strong>Data Source:</strong> ✅ Hardcoded mock data</p>
            
            <div>
              <p><strong>Status Breakdown:</strong></p>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {Object.entries(mockStatusBreakdown).map(([status, count]) => (
                  <li key={status}>{status}: {count}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Raw JSON Data */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#555' }}>📄 Raw API Response</h2>
        <pre style={{ 
          backgroundColor: '#f8f8f8', 
          padding: '15px', 
          borderRadius: '5px', 
          overflow: 'auto',
          fontSize: '12px',
          border: '1px solid #ddd'
        }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>

      {/* Mock Data Display */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#555' }}>🧪 Mock Data (Frontend Rendering Test)</h2>
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          This section shows mock data to verify that the frontend table rendering is working correctly.
        </p>
        
        <div style={{ overflow: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            fontSize: '12px',
            border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Customer Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Phone</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Problem</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {mockTasks.map((task) => (
                <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '11px' }}>
                    {task.id.substring(0, 8)}...
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {task.customer_name}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {task.phone_number}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '3px', 
                      fontSize: '10px',
                      backgroundColor: 
                        task.status === 'completed' ? '#d4edda' :
                        task.status === 'in_progress' ? '#fff3cd' :
                        task.status === 'cancelled' ? '#f8d7da' : '#d1ecf1',
                      color: 
                        task.status === 'completed' ? '#155724' :
                        task.status === 'in_progress' ? '#856404' :
                        task.status === 'cancelled' ? '#721c24' : '#0c5460'
                    }}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', maxWidth: '200px' }}>
                    <div style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      maxWidth: '200px'
                    }}>
                      {task.problem_description}
                    </div>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '11px' }}>
                    {new Date(task.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Data Table (if available) */}
      {result.data && result.data.length > 0 ? (
        <div>
          <h2 style={{ color: '#555' }}>📋 Real API Data Table</h2>
          <div style={{ overflow: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              fontSize: '12px',
              border: '1px solid #ddd'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Customer Name</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Phone</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Problem</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((task) => (
                  <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '11px' }}>
                      {task.id.substring(0, 8)}...
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {task.customer_name}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {task.phone_number}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '3px', 
                        fontSize: '10px',
                        backgroundColor: 
                          task.status === 'completed' ? '#d4edda' :
                          task.status === 'in_progress' ? '#fff3cd' :
                          task.status === 'cancelled' ? '#f8d7da' : '#d1ecf1',
                        color: 
                          task.status === 'completed' ? '#155724' :
                          task.status === 'in_progress' ? '#856404' :
                          task.status === 'cancelled' ? '#721c24' : '#0c5460'
                      }}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', maxWidth: '200px' }}>
                      <div style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        maxWidth: '200px'
                      }}>
                        {task.problem_description}
                      </div>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '11px' }}>
                      {new Date(task.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7',
          borderRadius: '5px',
          color: '#856404'
        }}>
          <h3 style={{ marginTop: 0 }}>⚠️ No Real Tasks Found</h3>
          {result.error ? (
            <p>Error occurred while fetching tasks: {result.error}</p>
          ) : (
            <p>No tasks were returned from the API. This could indicate:</p>
          )}
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Database is empty</li>
            <li>API endpoint is not working correctly</li>
            <li>Authentication/permission issues</li>
            <li>Database connection problems</li>
            <li>Supabase environment variables not configured</li>
          </ul>
          
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '3px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>💡 Troubleshooting Tip:</strong> If you can see the mock data table above, 
              the frontend rendering is working correctly. The issue is with the backend API.
            </p>
          </div>
        </div>
      )}

      {/* Debug Information */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
        <h3 style={{ marginTop: 0, color: '#0c5460' }}>🔧 Debug Information</h3>
        <p><strong>Page Type:</strong> Server-Side Rendered (SSR)</p>
        <p><strong>Data Source:</strong> /api/tasks endpoint</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
        <p><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}</p>
        <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}</p>
      </div>
    </div>
  );
}