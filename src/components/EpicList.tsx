import type { Epic, EpicStatus } from '../types';
import { calculateEpicProgress } from '../utils';
import { EpicStatusControl } from './EpicStatusControl';

interface EpicListProps {
  epics: Epic[];
  onEpicStatusChange: (epicId: string, newStatus: EpicStatus) => void;
}

export const EpicList = ({ epics, onEpicStatusChange }: EpicListProps) => {
  const getSizeColor = (size: Epic['size']) => {
    switch (size) {
      case 'S': return 'bg-blue-100 text-blue-700';
      case 'M': return 'bg-purple-100 text-purple-700';
      case 'L': return 'bg-orange-100 text-orange-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Epics</h3>
      <div className="space-y-3">
        {epics.map((epic) => {
          const progress = calculateEpicProgress(epic);
          return (
            <div key={epic.id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{epic.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getSizeColor(epic.size)}`}>
                      {epic.size}
                    </span>
                  </div>
                  <EpicStatusControl
                    currentStatus={epic.status}
                    onStatusChange={(newStatus) => onEpicStatusChange(epic.id, newStatus)}
                    epicId={epic.id}
                  />
                </div>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-600">
                {progress.toFixed(0)}% complete
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
