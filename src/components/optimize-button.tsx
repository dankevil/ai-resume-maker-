import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OptimizeButtonProps {
  content: any;
  onOptimized: (optimizedContent: any) => void;
}

export function OptimizeButton({ content, onOptimized }: OptimizeButtonProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    try {
      setIsOptimizing(true);
      const response = await fetch('/api/resume/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Optimization failed');
      }

      const { data } = await response.json();
      onOptimized(data);
      toast.success('Resume optimized successfully!');
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to optimize resume. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Button
      onClick={handleOptimize}
      disabled={isOptimizing}
      className="relative"
    >
      {isOptimizing && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-white"></div>
        </span>
      )}
      <span className={isOptimizing ? 'pl-7' : ''}>
        {isOptimizing ? 'Optimizing...' : 'Optimize with AI'}
      </span>
    </Button>
  );
} 