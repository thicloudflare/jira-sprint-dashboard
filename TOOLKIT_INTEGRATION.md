# AI Toolkit Integration Guide

This guide explains how to integrate the AI Design Toolkit into the vibe-dashboard project.

## Setup

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and add your toolkit URLs:

```bash
cp .env.example .env.local
```

Update the AI Toolkit configuration in `.env.local`:

```env
# AI Toolkit Configuration
VITE_AI_TOOLKIT_API_URL=https://ai-design-workflow.pages.dev/api
VITE_AI_TOOLKIT_FULL_URL=https://ai-design-workflow.pages.dev
```

For local development, you can use:
```env
VITE_AI_TOOLKIT_API_URL=http://localhost:3000/api
VITE_AI_TOOLKIT_FULL_URL=http://localhost:3000
```

### 2. Import the Component

Add the `FeaturedToolkit` component to your app:

```tsx
import { FeaturedToolkit } from './components/FeaturedToolkit';

function App() {
  return (
    <div>
      {/* Your existing components */}
      
      {/* Featured AI Toolkit - shows 2 tools per phase by default */}
      <FeaturedToolkit />
      
      {/* Or customize the number of tools */}
      <FeaturedToolkit toolsPerPhase={3} />
    </div>
  );
}
```

## Features

### Available Components

#### `<FeaturedToolkit />`
Displays featured tools from each phase of the AI Design Workflow.

**Props:**
- `toolsPerPhase` (optional): Number of tools to show per phase (default: 2)

**Example:**
```tsx
<FeaturedToolkit toolsPerPhase={2} />
```

### API Service

Use the `toolkitApi` service to fetch data programmatically:

```tsx
import { toolkitApi } from './services/toolkitApi';

// Get all phases
const phases = await toolkitApi.getAllPhases();

// Get featured tools (limited per phase)
const featuredTools = await toolkitApi.getFeaturedTools(2);

// Get full toolkit URL
const url = toolkitApi.getFullToolkitUrl();
const phaseUrl = toolkitApi.getFullToolkitUrl(1); // Link to specific phase

// Search tools
const results = await toolkitApi.searchTools('gemini');

// Get statistics
const stats = await toolkitApi.getStats();
```

## Architecture

### Data Flow

```
vibe-dashboard → toolkitApi service → ai-toolkit API → Cloudflare Worker → phases data
```

### Type Safety

All toolkit data is fully typed with TypeScript:

```typescript
import type { ToolkitPhase, ToolkitTool, ToolkitSection } from './types/toolkit';
```

## Customization

### Styling

The component uses Tailwind CSS classes. Customize by:

1. Modifying the component directly in `src/components/FeaturedToolkit.tsx`
2. Overriding classes with your own styles

### Tool Icons

- **Gemini** tools: Purple Sparkles icon
- **Miro** tools: Blue ExternalLink icon

### Links

All tools link to their respective URLs (external).
Phase cards link to the full toolkit filtered by phase.

## API Endpoints Used

- `GET /api/phases` - Fetch all workflow phases
- `GET /api/search?q={query}` - Search tools
- `GET /api/stats` - Get toolkit statistics

## Troubleshooting

### Tools not loading?

1. Check your `.env.local` file has correct API URL
2. Verify the API is accessible: `curl https://ai-design-workflow.pages.dev/api/health`
3. Check browser console for errors

### CORS issues?

The API should have CORS enabled. If you see CORS errors, ensure the API URL is correct and the API is deployed.

## Example Integration

```tsx
// App.tsx
import { FeaturedToolkit } from './components/FeaturedToolkit';

export function App() {
  return (
    <div className="container mx-auto p-6">
      <h1>VIBE Dashboard</h1>
      
      {/* Your dashboard content */}
      
      {/* AI Toolkit Section */}
      <section className="mt-12">
        <FeaturedToolkit toolsPerPhase={2} />
      </section>
    </div>
  );
}
```

## Next Steps

- Customize the component styling to match your dashboard theme
- Add filtering or search functionality
- Create custom views for specific phases
- Integrate with your existing dashboard analytics
