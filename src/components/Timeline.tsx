import type { TimelineData, Phase, PhaseType } from '../types';
import { EpicTrack } from './EpicTrack';

interface TimelineProps {
  data: TimelineData;
  onPhaseClick: (phase: Phase, epicId: string) => void;
  selectedPhase: Phase | null;
  onAddPhase?: (epicId: string, phaseType: PhaseType) => void;
  onReorderPhases?: (epicId: string, fromIndex: number, toIndex: number) => void;
  jiraDomain?: string;
  userEmail?: string;
  showInProgressOnly?: boolean;
  onToggleInProgressOnly?: (value: boolean) => void;
}

function calculateSprintBoundaries(startDate: Date, endDate: Date): Date[] {
  const sprints: Date[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  
  while (current <= endDate) {
    sprints.push(new Date(current));
    current.setDate(current.getDate() + 14);
  }
  
  return sprints;
}

function getDatePosition(date: Date, startDate: Date, endDate: Date): number {
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = date.getTime() - startDate.getTime();
  return (elapsed / totalDuration) * 100;
}

export const Timeline = ({ data, onPhaseClick, selectedPhase, onAddPhase, onReorderPhases, jiraDomain, userEmail, showInProgressOnly, onToggleInProgressOnly }: TimelineProps) => {
  const getDisplayName = () => {
    if (userEmail) {
      const username = userEmail.split('@')[0];
      return username.charAt(0).toUpperCase() + username.slice(1) + "'s";
    }
    return 'Your';
  };

  const sprintBoundaries = calculateSprintBoundaries(data.quarterStart, data.quarterEnd);
  
  console.log('🗺️ Timeline rendering with data:', {
    epicCount: data.epics.length,
    epics: data.epics.map(e => ({
      id: e.id,
      name: e.name,
      phaseCount: e.phases.length,
      phases: e.phases.map(p => p.type)
    }))
  });
  
  return (
    <div className="flex-1 bg-white p-8 overflow-x-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{getDisplayName()} Roadmap</h2>
        <p className="text-gray-600 mb-4">
          Dynamic timeline visualization based on story points and remaining effort
        </p>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 px-3 py-2 bg-gray-50 rounded-lg">
            <span className="text-xs font-medium text-gray-500">Phases:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8B5CF6' }} />
              <span className="text-xs">Discovery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3B82F6' }} />
              <span className="text-xs">Iteration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F59E0B' }} />
              <span className="text-xs">Testing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10B981' }} />
              <span className="text-xs">Implement</span>
            </div>
          </div>
          
          {onToggleInProgressOnly && (
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-600">In Progress only</span>
              <button
                onClick={() => onToggleInProgressOnly(!showInProgressOnly)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  showInProgressOnly ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    showInProgressOnly ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </label>
          )}
        </div>
      </div>
      
      <div className="flex min-w-max">
        <div className="w-64 flex-shrink-0"></div>
        
        <div className="flex-1 relative">
          <div className="absolute inset-0 pointer-events-none">
            {sprintBoundaries.map((sprintDate, index) => {
              const position = getDatePosition(sprintDate, data.quarterStart, data.quarterEnd);
              return (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 border-l-2 border-dashed border-gray-300"
                  style={{ left: `${position}%` }}
                >
                  <div className="sticky top-0 -mt-6 -ml-12 w-24 text-center">
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded">
                      Sprint {index + 1}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">
                      {sprintDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8">
            {data.epics.map((epic) => (
              <EpicTrack
                key={epic.id}
                epic={epic}
                config={data.config}
                onPhaseClick={(phase) => onPhaseClick(phase, epic.id)}
                selectedPhase={selectedPhase}
                onAddPhase={onAddPhase}
                onReorderPhases={onReorderPhases}
                jiraDomain={jiraDomain}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
