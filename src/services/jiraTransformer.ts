import type { Epic, Phase, Story, PhaseType, TShirtSize, StoryStatus, TimelineData } from '../types';
import type { JiraEpic, JiraIssue } from './jiraApi';

const PHASE_COLORS: Record<PhaseType, string> = {
  Discovery: '#8B5CF6',
  Iteration: '#3B82F6',
  Testing: '#F59E0B',
  Implement: '#10B981',
};

const PHASE_TOOLS: Record<PhaseType, string[]> = {
  Discovery: ['Use Miro for brainstorming', 'Link to Confluence for documentation'],
  Iteration: ['Use Figma for mockups', 'Use Loom for design walkthroughs'],
  Testing: ['Use Cypress for E2E testing', 'Use Browserstack for cross-browser testing'],
  Implement: [],
};

function mapJiraStatusToStoryStatus(jiraStatus: string): StoryStatus {
  const statusLower = jiraStatus.toLowerCase();
  
  if (statusLower.includes('done') || statusLower.includes('closed') || statusLower.includes('resolved')) {
    return 'Done';
  }
  
  if (statusLower.includes('block')) {
    return 'Blocked';
  }
  
  if (statusLower.includes('review')) {
    return 'In Review';
  }
  
  if (statusLower.includes('progress') || statusLower.includes('testing')) {
    return 'In Progress';
  }
  
  return 'Backlog';
}

function determinePhaseFromIssue(issue: JiraIssue): PhaseType {
  // First check labels
  const labels = issue.fields.labels || [];
  const labelLower = labels.map((l: string) => l.toLowerCase());
  
  if (labelLower.includes('discovery')) {
    return 'Discovery';
  }
  
  if (labelLower.includes('iteration') || labelLower.includes('design')) {
    return 'Iteration';
  }
  
  if (labelLower.includes('test') || labelLower.includes('testing')) {
    return 'Testing';
  }
  
  if (labelLower.includes('implement') || labelLower.includes('implementation') || labelLower.includes('deploy') || labelLower.includes('deployment')) {
    return 'Implement';
  }
  
  // Fallback to summary text if no labels match
  const summary = issue.fields.summary.toLowerCase();
  const issueType = issue.fields.issuetype.name.toLowerCase();
  
  if (summary.includes('discover') || summary.includes('research') || summary.includes('analysis')) {
    return 'Discovery';
  }
  
  if (summary.includes('design') || summary.includes('mockup') || summary.includes('wireframe') || summary.includes('iteration')) {
    return 'Iteration';
  }
  
  if (summary.includes('test') || summary.includes('qa') || issueType.includes('test')) {
    return 'Testing';
  }
  
  if (summary.includes('deploy') || summary.includes('release') || summary.includes('implement')) {
    return 'Implement';
  }
  
  return 'Iteration';
}

function getStoryPointsFromIssue(issue: JiraIssue): number {
  // Try different custom field IDs for story points
  const field10040: any = issue.fields.customfield_10040;
  const field10016: any = issue.fields.customfield_10016;
  
  // Handle both direct number values and object formats like { value: 5 }
  let points: number | undefined;
  
  if (typeof field10040 === 'number') {
    points = field10040;
  } else if (typeof field10040 === 'object' && field10040?.value) {
    points = typeof field10040.value === 'number' ? field10040.value : parseInt(field10040.value, 10);
  } else if (typeof field10016 === 'number') {
    points = field10016;
  } else if (typeof field10016 === 'object' && field10016?.value) {
    points = typeof field10016.value === 'number' ? field10016.value : parseInt(field10016.value, 10);
  }
  
  const result = points && !isNaN(points) ? points : 3;
  return result;
}

function getTimeSpentFromIssue(issue: JiraIssue): number {
  const seconds = issue.fields.timetracking?.timeSpentSeconds || 0;
  return seconds / 3600;
}

function getTShirtSizeFromJira(epic: JiraEpic): TShirtSize | null {
  // Check all custom fields for T-shirt size
  // Common field IDs: customfield_10014, customfield_10015, etc.
  const fields = epic.fields;
  
  // Try to find the field by looking for common patterns
  for (const key in fields) {
    if (key.startsWith('customfield_')) {
      const value = fields[key];
      if (typeof value === 'string') {
        const normalized = value.toUpperCase().trim();
        if (normalized === 'S' || normalized === 'SMALL') return 'S';
        if (normalized === 'M' || normalized === 'MEDIUM') return 'M';
        if (normalized === 'L' || normalized === 'LARGE') return 'L';
      } else if (typeof value === 'object' && value?.value) {
        // Handle select fields which have { value: 'S' } structure
        const normalized = value.value.toUpperCase().trim();
        if (normalized === 'S' || normalized === 'SMALL') return 'S';
        if (normalized === 'M' || normalized === 'MEDIUM') return 'M';
        if (normalized === 'L' || normalized === 'LARGE') return 'L';
      }
    }
  }
  
  return null;
}

