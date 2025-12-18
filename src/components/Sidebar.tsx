import type { TimelineData, EpicStatus, TShirtSize } from '../types';
import { CapacityGauge } from './CapacityGauge';
import { EpicList } from './EpicList';
import { QuarterFilter } from './QuarterFilter';

// Quarter capacity percentages per T-shirt size (designer-month)
const SIZE_CAPACITY: Record<TShirtSize, number> = {
  'S': 8,
  'M': 31,
  'L': 80,
  'XL': 160,
};

interface SidebarProps {
  data: TimelineData;
  selectedQuarter: { start: Date; end: Date; label: string };
  onQuarterChange: (quarter: { start: Date; end: Date; label: string }) => void;
  onEpicStatusChange: (epicId: string, newStatus: EpicStatus) => void;
}

export const Sidebar = ({ data, selectedQuarter, onQuarterChange, onEpicStatusChange }: SidebarProps) => {
  // Calculate quarter capacity based on T-shirt sizes
  const sizeCounts = data.epics.reduce((acc, epic) => {
    const size = epic.size || 'M';
    acc[size] = (acc[size] || 0) + 1;
    return acc;
  }, {} as Record<TShirtSize, number>);

  const totalCapacityUsed = data.epics.reduce((sum, epic) => {
    const size = epic.size || 'M';
    return sum + (SIZE_CAPACITY[size] || 0);
  }, 0);

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
      <QuarterFilter 
        selectedQuarter={selectedQuarter}
        onQuarterChange={onQuarterChange}
      />

      <CapacityGauge percentage={totalCapacityUsed} sizeCounts={sizeCounts} />
      
      <EpicList epics={data.epics} onEpicStatusChange={onEpicStatusChange} />
    </div>
  );
};
