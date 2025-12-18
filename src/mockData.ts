import type { TimelineData, PhaseType } from './types';

const PHASE_COLORS: Record<PhaseType, string> = {
  Discovery: '#8B5CF6',
  Iteration: '#3B82F6',
  Testing: '#F59E0B',
  Implement: '#10B981',
};

// Get current quarter dates
const now = new Date();
const currentQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
const currentQuarterEnd = new Date(currentQuarterStart);
currentQuarterEnd.setMonth(currentQuarterEnd.getMonth() + 3);
currentQuarterEnd.setDate(0);

export const mockData: TimelineData = {
  quarterStart: currentQuarterStart,
  quarterEnd: currentQuarterEnd,
  config: {
    storyPointToHours: 8,
    workingHoursPerDay: 8,
    totalAvailableHours: 480,
  },
  epics: [
    {
      id: 'DEMO-101',
      name: 'Dashboard Redesign',
      size: 'L',
      status: 'in-progress',
      startDate: new Date(currentQuarterStart.getTime() + 7 * 24 * 60 * 60 * 1000),
      deadline: new Date(currentQuarterEnd.getTime() - 14 * 24 * 60 * 60 * 1000),
      phases: [
        {
          type: 'Discovery',
          color: PHASE_COLORS.Discovery,
          recommendedTools: ['Use Miro for brainstorming', 'Link to Confluence for documentation'],
          stories: [
            { id: 'DEMO-102', summary: 'User research interviews', storyPoints: 5, status: 'Done', timeSpent: 40, phase: 'Discovery' },
            { id: 'DEMO-103', summary: 'Competitor analysis', storyPoints: 3, status: 'Done', timeSpent: 24, phase: 'Discovery' },
          ],
        },
        {
          type: 'Iteration',
          color: PHASE_COLORS.Iteration,
          recommendedTools: ['Use Figma for mockups', 'Use Loom for design walkthroughs'],
          stories: [
            { id: 'DEMO-104', summary: 'Create wireframes', storyPoints: 5, status: 'Done', timeSpent: 40, phase: 'Iteration' },
            { id: 'DEMO-105', summary: 'High-fidelity mockups', storyPoints: 8, status: 'In Progress', timeSpent: 32, phase: 'Iteration' },
            { id: 'DEMO-106', summary: 'Design system updates', storyPoints: 3, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
          ],
        },
        {
          type: 'Testing',
          color: PHASE_COLORS.Testing,
          recommendedTools: ['Use Cypress for E2E testing', 'Use Browserstack for cross-browser testing'],
          stories: [
            { id: 'DEMO-107', summary: 'Usability testing', storyPoints: 5, status: 'Backlog', timeSpent: 0, phase: 'Testing' },
          ],
        },
        {
          type: 'Implement',
          color: PHASE_COLORS.Implement,
          stories: [
            { id: 'DEMO-108', summary: 'Handoff to engineering', storyPoints: 2, status: 'Backlog', timeSpent: 0, phase: 'Implement' },
          ],
        },
      ],
    },
    {
      id: 'DEMO-201',
      name: 'Mobile App Onboarding Flow',
      size: 'M',
      status: 'in-progress',
      startDate: new Date(currentQuarterStart.getTime() + 21 * 24 * 60 * 60 * 1000),
      deadline: new Date(currentQuarterEnd.getTime() - 7 * 24 * 60 * 60 * 1000),
      phases: [
        {
          type: 'Discovery',
          color: PHASE_COLORS.Discovery,
          recommendedTools: ['Use Hotjar for user behavior analysis'],
          stories: [
            { id: 'DEMO-202', summary: 'Analyze drop-off points', storyPoints: 3, status: 'Done', timeSpent: 24, phase: 'Discovery' },
            { id: 'DEMO-203', summary: 'User journey mapping', storyPoints: 2, status: 'Done', timeSpent: 16, phase: 'Discovery' },
          ],
        },
        {
          type: 'Iteration',
          color: PHASE_COLORS.Iteration,
          recommendedTools: ['Use Figma for prototypes', 'Use Principle for animations'],
          stories: [
            { id: 'DEMO-204', summary: 'Design new onboarding screens', storyPoints: 5, status: 'In Progress', timeSpent: 20, phase: 'Iteration' },
            { id: 'DEMO-205', summary: 'Create micro-interactions', storyPoints: 3, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
          ],
        },
      ],
    },
    {
      id: 'DEMO-301',
      name: 'Design System v2.0',
      size: 'L',
      status: 'done',
      startDate: new Date(currentQuarterStart.getTime()),
      deadline: new Date(currentQuarterStart.getTime() + 45 * 24 * 60 * 60 * 1000),
      phases: [
        {
          type: 'Discovery',
          color: PHASE_COLORS.Discovery,
          stories: [
            { id: 'DEMO-302', summary: 'Audit current components', storyPoints: 3, status: 'Done', timeSpent: 24, phase: 'Discovery' },
          ],
        },
        {
          type: 'Iteration',
          color: PHASE_COLORS.Iteration,
          stories: [
            { id: 'DEMO-303', summary: 'Define color tokens', storyPoints: 2, status: 'Done', timeSpent: 16, phase: 'Iteration' },
            { id: 'DEMO-304', summary: 'Typography scale', storyPoints: 2, status: 'Done', timeSpent: 16, phase: 'Iteration' },
            { id: 'DEMO-305', summary: 'Component library', storyPoints: 8, status: 'Done', timeSpent: 64, phase: 'Iteration' },
          ],
        },
        {
          type: 'Implement',
          color: PHASE_COLORS.Implement,
          stories: [
            { id: 'DEMO-306', summary: 'Documentation site', storyPoints: 3, status: 'Done', timeSpent: 24, phase: 'Implement' },
          ],
        },
      ],
    },
    {
      id: 'DEMO-401',
      name: 'Checkout Page Optimization',
      size: 'S',
      status: 'in-progress',
      startDate: new Date(currentQuarterStart.getTime() + 35 * 24 * 60 * 60 * 1000),
      phases: [
        {
          type: 'Discovery',
          color: PHASE_COLORS.Discovery,
          stories: [
            { id: 'DEMO-402', summary: 'A/B test analysis', storyPoints: 2, status: 'Done', timeSpent: 16, phase: 'Discovery' },
          ],
        },
        {
          type: 'Iteration',
          color: PHASE_COLORS.Iteration,
          stories: [
            { id: 'DEMO-403', summary: 'Simplify form fields', storyPoints: 3, status: 'In Progress', timeSpent: 8, phase: 'Iteration' },
          ],
        },
      ],
    },
    {
      id: 'DEMO-501',
      name: 'Email Template Refresh',
      size: 'S',
      status: 'done',
      startDate: new Date(currentQuarterStart.getTime() + 14 * 24 * 60 * 60 * 1000),
      deadline: new Date(currentQuarterStart.getTime() + 35 * 24 * 60 * 60 * 1000),
      phases: [
        {
          type: 'Iteration',
          color: PHASE_COLORS.Iteration,
          stories: [
            { id: 'DEMO-502', summary: 'Redesign welcome email', storyPoints: 2, status: 'Done', timeSpent: 16, phase: 'Iteration' },
            { id: 'DEMO-503', summary: 'Update transactional emails', storyPoints: 3, status: 'Done', timeSpent: 24, phase: 'Iteration' },
          ],
        },
        {
          type: 'Testing',
          color: PHASE_COLORS.Testing,
          stories: [
            { id: 'DEMO-504', summary: 'Cross-client testing', storyPoints: 2, status: 'Done', timeSpent: 16, phase: 'Testing' },
          ],
        },
      ],
    },
    {
      id: 'DEMO-601',
      name: 'Accessibility Audit',
      size: 'M',
      status: 'in-progress',
      startDate: new Date(currentQuarterStart.getTime() + 28 * 24 * 60 * 60 * 1000),
      phases: [
        {
          type: 'Discovery',
          color: PHASE_COLORS.Discovery,
          recommendedTools: ['Use axe DevTools', 'Use WAVE for accessibility testing'],
          stories: [
            { id: 'DEMO-602', summary: 'WCAG compliance audit', storyPoints: 5, status: 'Done', timeSpent: 40, phase: 'Discovery' },
            { id: 'DEMO-603', summary: 'Screen reader testing', storyPoints: 3, status: 'In Progress', timeSpent: 12, phase: 'Discovery' },
          ],
        },
        {
          type: 'Iteration',
          color: PHASE_COLORS.Iteration,
          stories: [
            { id: 'DEMO-604', summary: 'Fix critical issues', storyPoints: 5, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
            { id: 'DEMO-605', summary: 'Update color contrast', storyPoints: 2, status: 'Backlog', timeSpent: 0, phase: 'Iteration' },
          ],
        },
      ],
    },
  ],
};
