import { Link } from 'react-router-dom';
import type { Activity } from '../db';
import { ProgressBar } from './ProgressBar';
import { incrementActivity } from '../db';

interface ActivityCardProps {
  activity: Activity;
  onIncrement?: () => void;
}

export function ActivityCard({ activity, onIncrement }: ActivityCardProps) {
  const handleQuickIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await incrementActivity(activity.id);
    onIncrement?.();
  };

  const isComplete = activity.upperBound !== null && activity.currentValue >= activity.upperBound;

  return (
    <Link
      to={`/activity/${activity.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{activity.name}</h3>
          {isComplete && (
            <span className="inline-block mt-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Goal reached
            </span>
          )}
        </div>
        <button
          onClick={handleQuickIncrement}
          className="ml-3 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
          aria-label="Increment activity"
        >
          +
        </button>
      </div>
      <ProgressBar
        current={activity.currentValue}
        min={activity.lowerBound}
        max={activity.upperBound}
        showPercentage={true}
      />
    </Link>
  );
}
