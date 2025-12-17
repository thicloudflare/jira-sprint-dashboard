export type TShirtSize = 'S' | 'M' | 'L';

export type PhaseType = 'Discovery' | 'Iteration' | 'Testing' | 'Implement';

export type StoryStatus = 'Backlog' | 'In Progress' | 'Blocked' | 'In Review' | 'Done';

export type EpicStatus = 'committed' | 'in-progress' | 'blocked' | 'in-review' | 'done';

export interface Story {
  id: string;
  summary: string;
  storyPoints: number;
  status: StoryStatus;
  timeSpent: number;
  phase: PhaseType;
}

export interface Phase {
  type: PhaseType;
  stories: Story[];
  color: string;
  recommendedTools?: string[];
}

export interface Epic {
  id: string;
  name: string;
  size: TShirtSize;
  status: EpicStatus;
  phases: Phase[];
  deadline?: Date;
  startDate: Date;
}

export interface WorkloadConfig {
  storyPointToHours: number;
  workingHoursPerDay: number;
  totalAvailableHours: number;
}

export interface TimelineData {
  epics: Epic[];
  config: WorkloadConfig;
  quarterStart: Date;
  quarterEnd: Date;
}
