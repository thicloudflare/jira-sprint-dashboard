import { X, Lightbulb, Target, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Phase, WorkloadConfig, Story, StoryStatus, PhaseType } from '../types';
import { calculatePhaseRemainingHours, formatHours } from '../utils';
import { StoryStatusControl } from './StoryStatusControl';

interface PhaseDetailPanelProps {
  phase: Phase | null;
  config: WorkloadConfig;
  onClose: () => void;
  onAddStory?: (phaseType: string, story: Story) => void;
  onUpdateStoryStatus?: (storyId: string, newStatus: StoryStatus) => void;
  onDeleteStory?: (storyId: string) => void;
  onDeletePhase?: (phaseType: PhaseType) => void;
  epicId?: string;
}

export const PhaseDetailPanel = ({ phase, config, onClose, onAddStory, onUpdateStoryStatus, onDeleteStory, onDeletePhase, epicId: _epicId }: PhaseDetailPanelProps) => {
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryPoints, setNewStoryPoints] = useState('3');
  const [toolkitTools, setToolkitTools] = useState<Array<{ name: string; url: string; id?: string; slug?: string; description?: string; tags?: string[] }>>([]);
  const [loadingTools, setLoadingTools] = useState(false);

  useEffect(() => {
    if (phase) {
      fetchToolkitTools(phase.type);
    }
  }, [phase]);

  const fetchToolkitTools = async (phaseType: string) => {
    setLoadingTools(true);
    
    // Map dashboard phases to toolkit API phases
    const phaseMapping: Record<string, string> = {
      'Discovery': 'Discovery',
      'Iteration': 'Ideation',
      'Testing': 'Testing',
      'Implement': 'Development'
    };
    
    const mappedPhase = phaseMapping[phaseType] || phaseType;
    console.log('🔍 Fetching tools for phase:', phaseType, '→', mappedPhase);
    
    try {
      const response = await fetch(`/api/toolkit-proxy/phases`);
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📦 API Response:', result);
        
        const phases = result.data || result;
        console.log('📋 Phases array:', phases);
        
        if (!Array.isArray(phases)) {
          console.error('❌ Phases is not an array:', typeof phases);
          setToolkitTools([]);
          return;
        }
        
        // Find the matching phase using mapped name
        const matchingPhase = phases.find((p: any) => {
          const phaseName = (p.name || p.title || '').toLowerCase();
          const searchType = mappedPhase.toLowerCase();
          console.log('🔎 Comparing:', phaseName, 'with', searchType);
          return phaseName === searchType || phaseName.includes(searchType) || searchType.includes(phaseName);
        });
        
        console.log('✅ Matching phase found:', matchingPhase);
        
        if (matchingPhase?.sections) {
          const allTools: any[] = [];
          matchingPhase.sections.forEach((section: any) => {
            console.log('📂 Section:', section.title, 'Tools count:', section.tools?.length);
            if (section.tools && Array.isArray(section.tools)) {
              section.tools.forEach((tool: any) => {
                allTools.push({
                  name: tool.name || 'Unnamed Tool',
                  url: tool.url || '#',
                  id: tool.id || tool.slug,
                  slug: tool.slug,
                  description: tool.description,
                  tags: tool.tags
                });
              });
            }
          });
          
          console.log('🛠️ Total tools extracted:', allTools.length);
          setToolkitTools(allTools.slice(0, 2));
        } else {
          console.warn('⚠️ No matching phase or sections. Available phases:', 
            phases.map((p: any) => p.title || p.name));
          setToolkitTools([]);
        }
      } else {
        console.error('❌ API response not OK:', response.status);
        setToolkitTools([]);
      }
    } catch (error) {
      console.error('💥 Failed to fetch toolkit tools:', error);
      setToolkitTools([]);
    } finally {
      setLoadingTools(false);
    }
  };

  const handleAddStory = () => {
    if (!phase || !newStoryTitle.trim() || !onAddStory) return;

    const newStory: Story = {
      id: `STORY-${Date.now()}`,
      summary: newStoryTitle,
      storyPoints: parseInt(newStoryPoints) || 3,
      status: 'Backlog',
      timeSpent: 0,
      phase: phase.type,
    };

    onAddStory(phase.type, newStory);
    setNewStoryTitle('');
    setNewStoryPoints('3');
    setIsAddingStory(false);
  };

  if (!phase) return null;

  const remainingHours = calculatePhaseRemainingHours(phase, config);
  const totalPoints = phase.stories.reduce((sum, story) => sum + story.storyPoints, 0);
  const completedStories = phase.stories.filter((story) => story.status === 'Done').length;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-50 animate-slide-in">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{phase.type}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {completedStories} of {phase.stories.length} stories completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          {phase.stories.length === 0 && onDeletePhase && (
            <button
              onClick={() => {
                onDeletePhase(phase.type);
                onClose();
              }}
              className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-600"
              title="Delete empty phase"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Phase Metrics</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Points:</span>
              <span className="font-semibold">{totalPoints} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Remaining Effort:</span>
              <span className="font-semibold text-blue-600">{formatHours(remainingHours)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Estimated Days:</span>
              <span className="font-semibold">{(remainingHours / config.workingHoursPerDay).toFixed(1)}d</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-900">Recommended Tools</h4>
            </div>
            <a
              href={`https://ai-design-workflow.thi-s-ent-account.workers.dev/?phase=${phase.type}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-yellow-700 hover:text-yellow-900 flex items-center gap-1"
            >
              Full Toolkit <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          {loadingTools ? (
            <div className="text-sm text-gray-600">Loading tools...</div>
          ) : toolkitTools.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {toolkitTools.map((tool, index) => (
                <li key={index} className="flex items-start gap-2 p-2 hover:bg-yellow-100 rounded transition-colors">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <div className="flex-1">
                    <a 
                      href={tool.url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {tool.name}
                    </a>
                    {tool.description && (
                      <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-600">No tools available for this phase</div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Stories</h4>
            {onAddStory && !isAddingStory && (
              <button
                onClick={() => setIsAddingStory(true)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Story
              </button>
            )}
          </div>

          {isAddingStory && (
            <div className="mb-4 border border-blue-200 rounded-lg p-4 bg-blue-50">
              <input
                type="text"
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                placeholder="Story title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm"
                autoFocus
              />
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm font-medium text-gray-700">Story Points:</label>
                <select
                  value={newStoryPoints}
                  onChange={(e) => setNewStoryPoints(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  {[1, 2, 3, 5, 8, 13, 21].map(points => (
                    <option key={points} value={points}>{points}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddStory}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Add Story
                </button>
                <button
                  onClick={() => {
                    setIsAddingStory(false);
                    setNewStoryTitle('');
                    setNewStoryPoints('3');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {phase.stories.length === 0 && !isAddingStory && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No stories yet. Click "Add Story" to create one.
              </div>
            )}
            {phase.stories.map((story) => (
              <div
                key={story.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm mb-1">
                      {story.summary}
                    </div>
                    <div className="text-xs text-gray-500">{story.id}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {onUpdateStoryStatus && (
                      <StoryStatusControl
                        currentStatus={story.status}
                        onStatusChange={(newStatus) => onUpdateStoryStatus(story.id, newStatus)}
                      />
                    )}
                    {onDeleteStory && (
                      <button
                        onClick={() => onDeleteStory(story.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-700 transition-colors"
                        title="Delete story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="font-semibold">{story.storyPoints} pts</span>
                  <span>
                    {story.timeSpent}h / {story.storyPoints * config.storyPointToHours}h
                  </span>
                  {story.timeSpent > 0 && (
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${Math.min(
                            (story.timeSpent / (story.storyPoints * config.storyPointToHours)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
