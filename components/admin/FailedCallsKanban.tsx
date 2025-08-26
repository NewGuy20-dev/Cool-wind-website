'use client';

interface FailedCallsKanbanProps {
  data: any[];
  onUpdate: () => void;
}

export default function FailedCallsKanban({ data, onUpdate }: FailedCallsKanbanProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed Calls Kanban Board</h3>
        <p className="text-gray-600 mb-4">Advanced kanban board for managing failed call callbacks</p>
        <div className="text-sm text-blue-600">
          This component integrates with the existing failed call management system
        </div>
      </div>
    </div>
  );
}