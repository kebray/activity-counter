interface ProgressBarProps {
  current: number;
  min: number;
  max: number | null;
  showPercentage?: boolean;
}

export function ProgressBar({ current, min, max, showPercentage = true }: ProgressBarProps) {
  if (max === null) {
    // No upper bound - show infinite progress indicator
    return (
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{current} completed</span>
          <span>No limit</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: '100%', opacity: 0.6 }}
          />
        </div>
      </div>
    );
  }

  const range = max - min;
  const progress = range > 0 ? ((current - min) / range) * 100 : 0;
  const barWidth = Math.min(100, Math.max(0, progress));
  const isComplete = current >= max;
  const isOver = current > max;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{current} / {max}</span>
        {showPercentage && <span>{Math.round(progress)}%</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isOver ? 'bg-amber-500' : isComplete ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}
