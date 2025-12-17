import type { Epic, TimelineData, PhaseType } from './types';

const PHASE_COLORS: Record<PhaseType, string> = {
  Discovery: '#8B5CF6',
  Iteration: '#3B82F6',
  Testing: '#F59E0B',
  Implement: '#10B981',
};

export const mockData: TimelineData = {
  quarterStart: new Date('2026-01-01'),
  quarterEnd: new Date('2026-03-31'),
  config: {
    storyPointToHours: 8,
    workingHoursPerDay: 8,
    totalAvailableHours: 480,
  },
  epics: [
    {
      id: 'EPIC-1',
      name: 'Customer Portal Redesign',
      size: 'L',
      status: 'in-progress',
      startDate: new Date('2026-01-01'),
      deadline: new Date('2026-03-15'),
      phases: [
        {
          type: 'Discovery',
          color: PHASE_COLORS.Discovery,
          recommendedTools: ['Use Miro for brainstorming', 'Link to Confluence for documentation'],
          stories: [
            { id: 'STORY-1', summary: 'User research interviews', storyPoints: 5, status: 'Done', timeSpent: 40, phase: 'Discovery' },
            { id: 'STORY-2', summary: 'Competitor analysis', storyPoints: 3, status: 'Done', timeSpent: 24, phase: 'Discovery' },
            { id: 'STORY-3', summary: 'Define user personas', storyPoints: 2, status: 'In Progress', timeSpent: 8, phase: 'Discovery' },
          ],
        },
        {
          type: 'Iteration',
          color: PHASE_COLORS.Iteration,
          recommendedTools: ['Use Figma for mockups', 'Use Loom for design walkthroughs'],
          stories: [
            { id: 'STORY-4', summary: 'Create wireframes', storyPoints: 5, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
            { id: 'STORY-5', summary: 'High-fidelity mockups', storyPoints: 8, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
            { id: 'STORY-6', summary: 'Design system updates', storyPoints: 3, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
            { id: 'STORY-7', summary: 'Setup new React components', storyPoints: 8, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
            { id: 'STORY-8', summary: 'Implement authentication flow', storyPoints: 13, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
            { id: 'STORY-9', summary: 'Dashboard data integration', storyPoints: 13, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
          ],
        },
        {
          type: 'Testing',
          color: PHASE_COLORS.Testing,
          recommendedTools: ['Use Cypress for E2E testing', 'Use Browserstack for cross-browser testing'],
          stories: [
            { id: 'STORY-10', summary: 'Write unit tests', storyPoints: 5, status: 'Backlog', timeSpent: 0, phase: 'Testing' },
            { id: 'STORY-11', summary: 'E2E testing', storyPoints: 8, status: 'Backlog', timeSpent: 0, phase: 'Testing' },
          ],
        },
      ],
    },
    {
      id: 'EPIC-2',
      name: 'Mobile App Performance',
      size: 'M',
      status: 'committed',
      startDate: new Date('2026-01-15'),
      deadline: new Date('2026-02-28'),
      phases: [
        {
          type: 'Discovery',
          color: PHASE_COLORS.Discovery,
          recommendedTools: ['Use Lighthouse for performance analysis', 'Use Chrome DevTools for profiling'],
          stories: [
            { id: 'STORY-12', summary: 'Performance audit', storyPoints: 3, status: 'Done', timeSpent: 24, phase: 'Discovery' },
          ],
        },
        {
          type: 'Iteration',
          color: PHASE_COLORS.Iteration,
          recommendedTools: ['Use React Profiler for optimization', 'Use Webpack Bundle Analyzer', 'Use Web Vitals for metrics'],
          stories: [
            { id: 'STORY-13', summary: 'Optimize image loading', storyPoints: 5, status: 'In Progress', timeSpent: 16, phase: 'Iteration' },
            { id: 'STORY-14', summary: 'Implement lazy loading', storyPoints: 5, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
            { id: 'STORY-15', summary: 'Cache optimization', storyPoints: 8, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
          ],
        },
        {
          type: 'Testing',
          color: PHASE_COLORS.Testing,
          recommendedTools: ['Use WebPageTest for performance testing', 'Use Lighthouse CI for automated testing'],
          stories: [
            { id: 'STORY-16', summary: 'Performance testing', storyPoints: 5, status: 'Backlog', timeSpent: 0, phase: 'Testing' },
          ],
        },
      ],
    },
    {
      id: 'EPIC-3',
      name: 'API Documentation',
      size: 'S',
      status: 'committed',
      startDate: new Date('2026-02-01'),
      phases: [
        {
          type: 'Discovery',
          color: PHASE_COLORS.Discovery,
          recommendedTools: ['Use Notion for documentation planning', 'Use Docusaurus for doc site framework'],
          stories: [
            { id: 'STORY-17', summary: 'Audit existing docs', storyPoints: 2, status: 'Backlog', timeSpent: 0, phase: 'Discovery' },
          ],
        },
        {
          type: 'Iteration',
          color: PHASE_COLORS.Iteration,
          recommendedTools: ['Use Swagger/OpenAPI for API docs', 'Use Mintlify for beautiful documentation', 'Use TypeDoc for TypeScript docs'],
          stories: [
            { id: 'STORY-18', summary: 'Write API reference', storyPoints: 8, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
            { id: 'STORY-19', summary: 'Create code examples', storyPoints: 5, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
          ],
        },
      ],
    },
  ],
};
