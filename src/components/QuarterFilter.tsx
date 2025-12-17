import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface QuarterFilterProps {
  selectedQuarter: { start: Date; end: Date; label: string };
  onQuarterChange: (quarter: { start: Date; end: Date; label: string }) => void;
}

function getQuarters(yearsBack: number = 2, yearsForward: number = 1): Array<{ start: Date; end: Date; label: string }> {
  const quarters = [];
  const currentYear = new Date().getFullYear();
  
  for (let year = currentYear - yearsBack; year <= currentYear + yearsForward; year++) {
    for (let q = 1; q <= 4; q++) {
      const startMonth = (q - 1) * 3;
      const start = new Date(year, startMonth, 1);
      const end = new Date(year, startMonth + 3, 0);
      quarters.push({
        start,
        end,
        label: `Q${q} ${year}`,
      });
    }
  }
  
  return quarters.reverse();
}

function getCurrentQuarter(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  const startMonth = (quarter - 1) * 3;
  
  return {
    start: new Date(year, startMonth, 1),
    end: new Date(year, startMonth + 3, 0),
    label: `Q${quarter} ${year}`,
  };
}

export const QuarterFilter = ({ selectedQuarter, onQuarterChange }: QuarterFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const quarters = getQuarters();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Quarter Filter
      </h3>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <span className="font-medium text-gray-800">{selectedQuarter.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
              {quarters.map((quarter, index) => {
                const isSelected = quarter.label === selectedQuarter.label;
                const isCurrent = quarter.label === getCurrentQuarter().label;
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      onQuarterChange(quarter);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span>{quarter.label}</span>
                    {isCurrent && !isSelected && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Current</span>
                    )}
                    {isSelected && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Start:</span>
          <span className="font-medium">{selectedQuarter.start.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">End:</span>
          <span className="font-medium">{selectedQuarter.end.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export { getCurrentQuarter };
