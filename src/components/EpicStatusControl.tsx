import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { EpicStatus } from '../types';

interface EpicStatusControlProps {
  currentStatus: EpicStatus;
  onStatusChange: (newStatus: EpicStatus) => void;
  epicId: string;
}

const STATUS_CONFIG: Record<EpicStatus, { label: string; color: string; bgColor: string }> = {
  'committed': { label: 'Committed', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'in-progress': { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'blocked': { label: 'Blocked', color: 'text-red-700', bgColor: 'bg-red-100' },
  'in-review': { label: 'In Review', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  'done': { label: 'Done', color: 'text-green-700', bgColor: 'bg-green-100' },
};

export const EpicStatusControl = ({ currentStatus, onStatusChange, epicId: _epicId }: EpicStatusControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const config = STATUS_CONFIG[currentStatus];

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${config.bgColor} ${config.color} hover:opacity-80 transition-opacity`}
      >
        {config.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div 
            className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] min-w-[140px]"
            style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
          >
            {(Object.keys(STATUS_CONFIG) as EpicStatus[]).map((status) => {
              const statusConfig = STATUS_CONFIG[status];
              const isSelected = status === currentStatus;
              
              return (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(status);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors flex items-center justify-between first:rounded-t-lg last:rounded-b-lg ${
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
