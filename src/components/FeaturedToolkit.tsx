import { useEffect, useState } from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';
import type { ToolkitPhase, ToolkitTool } from '../types/toolkit';
import { toolkitApi } from '../services/toolkitApi';

interface FeaturedToolkitProps {
  toolsPerPhase?: number;
}

export function FeaturedToolkit({ toolsPerPhase = 2 }: FeaturedToolkitProps) {
  const [phases, setPhases] = useState<ToolkitPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeaturedTools() {
      try {
        setLoading(true);
        const data = await toolkitApi.getFeaturedTools(toolsPerPhase);
        setPhases(data);
      } catch (err) {
        setError('Failed to load AI toolkit');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedTools();
  }, [toolsPerPhase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
        {error}
      </div>
    );
  }

  if (phases.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded text-gray-700">
        No tools available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">AI Design Toolkit</h2>
        <a
          href={toolkitApi.getFullToolkitUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
        >
          View Full Toolkit
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {phases.map((phase) => (
          <PhaseCard key={phase.number} phase={phase} />
        ))}
      </div>
    </div>
  );
}

function PhaseCard({ phase }: { phase: ToolkitPhase }) {
  const allTools = phase.sections.flatMap(s => s.tools);
  const hasMoreTools = phase.sections.some(s => s.tools.length > 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-orange-600 font-bold text-lg">
            {phase.number}.
          </span>
          <h3 className="text-lg font-bold text-gray-900">{phase.title}</h3>
        </div>
        <p className="text-sm text-gray-600">{phase.description}</p>
      </div>

      <div className="space-y-3 mb-4">
        {allTools.map((tool, idx) => (
          <ToolItem key={idx} tool={tool} />
        ))}
      </div>

      {hasMoreTools && (
        <a
          href={toolkitApi.getFullToolkitUrl(phase.number)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
        >
          View all {phase.title} tools
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

function ToolItem({ tool }: { tool: ToolkitTool }) {
  const Icon = tool.icon === 'gemini' ? Sparkles : ExternalLink;

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors group"
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
        tool.icon === 'gemini' ? 'text-purple-600' : 'text-blue-600'
      }`} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
          {tool.name}
        </h4>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          {tool.description}
        </p>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </a>
  );
}
