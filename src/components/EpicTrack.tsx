import { Flag, Plus, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { Epic, Phase, WorkloadConfig, PhaseType } from '../types';
import { getTimelineProjection } from '../utils';
import { PhaseBlock } from './PhaseBlock';

interface EpicTrackProps {
  epic: Epic;
  config: WorkloadConfig;
  onPhaseClick: (phase: Phase) => void;
  selectedPhase: Phase | null;
  onAddPhase?: (epicId: string, phaseType: PhaseType) => void;
  onReorderPhases?: (epicId: string, fromIndex: number, toIndex: number) => void;
  jiraDomain?: string;
}

export const EpicTrack = ({ epic, config, onPhaseClick, selectedPhase, onAddPhase, onReorderPhases, jiraDomain }: EpicTrackProps) => {
  const { projectedEndDate, isLate } = getTimelineProjection(epic, config);
  const [showPhaseSelector, setShowPhaseSelector] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  console.log(`🎨 Rendering EpicTrack for ${epic.id}:`, {
    name: epic.name,
    phaseCount: epic.phases.length,
    phases: epic.phases.map(p => ({ type: p.type, storyCount: p.stories.length }))
  });

  const phaseOrder: PhaseType[] = ['Discovery', 'Iteration', 'Testing', 'Implement'];
  
  const sortedPhases = [...epic.phases].sort((a, b) => {
    const indexA = phaseOrder.indexOf(a.type);
    const indexB = phaseOrder.indexOf(b.type);
    return indexA - indexB;
  });
  
  console.log(`🎨 Sorted phases for ${epic.id}:`, sortedPhases.length);

  const allPhases: PhaseType[] = ['Discovery', 'Iteration', 'Testing', 'Implement'];
  const existingPhaseTypes = epic.phases.map(p => p.type);
  const availablePhases = allPhases.filter(phase => !existingPhaseTypes.includes(phase));

  const handleAddPhase = (phaseType: PhaseType) => {
    if (onAddPhase) {
      onAddPhase(epic.id, phaseType);
      setShowPhaseSelector(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorderPhases) {
      onReorderPhases(epic.id, draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="mb-6 border-b border-gray-200 pb-6 flex gap-6 -ml-64 pl-64">
      <div className="w-64 flex-shrink-0 space-y-1 -ml-64">
        <div className="flex flex-col">
          {jiraDomain ? (
            <a 
              href={`https://${jiraDomain}/browse/${epic.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 text-sm underline inline-flex items-baseline gap-1"
            >
              <span>{epic.name}</span>
              <ExternalLink className="w-3 h-3 inline-block flex-shrink-0" style={{ verticalAlign: 'baseline' }} />
            </a>
          ) : (
            <h3 className="font-semibold text-gray-800 text-sm">{epic.name}</h3>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded font-semibold ${
              epic.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
              epic.status === 'done' ? 'bg-green-100 text-green-700' :
              epic.status === 'blocked' ? 'bg-red-100 text-red-700' :
              epic.status === 'in-review' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {epic.status === 'in-progress' ? 'In Progress' :
               epic.status === 'done' ? 'Done' :
               epic.status === 'blocked' ? 'Blocked' :
               epic.status === 'in-review' ? 'In Review' :
               'Committed'}
            </span>
            <span className="text-gray-400">-</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              epic.size === 'S' ? 'bg-blue-100 text-blue-700' :
              epic.size === 'M' ? 'bg-purple-100 text-purple-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {epic.size}
            </span>
          </div>
        </div>
        
        {epic.deadline && (
          <div className={`flex items-center gap-1 text-xs ${isLate ? 'text-red-600' : 'text-gray-600'}`}>
            <Flag className="w-3 h-3" />
            <span>
              Due: {epic.deadline.toLocaleDateString()}
              {isLate && ' (Late)'}
            </span>
          </div>
        )}
        
        {epic.deadline && (
          <div className="text-xs text-gray-500">
            Projected: {projectedEndDate.toLocaleDateString()}
          </div>
        )}
      </div>
      
      <div className="flex-1 flex gap-2 items-center">
        {sortedPhases.map((phase, index) => (
          <div
            key={phase.type}
            draggable={!!onReorderPhases}
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={draggedIndex === index ? 'opacity-50' : ''}
          >
            <PhaseBlock
              phase={phase}
              config={config}
              onClick={() => onPhaseClick(phase)}
              isSelected={selectedPhase === phase}
            />
          </div>
        ))}
        
        {onAddPhase && availablePhases.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowPhaseSelector(!showPhaseSelector)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
              title="Add phase"
            >
              <Plus className="w-4 h-4" />
              <span>Add Phase</span>
            </button>
            
            {showPhaseSelector && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">Select Phase</div>
                  {availablePhases.map((phase) => (
                    <button
                      key={phase}
                      onClick={() => handleAddPhase(phase)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
