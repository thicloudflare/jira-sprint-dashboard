import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { StoryStatus } from '../types';

interface StoryStatusControlProps {
  currentStatus: StoryStatus;
  onStatusChange: (newStatus: StoryStatus) => void;
}

const STATUS_CONFIG: Record<StoryStatus, { label: string; color: string; bgColor: string }> = {
  'Backlog': { label: 'Backlog', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'In Progress': { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'Blocked': { label: 'Blocked', color: 'text-red-700', bgColor: 'bg-red-100' },
  'In Review': { label: 'In Review', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  'Done': { label: 'Done', color: 'text-green-700', bgColor: 'bg-green-100' },
};

export const StoryStatusControl = ({ currentStatus, onStatusChange }: StoryStatusControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = STATUS_CONFIG[currentStatus];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${config.bgColor} ${config.color} hover:opacity-80 transition-opacity whitespace-nowrap`}
      >
        {config.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
            {(Object.keys(STATUS_CONFIG) as StoryStatus[]).map((status) => {
              const statusConfig = STATUS_CONFIG[status];
              const isSelected = status === currentStatus;
              
              return (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-gray-50' : ''
                  }`}
                >
                  <span className={`font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                  {isSelected && <span className="text-blue-600">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
