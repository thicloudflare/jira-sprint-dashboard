import type { Epic, Phase, WorkloadConfig } from './types';

export const calculatePhaseRemainingHours = (
  phase: Phase,
  config: WorkloadConfig
): number => {
  const totalPoints = phase.stories.reduce((sum, story) => sum + story.storyPoints, 0);
  const totalSpentHours = phase.stories.reduce((sum, story) => sum + story.timeSpent, 0);
  const totalHours = totalPoints * config.storyPointToHours;
  return Math.max(0, totalHours - totalSpentHours);
};

export const calculatePhaseRemainingDays = (
  phase: Phase,
  config: WorkloadConfig
): number => {
  const remainingHours = calculatePhaseRemainingHours(phase, config);
  return remainingHours / config.workingHoursPerDay;
};

export const calculateEpicRemainingHours = (
  epic: Epic,
  config: WorkloadConfig
): number => {
  return epic.phases.reduce(
    (sum, phase) => sum + calculatePhaseRemainingHours(phase, config),
    0
  );
};

export const calculateEpicProgress = (epic: Epic): number => {
  const allStories = epic.phases.flatMap((phase) => phase.stories);
  if (allStories.length === 0) return 0;
  
  const totalPoints = allStories.reduce((sum, story) => sum + story.storyPoints, 0);
  const completedPoints = allStories
    .filter((story) => story.status === 'Done')
    .reduce((sum, story) => sum + story.storyPoints, 0);
  
  return totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;
};

export const calculateTotalRemainingHours = (
  epics: Epic[],
  config: WorkloadConfig
): number => {
  if (!epics || epics.length === 0) return 0;
  const total = epics.reduce((sum, epic) => sum + calculateEpicRemainingHours(epic, config), 0);
  return isNaN(total) ? 0 : total;
};

export const calculateCapacityPercentage = (
  epics: Epic[],
  config: WorkloadConfig
): number => {
  if (!config || !config.totalAvailableHours || config.totalAvailableHours === 0) return 0;
  const totalRemaining = calculateTotalRemainingHours(epics, config);
  const percentage = (totalRemaining / config.totalAvailableHours) * 100;
  return isNaN(percentage) ? 0 : percentage;
};

export const getCapacityStatus = (percentage: number): 'good' | 'warning' | 'danger' => {
  if (percentage <= 80) return 'good';
  if (percentage <= 100) return 'warning';
  return 'danger';
};

export const formatHours = (hours: number): string => {
  if (isNaN(hours) || hours === null || hours === undefined) return '0h';
  if (hours < 8) return `${hours.toFixed(1)}h`;
  const days = Math.floor(hours / 8);
  const remainingHours = hours % 8;
  if (remainingHours === 0) return `${days}d`;
  return `${days}d ${remainingHours.toFixed(1)}h`;
};

export const getPhaseCompletedStories = (phase: Phase): number => {
  return phase.stories.filter((story) => story.status === 'Done').length;
};

export const isPhaseComplete = (phase: Phase): boolean => {
  return phase.stories.every((story) => story.status === 'Done');
};

export const isPhaseInProgress = (phase: Phase): boolean => {
  return phase.stories.some((story) => story.status === 'In Progress');
};

export const getTimelineProjection = (
  epic: Epic,
  config: WorkloadConfig
): { projectedEndDate: Date; isLate: boolean } => {
  const remainingDays = calculateEpicRemainingHours(epic, config) / config.workingHoursPerDay;
  const projectedEndDate = new Date(epic.startDate);
  projectedEndDate.setDate(projectedEndDate.getDate() + Math.ceil(remainingDays));
  
  const isLate = epic.deadline ? projectedEndDate > epic.deadline : false;
  
  return { projectedEndDate, isLate };
};
