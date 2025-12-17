export interface ToolkitTool {
  name: string;
  icon: 'gemini' | 'miro';
  url: string;
  description: string;
  coreOutputFocus?: CoreOutputFrame[];
  instructions?: string[];
}

export interface CoreOutputFrame {
  frame: string;
  keyDeliverables: string;
  details?: FrameDetail[];
}

export interface FrameDetail {
  title: string;
  description: string;
}

export interface ToolkitSection {
  title: string;
  tools: ToolkitTool[];
}

export interface ToolkitPhase {
  number: number;
  title: string;
  description: string;
  sections: ToolkitSection[];
}

export interface ToolkitApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}
