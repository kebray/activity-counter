import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ActivityCard } from '../components/ActivityCard';

export function ActivityList() {
  const activities = useLiveQuery(() =>
    db.activities.orderBy('updatedAt').reverse().toArray()
  );

  if (activities === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Activities</h1>
          <Link
            to="/activity/new"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            + New
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No activities yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first activity to start tracking your progress.
            </p>
            <Link
              to="/activity/new"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Create Activity
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
