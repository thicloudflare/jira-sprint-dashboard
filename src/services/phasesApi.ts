import type { TimelineData } from '../types';

export class PhasesApiService {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://ai-design-workflow.pages.dev') {
    this.baseUrl = baseUrl;
  }

  async fetchPhases(): Promise<TimelineData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/phases`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch phases: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.transformToTimelineData(data);
    } catch (error) {
      console.error('Failed to fetch phases from API:', error);
      throw error;
    }
  }

  private transformToTimelineData(data: any): TimelineData {
    return {
      epics: data.epics || [],
      config: data.config || {
        storyPointToHours: 8,
        workingHoursPerDay: 8,
        totalAvailableHours: 160,
      },
      quarterStart: data.quarterStart ? new Date(data.quarterStart) : new Date(),
      quarterEnd: data.quarterEnd ? new Date(data.quarterEnd) : new Date(),
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/phases`);
      return response.ok;
    } catch (error) {
      console.error('Phases API connection test failed:', error);
      return false;
    }
  }
}
