import { useState } from 'react';
import { Info } from 'lucide-react';
import { getCapacityStatus } from '../utils';
import type { TShirtSize } from '../types';

const SIZE_CAPACITY: Record<TShirtSize, number> = {
  'S': 8,
  'M': 31,
  'L': 80,
  'XL': 160,
};

interface CapacityGaugeProps {
  percentage: number;
  sizeCounts?: Record<TShirtSize, number>;
}

export const CapacityGauge = ({ percentage, sizeCounts }: CapacityGaugeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const status = getCapacityStatus(percentage);
  
  const statusColors = {
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };
  
  const statusTextColors = {
    good: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700',
  };

  const clampedPercentage = Math.min(percentage, 100);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quarter Capacity</h3>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Info size={18} />
          </button>
          {showTooltip && sizeCounts && (
            <div className="absolute right-0 top-6 z-10 w-48 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg">
              <div className="font-semibold mb-2">Epics by size:</div>
              <div className="space-y-1">
                {(['S', 'M', 'L', 'XL'] as TShirtSize[]).map(size => (
                  <div key={size} className="flex justify-between">
                    <span>{size} ({SIZE_CAPACITY[size]}% each):</span>
                    <span className="font-medium">{sizeCounts[size] || 0}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>{percentage.toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${statusColors[status]} transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <span className={`text-2xl font-bold ${statusTextColors[status]}`}>
          {percentage.toFixed(0)}%
        </span>
        <span className="text-sm text-gray-600">
          {status === 'good' && '✓ Good capacity'}
          {status === 'warning' && '⚠ Near capacity'}
          {status === 'danger' && '⚠ Over capacity!'}
        </span>
      </div>
    </div>
  );
};
