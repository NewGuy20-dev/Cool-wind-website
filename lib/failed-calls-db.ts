import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface FailedCallTask {
  id: string;
  customerName: string;
  phoneNumber: string;
  problemDescription: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'unavailable' | 'scheduled' | 'progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  callbackPreference?: string;
  attemptCount: number;
  notes?: string;
  scheduledCallbackTime?: string;
  // AI-powered fields
  aiPriorityScore?: 1 | 2 | 3; // AI-assigned priority (1=high, 2=medium, 3=low)
  aiReasoning?: string; // AI explanation for priority assignment
  aiTags?: string[]; // AI-generated tags for categorization
  estimatedResponseTime?: string; // AI-suggested response timeframe
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'failed-calls.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Initialize database file if it doesn't exist
const initializeDatabase = () => {
  ensureDataDirectory();
  if (!fs.existsSync(DB_FILE_PATH)) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify([], null, 2));
  }
};

// Read all tasks from database
export const getAllTasks = (): FailedCallTask[] => {
  try {
    initializeDatabase();
    const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
    return JSON.parse(data) as FailedCallTask[];
  } catch (error) {
    console.error('Error reading failed calls database:', error);
    return [];
  }
};

// Write tasks to database
const saveTasks = (tasks: FailedCallTask[]): boolean => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(tasks, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving to failed calls database:', error);
    return false;
  }
};

// Create a new task
export const createTask = (taskData: Omit<FailedCallTask, 'id' | 'createdAt' | 'updatedAt'>): FailedCallTask | null => {
  try {
    const tasks = getAllTasks();
    const newTask: FailedCallTask = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    const saved = saveTasks(tasks);
    return saved ? newTask : null;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
};

// Update an existing task
export const updateTask = (id: string, updates: Partial<Omit<FailedCallTask, 'id' | 'createdAt'>>): FailedCallTask | null => {
  try {
    const tasks = getAllTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    const saved = saveTasks(tasks);
    return saved ? tasks[taskIndex] : null;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
};

// Delete a task
export const deleteTask = (id: string): boolean => {
  try {
    const tasks = getAllTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === tasks.length) {
      return false; // Task not found
    }
    
    return saveTasks(filteredTasks);
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

// Get task by ID
export const getTaskById = (id: string): FailedCallTask | null => {
  try {
    const tasks = getAllTasks();
    return tasks.find(task => task.id === id) || null;
  } catch (error) {
    console.error('Error getting task by ID:', error);
    return null;
  }
};

// Get tasks by status
export const getTasksByStatus = (status: FailedCallTask['status']): FailedCallTask[] => {
  try {
    const tasks = getAllTasks();
    return tasks.filter(task => task.status === status);
  } catch (error) {
    console.error('Error getting tasks by status:', error);
    return [];
  }
};

// Auto-create task from chat context with AI priority analysis (for agent integration)
export const autoCreateTaskFromChatWithAI = async (
  customerName: string,
  phoneNumber: string,
  conversationContext: string,
  urgencyKeywords: string[] = [],
  customerInfo?: any
): Promise<FailedCallTask | null> => {
  try {
    // Import AI analyzer dynamically to avoid circular imports
    const { aiPriorityAnalyzer } = await import('./ai-priority-analyzer');
    
    // Extract problem description from context
    let problemDescription = 'Customer reported failed call attempt';
    if (conversationContext.length > 20) {
      // Take first 200 characters of context as problem description
      problemDescription = conversationContext.substring(0, 200) + (conversationContext.length > 200 ? '...' : '');
    }
    
    // Use AI to analyze priority
    const aiAnalysis = await aiPriorityAnalyzer.analyzePriority(
      problemDescription,
      conversationContext,
      customerInfo
    );
    
    // Map AI priority score to string
    const priority = aiAnalysis.urgencyLevel;
    
    return createTask({
      customerName,
      phoneNumber,
      problemDescription,
      priority,
      status: 'new',
      attemptCount: 0,
      notes: `Auto-created from chat agent. AI Reasoning: ${aiAnalysis.reasoning}`,
      // AI-powered fields
      aiPriorityScore: aiAnalysis.priority,
      aiReasoning: aiAnalysis.reasoning,
      aiTags: aiAnalysis.tags,
      estimatedResponseTime: aiAnalysis.estimatedResponseTime
    });
  } catch (error) {
    console.error('Error auto-creating task with AI analysis:', error);
    // Fallback to original method
    return autoCreateTaskFromChat(customerName, phoneNumber, conversationContext, urgencyKeywords);
  }
};

// Auto-create task from chat context (legacy method, kept for backward compatibility)
export const autoCreateTaskFromChat = (
  customerName: string,
  phoneNumber: string,
  conversationContext: string,
  urgencyKeywords: string[] = []
): FailedCallTask | null => {
  try {
    // Determine priority based on urgency keywords
    let priority: 'high' | 'medium' | 'low' = 'medium';
    const highUrgencyWords = ['emergency', 'urgent', 'critical', 'asap', 'immediately'];
    const lowUrgencyWords = ['when convenient', 'no rush', 'whenever'];
    
    const contextLower = conversationContext.toLowerCase();
    
    if (urgencyKeywords.some(word => highUrgencyWords.includes(word.toLowerCase())) ||
        highUrgencyWords.some(word => contextLower.includes(word))) {
      priority = 'high';
    } else if (urgencyKeywords.some(word => lowUrgencyWords.includes(word.toLowerCase())) ||
               lowUrgencyWords.some(word => contextLower.includes(word))) {
      priority = 'low';
    }
    
    // Extract problem description from context
    let problemDescription = 'Customer reported failed call attempt';
    if (conversationContext.length > 20) {
      // Take first 200 characters of context as problem description
      problemDescription = conversationContext.substring(0, 200) + (conversationContext.length > 200 ? '...' : '');
    }
    
    return createTask({
      customerName,
      phoneNumber,
      problemDescription,
      priority,
      status: 'new',
      attemptCount: 0,
      notes: `Auto-created from chat agent. Context: ${conversationContext.substring(0, 100)}...`
    });
  } catch (error) {
    console.error('Error auto-creating task from chat:', error);
    return null;
  }
};

// Utility function to clean phone numbers for dialing
export const cleanPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except + at the beginning
  return phoneNumber.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
};

// Utility function to format phone number for display
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  // Format US phone numbers (10 digits)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format US phone numbers with country code (+1)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return original if it doesn't match common patterns
  return phoneNumber;
};