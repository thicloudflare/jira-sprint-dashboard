import { getCapacityStatus } from '../utils';

interface CapacityGaugeProps {
  percentage: number;
}

export const CapacityGauge = ({ percentage }: CapacityGaugeProps) => {
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
      <h3 className="text-lg font-semibold mb-4">Capacity Gauge</h3>
      
      <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${statusColors[status]} transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <span className={`text-2xl font-bold ${statusTextColors[status]}`}>
          {percentage.toFixed(1)}%
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
