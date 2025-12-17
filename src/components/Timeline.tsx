import type { TimelineData, Phase, PhaseType } from '../types';
import { EpicTrack } from './EpicTrack';

interface TimelineProps {
  data: TimelineData;
  onPhaseClick: (phase: Phase, epicId: string) => void;
  selectedPhase: Phase | null;
  onAddPhase?: (epicId: string, phaseType: PhaseType) => void;
  onReorderPhases?: (epicId: string, fromIndex: number, toIndex: number) => void;
  jiraDomain?: string;
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

export const Timeline = ({ data, onPhaseClick, selectedPhase, onAddPhase, onReorderPhases, jiraDomain }: TimelineProps) => {
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Personal Roadmap</h2>
        <p className="text-gray-600 mb-4">
          Dynamic timeline visualization based on story points and remaining effort
        </p>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Phases</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B5CF6' }} />
              <span>Discovery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }} />
              <span>Iteration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }} />
              <span>Testing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }} />
              <span>Implement</span>
            </div>
          </div>
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
  );
};
