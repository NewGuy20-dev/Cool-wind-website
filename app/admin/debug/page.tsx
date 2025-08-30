/**
 * Database Debug Console
 * Comprehensive debugging page for database connectivity and API health
 */

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
  message?: string;
  count?: number;
  source?: string;
}

interface DebugResponse {
  timestamp: string;
  service: {
    name: string;
    version?: string;
    status: string;
  };
  environment: {
    SUPABASE_URL: boolean;
    SUPABASE_ANON_KEY: boolean;
    SUPABASE_SERVICE_ROLE_KEY: boolean;
    NODE_ENV: string;
    validationStatus: string;
    validationError?: string;
  };
  database: {
    connected: boolean;
    latency?: number;
    error?: any;
    testQuery?: any;
  };
  connectivity?: any;
  recommendations?: string[];
  error?: any;
}

export default async function DebugPage() {
  let debugData: DebugResponse | null = null;
  let tasksData: ApiResponse | null = null;
  let debugError: string | null = null;
  let tasksError: string | null = null;

  // Fetch debug information
  try {
    const debugRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/debug/db`,
      { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!debugRes.ok) {
      debugError = `Debug API returned ${debugRes.status}: ${debugRes.statusText}`;
      debugData = await debugRes.json().catch(() => null);
    } else {
      debugData = await debugRes.json();
    }
  } catch (error: any) {
    debugError = `Failed to fetch debug data: ${error.message}`;
  }

  // Fetch tasks data
  try {
    const tasksRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/tasks?limit=5`,
      { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!tasksRes.ok) {
      tasksError = `Tasks API returned ${tasksRes.status}: ${tasksRes.statusText}`;
      tasksData = await tasksRes.json().catch(() => null);
    } else {
      tasksData = await tasksRes.json();
    }
  } catch (error: any) {
    tasksError = `Failed to fetch tasks data: ${error.message}`;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#22c55e';
      case 'unhealthy': return '#ef4444';
      case 'error': return '#f59e0b';
      case 'environment_error': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (connected: boolean | undefined) => {
    if (connected === true) return '✅';
    if (connected === false) return '❌';
    return '⚠️';
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          🔧 Database Debug Console
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Comprehensive debugging and health monitoring for the task management system
        </p>
      </div>

      {/* Service Status Overview */}
      <div style={{ 
        backgroundColor: debugData?.service?.status === 'healthy' ? '#dcfce7' : '#fef2f2',
        border: `2px solid ${debugData?.service?.status === 'healthy' ? '#22c55e' : '#ef4444'}`,
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: debugData?.service?.status === 'healthy' ? '#15803d' : '#dc2626',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {debugData?.service?.status === 'healthy' ? '✅' : '❌'}
          System Status: {debugData?.service?.status || 'Unknown'}
        </h2>
        <p style={{ color: '#374151', margin: '0' }}>
          Last checked: {debugData?.timestamp ? new Date(debugData.timestamp).toLocaleString() : 'Unknown'}
        </p>
      </div>

      {/* Debug API Results */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          🔍 Debug API Results
        </h2>
        
        {debugError && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            color: '#991b1b', 
            padding: '16px', 
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <strong>Debug API Error:</strong> {debugError}
          </div>
        )}
        
        <div style={{ 
          backgroundColor: '#f9fafb', 
          border: '1px solid #e5e7eb', 
          borderRadius: '6px', 
          padding: '16px' 
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
            {/* Environment Status */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Environment Configuration
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SUPABASE_URL:</span>
                  <span>{getStatusIcon(debugData?.environment?.SUPABASE_URL)} {debugData?.environment?.SUPABASE_URL ? 'Set' : 'Missing'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SUPABASE_ANON_KEY:</span>
                  <span>{getStatusIcon(debugData?.environment?.SUPABASE_ANON_KEY)} {debugData?.environment?.SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SUPABASE_SERVICE_ROLE_KEY:</span>
                  <span>{getStatusIcon(debugData?.environment?.SUPABASE_SERVICE_ROLE_KEY)} {debugData?.environment?.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>NODE_ENV:</span>
                  <span>{debugData?.environment?.NODE_ENV || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Database Status */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Database Connectivity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Connection:</span>
                  <span style={{ color: debugData?.database?.connected ? '#22c55e' : '#ef4444' }}>
                    {getStatusIcon(debugData?.database?.connected)} {debugData?.database?.connected ? 'Connected' : 'Failed'}
                  </span>
                </div>
                {debugData?.database?.latency && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Latency:</span>
                    <span style={{ color: (debugData.database.latency || 0) < 500 ? '#22c55e' : '#f59e0b' }}>
                      {debugData.database.latency}ms
                    </span>
                  </div>
                )}
                {debugData?.database?.testQuery && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Test Query:</span>
                    <span style={{ color: debugData.database.testQuery.success ? '#22c55e' : '#ef4444' }}>
                      {getStatusIcon(debugData.database.testQuery.success)} {debugData.database.testQuery.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {debugData?.environment?.validationError && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fca5a5', 
              color: '#991b1b', 
              padding: '12px', 
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <strong>Environment Validation Error:</strong>
              <br />
              {debugData.environment.validationError}
            </div>
          )}

          {/* Database Errors */}
          {debugData?.database?.error && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fca5a5', 
              color: '#991b1b', 
              padding: '12px', 
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <strong>Database Error:</strong>
              <br />
              <strong>Message:</strong> {debugData.database.error.message}
              {debugData.database.error.code && (
                <>
                  <br />
                  <strong>Code:</strong> {debugData.database.error.code}
                </>
              )}
              {debugData.database.error.hint && (
                <>
                  <br />
                  <strong>Hint:</strong> {debugData.database.error.hint}
                </>
              )}
            </div>
          )}

          {/* Recommendations */}
          {debugData?.recommendations && debugData.recommendations.length > 0 && (
            <div style={{ 
              backgroundColor: '#fffbeb', 
              border: '1px solid #fed7aa', 
              color: '#92400e', 
              padding: '12px', 
              borderRadius: '6px'
            }}>
              <strong>💡 Troubleshooting Recommendations:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                {debugData.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Tasks API Test */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          📋 Tasks API Test
        </h2>
        
        {tasksError && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            color: '#991b1b', 
            padding: '16px', 
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <strong>Tasks API Error:</strong> {tasksError}
          </div>
        )}
        
        <div style={{ 
          backgroundColor: '#f9fafb', 
          border: '1px solid #e5e7eb', 
          borderRadius: '6px', 
          padding: '16px' 
        }}>
          {tasksData ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                  <div>
                    <strong>Success:</strong> 
                    <span style={{ color: tasksData.success ? '#22c55e' : '#ef4444', marginLeft: '8px' }}>
                      {getStatusIcon(tasksData.success)} {tasksData.success ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <strong>Data Source:</strong> 
                    <span style={{ 
                      color: tasksData.source === 'database' ? '#22c55e' : '#6b7280',
                      marginLeft: '8px'
                    }}>
                      {tasksData.source === 'database' ? '🗃️ Database' : '❓ Unknown'}
                    </span>
                  </div>
                  <div>
                    <strong>Count:</strong> <span style={{ marginLeft: '8px' }}>{tasksData.count || 0}</span>
                  </div>
                </div>

                {tasksData.error && (
                  <div style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fca5a5', 
                    color: '#991b1b', 
                    padding: '12px', 
                    borderRadius: '6px',
                    marginBottom: '12px'
                  }}>
                    <strong>API Error:</strong> {tasksData.error}
                    {tasksData.message && (
                      <>
                        <br />
                        <strong>Message:</strong> {tasksData.message}
                      </>
                    )}
                  </div>
                )}
              </div>

              {tasksData.data && tasksData.data.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                    Sample Tasks (First 3)
                  </h3>
                  <div style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead style={{ backgroundColor: '#f3f4f6' }}>
                        <tr>
                          <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>ID</th>
                          <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Task Number</th>
                          <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Customer</th>
                          <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Status</th>
                          <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Source</th>
                          <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasksData.data.slice(0, 3).map((task) => (
                          <tr key={task.id}>
                            <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                              {task.id.substring(0, 8)}...
                            </td>
                            <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                              {task.task_number}
                            </td>
                            <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                              {task.customer_name}
                            </td>
                            <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                              <span style={{ 
                                backgroundColor: task.status === 'completed' ? '#dcfce7' : task.status === 'pending' ? '#fef3c7' : '#f3f4f6',
                                color: task.status === 'completed' ? '#15803d' : task.status === 'pending' ? '#92400e' : '#374151',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px'
                              }}>
                                {task.status}
                              </span>
                            </td>
                            <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                              {task.source}
                            </td>
                            <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                              {new Date(task.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No tasks data available</p>
          )}
        </div>
      </div>

      {/* Debug Information JSON */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          🔍 Raw Debug Data
        </h2>
        <div style={{ 
          backgroundColor: '#1f2937', 
          color: '#f9fafb', 
          padding: '16px', 
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'Monaco, Consolas, monospace',
          overflow: 'auto'
        }}>
          <pre style={{ margin: '0', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify({ debugData, tasksData }, null, 2)}
          </pre>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          🚀 Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a 
            href="/api/debug/db" 
            target="_blank"
            style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              padding: '10px 16px', 
              borderRadius: '6px', 
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🔍 View Debug API
          </a>
          <a 
            href="/api/tasks" 
            target="_blank"
            style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              padding: '10px 16px', 
              borderRadius: '6px', 
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📋 View Tasks API
          </a>
          <a 
            href="/admin/debug"
            style={{ 
              backgroundColor: '#6b7280', 
              color: 'white', 
              padding: '10px 16px', 
              borderRadius: '6px', 
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block'
            }}
          >
            🔄 Refresh Page
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        borderTop: '1px solid #e5e7eb', 
        paddingTop: '16px', 
        color: '#6b7280', 
        fontSize: '14px',
        textAlign: 'center'
      }}>
        <p>
          💡 <strong>Tip:</strong> Check your server console logs for detailed error information
        </p>
        <p style={{ marginTop: '8px' }}>
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}