function determineTShirtSize(issueCount: number, totalPoints: number): TShirtSize {
  // More accurate mapping based on typical story points
  if (totalPoints <= 13 || issueCount <= 3) return 'S';  // Small: 1-13 points, 1-3 stories
  if (totalPoints <= 34 || issueCount <= 8) return 'M';  // Medium: 14-34 points, 4-8 stories
  return 'L';  // Large: 35+ points, 9+ stories
}

function transformJiraIssueToStory(issue: JiraIssue, phase: PhaseType): Story {
  return {
    id: issue.key,
    summary: issue.fields.summary,
    storyPoints: getStoryPointsFromIssue(issue),
    status: mapJiraStatusToStoryStatus(issue.fields.status.name),
    timeSpent: getTimeSpentFromIssue(issue),
    phase,
  };
}

function groupStoriesByPhase(issues: JiraIssue[]): Phase[] {
  const phaseMap = new Map<PhaseType, Story[]>();
  
  issues.forEach(issue => {
    const phase = determinePhaseFromIssue(issue);
    const story = transformJiraIssueToStory(issue, phase);
    
    if (!phaseMap.has(phase)) {
      phaseMap.set(phase, []);
    }
    phaseMap.get(phase)!.push(story);
  });
  
  const phases: Phase[] = [];
  const phaseOrder: PhaseType[] = ['Discovery', 'Iteration', 'Testing', 'Implement'];
  
  phaseOrder.forEach(phaseType => {
    const stories = phaseMap.get(phaseType);
    if (stories && stories.length > 0) {
      phases.push({
        type: phaseType,
        stories,
        color: PHASE_COLORS[phaseType],
        recommendedTools: PHASE_TOOLS[phaseType].length > 0 ? PHASE_TOOLS[phaseType] : undefined,
      });
    }
  });
  
  return phases;
}

function mapJiraStatusToEpicStatus(jiraStatus: string): 'committed' | 'in-progress' | 'blocked' | 'in-review' | 'done' {
  const statusLower = jiraStatus.toLowerCase();
  
  if (statusLower.includes('done') || statusLower.includes('closed') || statusLower.includes('resolved')) {
    return 'done';
  }
  
  if (statusLower.includes('review')) {
    return 'in-review';
  }
  
  if (statusLower.includes('block')) {
    return 'blocked';
  }
  
  if (statusLower.includes('progress') || statusLower.includes('development') || statusLower.includes('testing')) {
    return 'in-progress';
  }
  
  return 'committed';
}

export function transformJiraDataToTimeline(
  epics: JiraEpic[],
  issuesByEpic: Map<string, JiraIssue[]>,
  config?: {
    quarterStart?: Date;
    quarterEnd?: Date;
    storyPointToHours?: number;
    workingHoursPerDay?: number;
    totalAvailableHours?: number;
  }
): TimelineData {
  console.log('🔵 Transforming Jira data:', { 
    epicCount: epics.length, 
    epicKeys: epics.map(e => e.key),
    issuesByEpicSize: issuesByEpic.size 
  });
  
  const transformedEpics: Epic[] = epics.map(jiraEpic => {
    const issues = issuesByEpic.get(jiraEpic.key) || [];
    console.log(`🔵 Epic ${jiraEpic.key} (${jiraEpic.fields.summary}): ${issues.length} issues`);
    
    if (issues.length > 0) {
      console.log('📋 Issues:', issues.map(i => ({ 
        key: i.key, 
        summary: i.fields.summary, 
        labels: i.fields.labels 
      })));
    }
    
    const phases = groupStoriesByPhase(issues);
    console.log(`📊 Epic ${jiraEpic.key} phases:`, phases.length, phases.map(p => ({ type: p.type, stories: p.stories.length })));
    
    // Try to get T-shirt size from Jira first, otherwise calculate it
    let size = getTShirtSizeFromJira(jiraEpic);
    if (!size) {
      const totalPoints = issues.reduce((sum, issue) => sum + getStoryPointsFromIssue(issue), 0);
      size = determineTShirtSize(issues.length, totalPoints);
      console.log(`⚠️ Epic ${jiraEpic.key} has no T-shirt size in Jira, calculated as ${size}`);
    } else {
      console.log(`✅ Epic ${jiraEpic.key} T-shirt size from Jira: ${size}`);
    }
    
    return {
      id: jiraEpic.key,
      name: jiraEpic.fields.summary,
      size,
      status: mapJiraStatusToEpicStatus(jiraEpic.fields.status.name),
      phases,
      startDate: new Date(jiraEpic.fields.created),
      deadline: jiraEpic.fields.duedate ? new Date(jiraEpic.fields.duedate) : undefined,
    };
  });
  
  const now = new Date();
  const defaultQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const defaultQuarterEnd = new Date(defaultQuarterStart);
  defaultQuarterEnd.setMonth(defaultQuarterEnd.getMonth() + 3);
  defaultQuarterEnd.setDate(0);
  
  return {
    epics: transformedEpics,
    config: {
      storyPointToHours: config?.storyPointToHours || 8,
      workingHoursPerDay: config?.workingHoursPerDay || 8,
      totalAvailableHours: config?.totalAvailableHours || 480,
    },
    quarterStart: config?.quarterStart || defaultQuarterStart,
    quarterEnd: config?.quarterEnd || defaultQuarterEnd,
  };
}
