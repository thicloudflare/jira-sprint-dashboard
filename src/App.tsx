import { useState, useEffect, useMemo } from 'react';
import type { Phase, TimelineData, EpicStatus, PhaseType } from './types';
import { mockData } from './mockData';
import { Sidebar } from './components/Sidebar';
import { Timeline } from './components/Timeline';
import { PhaseDetailPanel } from './components/PhaseDetailPanel';
import { JiraSettings, type JiraConfig } from './components/JiraSettings';
import { JiraApiService } from './services/jiraApi';
import { JiraWriteService } from './services/jiraWrite';
import { transformJiraDataToTimeline } from './services/jiraTransformer';
// import { PhasesApiService } from './services/phasesApi';
import { getCurrentQuarter } from './components/QuarterFilter';
import { Loader, AlertCircle } from 'lucide-react';

const PHASE_COLORS: Record<PhaseType, string> = {
  Discovery: '#8B5CF6',
  Iteration: '#3B82F6',
  Testing: '#F59E0B',
  Implement: '#10B981',
};

function App() {
  const [selectedPhaseKey, setSelectedPhaseKey] = useState<{ epicId: string; phaseType: PhaseType } | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData>(() => ({
    ...mockData,
    epics: mockData.epics.map(epic => ({ ...epic, phases: epic.phases.map(p => ({ ...p })) }))
  }));
  const [jiraData, setJiraData] = useState<TimelineData | null>(null);
  const [phasesApiData] = useState<TimelineData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [jiraConfig, setJiraConfig] = useState<JiraConfig | null>(null);
  const [jiraWriteService, setJiraWriteService] = useState<JiraWriteService | null>(null);
  const [isPhasesApiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());

  const handleJiraConnect = async (config: JiraConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      const jiraService = new JiraApiService({
        domain: config.domain,
        email: config.email,
        apiToken: config.apiToken,
        cfAccessClientId: config.cfAccessClientId,
        cfAccessClientSecret: config.cfAccessClientSecret,
        cfAccessToken: config.cfAccessToken,
      });

      const connectionTest = await jiraService.testConnection();
      if (!connectionTest) {
        throw new Error('Failed to connect to Jira. Please check your credentials.');
      }

      const { epics, issuesByEpic } = await jiraService.getAllWorkloadData(
        config.projectKey,
        config.assignee
      );

      const transformedData = transformJiraDataToTimeline(epics, issuesByEpic);
      
      // Create write service for syncing changes back to Jira
      const writeService = new JiraWriteService({
        domain: config.domain,
        email: config.email,
        apiToken: config.apiToken,
        cfAccessClientId: config.cfAccessClientId,
        cfAccessClientSecret: config.cfAccessClientSecret,
      });
      
      console.log('✅ Jira data loaded successfully:', {
        epicCount: transformedData.epics.length,
        epics: transformedData.epics.map(e => ({
          id: e.id,
          name: e.name,
          phaseCount: e.phases.length,
          phases: e.phases.map(p => p.type)
        }))
      });
      
      setJiraData(transformedData);
      setTimelineData(transformedData);
      setIsConnected(true);
      setUseMockData(false);
      setJiraConfig(config);
      setJiraWriteService(writeService);
      
      console.log('✅ State updated, jiraData and timelineData set');
    } catch (err) {
      console.error('Jira connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Jira');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedDomain = localStorage.getItem('jira_domain');
    const savedEmail = localStorage.getItem('jira_email');
    const savedToken = localStorage.getItem('jira_token');

    if (savedDomain && savedEmail && savedToken) {
      handleJiraConnect({
        domain: savedDomain,
        email: savedEmail,
        apiToken: savedToken,
        projectKey: localStorage.getItem('jira_project') || undefined,
        assignee: localStorage.getItem('jira_assignee') || undefined,
      });
    }
  }, []);

  // Update document title based on Jira email/username
  useEffect(() => {
    const email = jiraConfig?.email;
    if (email) {
      const username = email.split('@')[0];
      const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);
      document.title = `${capitalizedName}'s Jira Dashboard`;
    } else {
      document.title = 'Your Jira Dashboard';
    }
  }, [jiraConfig]);

  const handleEpicStatusChange = (epicId: string, newStatus: EpicStatus) => {
    const updateData = (prevData: TimelineData) => {
      const updatedEpics = prevData.epics.map(epic => {
        if (epic.id !== epicId) return epic;
        
        const updatedEpic = { ...epic, status: newStatus };
        
        if (newStatus === 'in-progress' && epic.phases.length === 0) {
          const totalPoints = epic.size === 'S' ? 21 : epic.size === 'M' ? 55 : 144;
          const phaseDistribution = {
            Discovery: 0.15,
            Iteration: 0.35,
            Testing: 0.30,
            Implement: 0.20,
          };
          
          updatedEpic.phases = [
            {
              type: 'Discovery',
              color: PHASE_COLORS.Discovery,
              stories: [{
                id: `${epicId}-discovery-placeholder`,
                summary: 'Discovery phase placeholder',
                storyPoints: Math.round(totalPoints * phaseDistribution.Discovery),
                status: 'Backlog' as const,
                timeSpent: 0,
                phase: 'Discovery' as const,
              }],
            },
            {
              type: 'Iteration',
              color: PHASE_COLORS.Iteration,
              stories: [{
                id: `${epicId}-iteration-placeholder`,
                summary: 'Iteration phase placeholder',
                storyPoints: Math.round(totalPoints * phaseDistribution.Iteration),
                status: 'Backlog' as const,
                timeSpent: 0,
                phase: 'Iteration' as const,
              }],
            },
            {
              type: 'Testing',
              color: PHASE_COLORS.Testing,
              stories: [{
                id: `${epicId}-testing-placeholder`,
                summary: 'Testing phase placeholder',
                storyPoints: Math.round(totalPoints * phaseDistribution.Testing),
                status: 'Backlog' as const,
                timeSpent: 0,
                phase: 'Testing' as const,
              }],
            },
            {
              type: 'Implement',
              color: PHASE_COLORS.Implement,
              stories: [{
                id: `${epicId}-implement-placeholder`,
                summary: 'Implement phase placeholder',
                storyPoints: Math.round(totalPoints * phaseDistribution.Implement),
                status: 'Backlog' as const,
                timeSpent: 0,
                phase: 'Implement' as const,
              }],
            },
          ];
        }
        
        return updatedEpic;
      });
      
      return { ...prevData, epics: updatedEpics };
    };

    setTimelineData(updateData);
    if (isConnected && jiraData) {
      setJiraData(prevData => prevData ? updateData(prevData) : prevData);
    }
  };

  const handleAddStory = async (phaseType: string, newStory: typeof mockData.epics[0]['phases'][0]['stories'][0]) => {
    const updateData = (prevData: TimelineData) => {
      const updatedEpics = prevData.epics.map(epic => {
        const phaseIndex = epic.phases.findIndex(p => p.type === phaseType);
        if (phaseIndex === -1) return epic;
        
        const updatedPhases = [...epic.phases];
        updatedPhases[phaseIndex] = {
          ...updatedPhases[phaseIndex],
          stories: [...updatedPhases[phaseIndex].stories, newStory],
        };
        
        return {
          ...epic,
          phases: updatedPhases,
        };
      });
      
      return { ...prevData, epics: updatedEpics };
    };

    // Write to Jira if connected
    if (isConnected && jiraWriteService && jiraConfig && selectedPhaseKey) {
      console.log('🔵 Attempting to create Jira issue...', { 
        isConnected, 
        hasWriteService: !!jiraWriteService, 
        hasConfig: !!jiraConfig,
        projectKey: jiraConfig.projectKey 
      });
      
      try {
        const epic = timelineData.epics.find(e => e.id === selectedPhaseKey.epicId);
        console.log('🔵 Found epic:', epic?.id, epic?.name);
        
        if (epic && epic.id.startsWith('STORY-')) {
          console.log('⚠️ Skipping Jira sync for mock epic');
        } else if (epic && jiraConfig.projectKey) {
          console.log('🔵 Creating Jira issue with data:', {
            summary: newStory.summary,
            projectKey: jiraConfig.projectKey,
            parentKey: epic.id,
            storyPoints: newStory.storyPoints
          });
          
          // Try to create issue, story points field may not be available in this Jira instance
          const issuePayload: any = {
            summary: newStory.summary,
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Story created from dashboard'
                    }
                  ]
                }
              ]
            },
            issuetype: { name: 'Story' },
            project: { key: jiraConfig.projectKey },
            parent: { key: epic.id },
            labels: [phaseType], // Add phase label for tracking
          };
          
          // Try with customfield_10040 (the correct story points field for this Jira instance)
          try {
            const createdIssue = await jiraWriteService.createIssue({
              ...issuePayload,
              customfield_10040: newStory.storyPoints,
            });
            console.log('✅ Created Jira issue with story points (10040):', createdIssue.key);
            newStory.id = createdIssue.key;
          } catch (error: any) {
            console.error('❌ Failed with customfield_10040:', error);
            throw error;
          }
        } else {
          console.warn('⚠️ Missing required data for Jira sync:', { hasEpic: !!epic, hasProjectKey: !!jiraConfig.projectKey });
        }
      } catch (error) {
        console.error('❌ Failed to create Jira issue:', error);
        // Continue with local update even if Jira fails
      }
    } else {
      console.log('⚠️ Jira sync skipped:', { isConnected, hasWriteService: !!jiraWriteService, hasConfig: !!jiraConfig, hasSelectedPhase: !!selectedPhaseKey });
    }

    setTimelineData(updateData);
    if (isConnected && jiraData) {
      setJiraData(prevData => prevData ? updateData(prevData) : prevData);
    }
  };

  const handleUpdateStoryStatus = async (storyId: string, newStatus: typeof mockData.epics[0]['phases'][0]['stories'][0]['status']) => {
    // Write to Jira if connected and not a mock story
    if (isConnected && jiraWriteService && !storyId.startsWith('STORY-')) {
      console.log('🔵 Attempting to update Jira issue status:', storyId, '→', newStatus);
      try {
        await jiraWriteService.updateIssueStatus(storyId, newStatus);
        console.log('✅ Updated Jira issue status:', storyId, '→', newStatus);
      } catch (error) {
        console.error('❌ Failed to update Jira issue status:', error);
        // Continue with local update even if Jira fails
      }
    } else {
      console.log('⚠️ Jira status update skipped:', { isConnected, hasWriteService: !!jiraWriteService, isMockStory: storyId.startsWith('STORY-') });
    }

    const updateData = (prevData: TimelineData) => {
      const updatedEpics = prevData.epics.map(epic => ({
        ...epic,
        phases: epic.phases.map(phase => ({
          ...phase,
          stories: phase.stories.map(story =>
            story.id === storyId ? { ...story, status: newStatus } : story
          ),
        })),
      }));
      
      return { ...prevData, epics: updatedEpics };
    };

    setTimelineData(updateData);
    if (isConnected && jiraData) {
      setJiraData(prevData => prevData ? updateData(prevData) : prevData);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    // Write to Jira if connected and not a mock story
    if (isConnected && jiraWriteService && !storyId.startsWith('STORY-')) {
      console.log('🔵 Attempting to delete Jira issue:', storyId);
      try {
        await jiraWriteService.deleteIssue(storyId);
        console.log('✅ Deleted Jira issue:', storyId);
      } catch (error) {
        console.error('❌ Failed to delete Jira issue:', error);
        // Continue with local update even if Jira fails
      }
    } else {
      console.log('⚠️ Jira delete skipped:', { isConnected, hasWriteService: !!jiraWriteService, isMockStory: storyId.startsWith('STORY-') });
    }

    const updateData = (prevData: TimelineData) => {
      const updatedEpics = prevData.epics.map(epic => ({
        ...epic,
        phases: epic.phases.map(phase => ({
          ...phase,
          stories: phase.stories.filter(story => story.id !== storyId),
        })),
      }));
      
      return { ...prevData, epics: updatedEpics };
    };

    setTimelineData(updateData);
    if (isConnected && jiraData) {
      setJiraData(prevData => prevData ? updateData(prevData) : prevData);
    }
  };

  const handleDeletePhase = (epicId: string, phaseType: PhaseType) => {
    const updateData = (prevData: TimelineData) => {
      const updatedEpics = prevData.epics.map(epic => {
        if (epic.id !== epicId) return epic;
        
        return {
          ...epic,
          phases: epic.phases.filter(phase => phase.type !== phaseType),
        };
      });
      
      return { ...prevData, epics: updatedEpics };
    };

    setTimelineData(updateData);
    if (isConnected && jiraData) {
      setJiraData(prevData => prevData ? updateData(prevData) : prevData);
    }
    
    if (selectedPhaseKey?.epicId === epicId && selectedPhaseKey?.phaseType === phaseType) {
      setSelectedPhaseKey(null);
    }
  };

  const handleAddPhase = (epicId: string, phaseType: PhaseType) => {
    const updateData = (prevData: TimelineData) => {
      const updatedEpics = prevData.epics.map(epic => {
        if (epic.id !== epicId) return epic;
        
        if (epic.phases.some(p => p.type === phaseType)) {
          return epic;
        }
        
        const newPhase: Phase = {
          type: phaseType,
          color: PHASE_COLORS[phaseType],
          stories: [],
          recommendedTools: getRecommendedToolsForPhase(phaseType),
        };
        
        return {
          ...epic,
          phases: [...epic.phases, newPhase],
        };
      });
      
      return { ...prevData, epics: updatedEpics };
    };

    setTimelineData(updateData);
    if (isConnected && jiraData) {
      setJiraData(prevData => prevData ? updateData(prevData) : prevData);
    }
  };

  const getRecommendedToolsForPhase = (phaseType: PhaseType): string[] => {
    const toolsMap: Record<PhaseType, string[]> = {
      Discovery: ['Use Miro for brainstorming', 'Use Confluence for documentation', 'Use Notion for planning'],
      Iteration: ['Use Figma for mockups', 'Use GitHub Copilot for code generation', 'Use Loom for walkthroughs'],
      Testing: ['Use Cypress for E2E testing', 'Use Browserstack for cross-browser testing', 'Use Jest for unit testing'],
      Implement: ['Use Docker for containerization', 'Use GitHub Actions for CI/CD', 'Use Vercel for hosting'],
    };
    return toolsMap[phaseType] || [];
  };

  const handleReorderPhases = (epicId: string, fromIndex: number, toIndex: number) => {
    setTimelineData(prevData => {
      const updatedEpics = prevData.epics.map(epic => {
        if (epic.id !== epicId) return epic;
        
        const phases = [...epic.phases];
        const [movedPhase] = phases.splice(fromIndex, 1);
        phases.splice(toIndex, 0, movedPhase);
        
        return {
          ...epic,
          phases,
        };
      });
      
      return { ...prevData, epics: updatedEpics };
    });
  };

  const displayData = useMemo(() => {
    let data;
    if (useMockData) data = timelineData;
    else if (isPhasesApiConnected && phasesApiData) data = phasesApiData;
    else if (isConnected && jiraData) data = jiraData;
    else data = timelineData;
    
    // Filter to only in-progress and done, then sort: in-progress on top, done on bottom
    const filteredEpics = data.epics.filter(epic => 
      epic.status === 'in-progress' || epic.status === 'done'
    );
    
    const sortedEpics = [...filteredEpics].sort((a) => {
      return a.status === 'in-progress' ? -1 : 1;
    });
    
    console.log('📊 displayData updated:', {
      source: useMockData ? 'mock' : isConnected ? 'jira' : 'timeline',
      epicCount: sortedEpics.length,
      epics: sortedEpics.map(e => ({
        id: e.id,
        phaseCount: e.phases.length
      }))
    });
    
    return { ...data, epics: sortedEpics };
  }, [useMockData, timelineData, jiraData, phasesApiData, isConnected, isPhasesApiConnected]);

  const selectedPhase = useMemo(() => {
    if (!selectedPhaseKey) return null;
    
    for (const epic of displayData.epics) {
      if (epic.id === selectedPhaseKey.epicId) {
        const phase = epic.phases.find(p => p.type === selectedPhaseKey.phaseType);
        if (phase) return phase;
      }
    }
    return null;
  }, [selectedPhaseKey, displayData]);

  const handlePhaseClick = (phase: Phase, epicId: string) => {
    setSelectedPhaseKey({ epicId, phaseType: phase.type });
  };

  const filteredDataByQuarter = useMemo(() => {
    return {
      ...displayData,
      quarterStart: selectedQuarter.start,
      quarterEnd: selectedQuarter.end,
      epics: displayData.epics.filter(epic => {
        const epicStart = epic.startDate;
        const epicEnd = epic.deadline || new Date();
        
        return (
          (epicStart >= selectedQuarter.start && epicStart <= selectedQuarter.end) ||
          (epicEnd >= selectedQuarter.start && epicEnd <= selectedQuarter.end) ||
          (epicStart <= selectedQuarter.start && epicEnd >= selectedQuarter.end)
        );
      }),
    };
  }, [displayData, selectedQuarter]);

  const timelineFilteredData = useMemo(() => {
    // Show all epics on timeline, don't filter by status
    return filteredDataByQuarter;
  }, [filteredDataByQuarter]);

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <JiraSettings onConnect={handleJiraConnect} isConnected={isConnected} />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-2xl flex items-center gap-3">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-800 font-medium">Loading Jira data...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-20 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-40 max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Connection Error</h4>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}


      <Sidebar 
        data={filteredDataByQuarter}
        selectedQuarter={selectedQuarter}
        onQuarterChange={setSelectedQuarter}
        onEpicStatusChange={handleEpicStatusChange}
      />
      <Timeline
        data={timelineFilteredData}
        onPhaseClick={handlePhaseClick}
        selectedPhase={selectedPhase}
        onAddPhase={handleAddPhase}
        onReorderPhases={handleReorderPhases}
        jiraDomain={jiraConfig?.domain}
        userEmail={jiraConfig?.email}
      />
      <PhaseDetailPanel
        phase={selectedPhase}
        config={filteredDataByQuarter.config}
        onClose={() => setSelectedPhaseKey(null)}
        onAddStory={handleAddStory}
        onUpdateStoryStatus={handleUpdateStoryStatus}
        onDeleteStory={handleDeleteStory}
        onDeletePhase={(phaseType) => selectedPhaseKey && handleDeletePhase(selectedPhaseKey.epicId, phaseType)}
        epicId={selectedPhaseKey?.epicId}
      />
    </div>
  );
}

export default App;
