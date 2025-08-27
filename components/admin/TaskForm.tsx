'use client';

import { useState } from 'react';
import { 
  PlusIcon, 
  UserIcon, 
  PhoneIcon, 
  MapPinIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface TaskFormData {
  // Customer Information
  customerName: string;
  phoneNumber: string;
  email: string;
  location: string;
  
  // Service Details
  serviceType: 'ac_repair' | 'refrigerator_repair' | 'installation' | 'maintenance' | 'emergency' | 'consultation';
  applianceType: 'ac' | 'refrigerator' | 'other';
  applianceBrand: string;
  applianceModel: string;
  applianceAge: string;
  problemDescription: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  
  // Scheduling
  preferredDate: string;
  preferredTime: string;
  
  // Additional Information
  customerNotes: string;
  source: 'chat' | 'phone' | 'whatsapp' | 'email' | 'website' | 'walk_in';
  
  // Task Type
  taskType: 'service_ticket' | 'failed_call' | 'both';
}

interface TaskFormProps {
  onTaskCreated: () => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    customerName: '',
    phoneNumber: '',
    email: '',
    location: '',
    serviceType: 'ac_repair',
    applianceType: 'ac',
    applianceBrand: '',
    applianceModel: '',
    applianceAge: '',
    problemDescription: '',
    urgency: 'medium',
    preferredDate: '',
    preferredTime: '',
    customerNotes: '',
    source: 'website',
    taskType: 'service_ticket'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    ticketNumber?: string;
  }>({ type: null, message: '' });

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear status when user starts typing
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' });
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.customerName.trim()) errors.push('Customer name is required');
    if (!formData.phoneNumber.trim()) errors.push('Phone number is required');
    if (!formData.location.trim()) errors.push('Location is required');
    if (!formData.problemDescription.trim()) errors.push('Problem description is required');
    
    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
      errors.push('Please enter a valid 10-digit phone number');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setSubmitStatus({
        type: 'error',
        message: errors.join(', ')
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const results = [];
      
      // Create service ticket if requested
      if (formData.taskType === 'service_ticket' || formData.taskType === 'both') {
        const ticketResponse = await createServiceTicket();
        results.push(ticketResponse);
      }
      
      // Create failed call entry if requested
      if (formData.taskType === 'failed_call' || formData.taskType === 'both') {
        const failedCallResponse = await createFailedCall();
        results.push(failedCallResponse);
      }
      
      // Check if all operations were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        const successResult = results.find((r: any) => r.success && 'ticketNumber' in r) as any;
        const ticketNumber = successResult?.ticketNumber;
        setSubmitStatus({
          type: 'success',
          message: `Task created successfully!${ticketNumber ? ` Ticket number: ${ticketNumber}` : ''}`,
          ticketNumber
        });
        
        // Reset form
        setFormData({
          customerName: '',
          phoneNumber: '',
          email: '',
          location: '',
          serviceType: 'ac_repair',
          applianceType: 'ac',
          applianceBrand: '',
          applianceModel: '',
          applianceAge: '',
          problemDescription: '',
          urgency: 'medium',
          preferredDate: '',
          preferredTime: '',
          customerNotes: '',
          source: 'website',
          taskType: 'service_ticket'
        });
        
        // Notify parent component
        onTaskCreated();
        
      } else {
        const failedResults = results.filter(r => !r.success);
        setSubmitStatus({
          type: 'error',
          message: `Some operations failed: ${failedResults.map(r => r.error).join(', ')}`
        });
      }
      
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createServiceTicket = async () => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          phoneNumber: formData.phoneNumber,
          email: formData.email || undefined,
          location: formData.location,
          serviceType: formData.serviceType,
          appliance: {
            type: formData.applianceType,
            brand: formData.applianceBrand || undefined,
            model: formData.applianceModel || undefined,
            age: formData.applianceAge || undefined
          },
          problemDescription: formData.problemDescription,
          urgency: formData.urgency,
          preferredDate: formData.preferredDate || undefined,
          preferredTime: formData.preferredTime || undefined,
          source: formData.source,
          customerNotes: formData.customerNotes || undefined
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return {
          success: true,
          ticketNumber: result.data.ticketNumber,
          type: 'service_ticket'
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to create service ticket',
          type: 'service_ticket'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error while creating service ticket',
        type: 'service_ticket'
      };
    }
  };

  const createFailedCall = async () => {
    try {
      const response = await fetch('/api/failed-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          phoneNumber: formData.phoneNumber,
          problemDescription: formData.problemDescription,
          priority: formData.urgency,
          status: 'new',
          callbackPreference: 'phone',
          notes: `${formData.customerNotes ? formData.customerNotes + '\n' : ''}Created via admin form`,
          source: 'admin-form'
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          type: 'failed_call'
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to create failed call entry',
          type: 'failed_call'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error while creating failed call entry',
        type: 'failed_call'
      };
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <PlusIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Create New Service Request</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Fill out the form below to create a new service ticket or failed call entry
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Task Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Task Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'service_ticket', label: 'Service Ticket Only', desc: 'Create a comprehensive service ticket' },
                { value: 'failed_call', label: 'Failed Call Only', desc: 'Create a failed call entry for callbacks' },
                { value: 'both', label: 'Both', desc: 'Create both service ticket and failed call entry' }
              ].map(option => (
                <label key={option.value} className="relative">
                  <input
                    type="radio"
                    name="taskType"
                    value={option.value}
                    checked={formData.taskType === option.value}
                    onChange={(e) => handleInputChange('taskType', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.taskType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 text-gray-600 mr-2" />
              Customer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="customer@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Thiruvalla, Pathanamthitta"
                  required
                />
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <WrenchScrewdriverIcon className="h-5 w-5 text-gray-600 mr-2" />
              Service Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => handleInputChange('serviceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ac_repair">AC Repair</option>
                  <option value="refrigerator_repair">Refrigerator Repair</option>
                  <option value="installation">Installation</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="emergency">Emergency Service</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appliance Type
                </label>
                <select
                  value={formData.applianceType}
                  onChange={(e) => handleInputChange('applianceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ac">Air Conditioner</option>
                  <option value="refrigerator">Refrigerator</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  value={formData.applianceBrand}
                  onChange={(e) => handleInputChange('applianceBrand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Samsung, LG, Whirlpool"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model (Optional)
                </label>
                <input
                  type="text"
                  value={formData.applianceModel}
                  onChange={(e) => handleInputChange('applianceModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Model number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (Optional)
                </label>
                <input
                  type="text"
                  value={formData.applianceAge}
                  onChange={(e) => handleInputChange('applianceAge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2 years, 5 years"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical/Emergency</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Description *
              </label>
              <textarea
                value={formData.problemDescription}
                onChange={(e) => handleInputChange('problemDescription', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the problem in detail..."
                required
              />
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-600 mr-2" />
              Scheduling (Optional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any time</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                  <option value="evening">Evening (4 PM - 7 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="website">Website</option>
                  <option value="phone">Phone Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="chat">Chat</option>
                  <option value="walk_in">Walk-in</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Notes (Optional)
              </label>
              <textarea
                value={formData.customerNotes}
                onChange={(e) => handleInputChange('customerNotes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes or special instructions..."
              />
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus.type && (
            <div className={`p-4 rounded-md ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`flex items-center ${
                submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {submitStatus.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                )}
                <span className="font-medium">{submitStatus.message}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  customerName: '',
                  phoneNumber: '',
                  email: '',
                  location: '',
                  serviceType: 'ac_repair',
                  applianceType: 'ac',
                  applianceBrand: '',
                  applianceModel: '',
                  applianceAge: '',
                  problemDescription: '',
                  urgency: 'medium',
                  preferredDate: '',
                  preferredTime: '',
                  customerNotes: '',
                  source: 'website',
                  taskType: 'service_ticket'
                });
                setSubmitStatus({ type: null, message: '' });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset Form
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}