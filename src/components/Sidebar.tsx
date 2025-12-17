import type { TimelineData, EpicStatus } from '../types';
import { calculateCapacityPercentage, calculateTotalRemainingHours, formatHours } from '../utils';
import { CapacityGauge } from './CapacityGauge';
import { EpicList } from './EpicList';
import { QuarterFilter } from './QuarterFilter';

interface SidebarProps {
  data: TimelineData;
  selectedQuarter: { start: Date; end: Date; label: string };
  onQuarterChange: (quarter: { start: Date; end: Date; label: string }) => void;
  onEpicStatusChange: (epicId: string, newStatus: EpicStatus) => void;
}

export const Sidebar = ({ data, selectedQuarter, onQuarterChange, onEpicStatusChange }: SidebarProps) => {
  const capacityPercentage = calculateCapacityPercentage(data.epics, data.config);
  const totalRemainingHours = calculateTotalRemainingHours(data.epics, data.config);

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
      <QuarterFilter 
        selectedQuarter={selectedQuarter}
        onQuarterChange={onQuarterChange}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Workload Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Capacity:</span>
            <span className="font-medium">{formatHours(data.config.totalAvailableHours)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Remaining:</span>
            <span className="font-semibold text-blue-600">{formatHours(totalRemainingHours)}</span>
          </div>
        </div>
      </div>

      <CapacityGauge percentage={capacityPercentage} />
      
      <EpicList epics={data.epics} onEpicStatusChange={onEpicStatusChange} />
    </div>
  );
};
