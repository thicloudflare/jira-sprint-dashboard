import type { Phase, WorkloadConfig } from '../types';
import { calculatePhaseRemainingDays, isPhaseComplete, isPhaseInProgress } from '../utils';

interface PhaseBlockProps {
  phase: Phase;
  config: WorkloadConfig;
  onClick: () => void;
  isSelected: boolean;
}

export const PhaseBlock = ({ phase, config, onClick, isSelected }: PhaseBlockProps) => {
  console.log('🔲 Rendering PhaseBlock:', {
    type: phase.type,
    storyCount: phase.stories.length,
    color: phase.color
  });
  
  const remainingDays = calculatePhaseRemainingDays(phase, config);
  const isComplete = isPhaseComplete(phase);
  const inProgress = isPhaseInProgress(phase);
  
  const totalPoints = phase.stories.reduce((sum, story) => sum + story.storyPoints, 0);
  const completedPoints = phase.stories
    .filter((story) => story.status === 'Done')
    .reduce((sum, story) => sum + story.storyPoints, 0);
  
  const progressPercentage = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;
  
  const widthInPixels = Math.max(remainingDays * 40, 60);
  
  console.log(`🔲 PhaseBlock ${phase.type} dimensions:`, { widthInPixels, remainingDays, totalPoints });

  return (
    <div
      onClick={onClick}
      className={`relative h-16 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500 scale-105' : ''
      }`}
      style={{
        width: `${widthInPixels}px`,
        backgroundColor: phase.color,
        opacity: isComplete ? 0.5 : 1,
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-center px-3 text-white">
        <div className="font-semibold text-sm truncate">{phase.type}</div>
        <div className="text-xs opacity-90">
          {remainingDays.toFixed(1)}d · {totalPoints}pt
        </div>
      </div>
      
      {progressPercentage > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-60 rounded-b-lg transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      )}
      
      {inProgress && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
      )}
      
      {isComplete && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-green-600 text-xs font-bold">
          ✓
        </div>
      )}
    </div>
  );
};
