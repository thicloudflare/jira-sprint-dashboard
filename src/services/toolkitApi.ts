import type { ToolkitPhase, ToolkitApiResponse } from '../types/toolkit';

const API_URL = import.meta.env.VITE_AI_TOOLKIT_API_URL || 'http://localhost:3001/api/toolkit-proxy';
const FULL_TOOLKIT_URL = import.meta.env.VITE_AI_TOOLKIT_FULL_URL || 'https://ai-design-workflow.thi-s-ent-account.workers.dev';

export const toolkitApi = {
  async getAllPhases(): Promise<ToolkitPhase[]> {
    try {
      const response = await fetch(`${API_URL}/phases`);
      const data: ToolkitApiResponse<ToolkitPhase[]> = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      throw new Error(data.error || 'Failed to fetch phases');
    } catch (error) {
      console.error('Error fetching toolkit phases:', error);
      return [];
    }
  },

  async getFeaturedTools(toolsPerPhase: number = 2): Promise<ToolkitPhase[]> {
    try {
      const phases = await this.getAllPhases();
      
      // Limit tools to specified number per phase
      return phases.map(phase => ({
        ...phase,
        sections: phase.sections.map(section => ({
          ...section,
          tools: section.tools.slice(0, toolsPerPhase)
        })).filter(section => section.tools.length > 0)
      }));
    } catch (error) {
      console.error('Error fetching featured tools:', error);
      return [];
    }
  },

  getFullToolkitUrl(phaseNumber?: number): string {
    if (phaseNumber) {
      return `${FULL_TOOLKIT_URL}#phase-${phaseNumber}`;
    }
    return FULL_TOOLKIT_URL;
  },

  async searchTools(query: string) {
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching tools:', error);
      return null;
    }
  },

  async getStats() {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }
};
