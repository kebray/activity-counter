import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, createActivity, updateActivity, deleteActivity } from '../db';

export function ActivityForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== 'new' && id !== undefined;

  const existingActivity = useLiveQuery(
    () => (isEditing ? db.activities.get(Number(id)) : undefined),
    [id, isEditing]
  );

  const [name, setName] = useState('');
  const [lowerBound, setLowerBound] = useState('0');
  const [upperBound, setUpperBound] = useState('');
  const [startingValue, setStartingValue] = useState('');
  const [hasUpperBound, setHasUpperBound] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (existingActivity) {
      setName(existingActivity.name);
      setLowerBound(String(existingActivity.lowerBound));
      setHasUpperBound(existingActivity.upperBound !== null);
      setUpperBound(existingActivity.upperBound !== null ? String(existingActivity.upperBound) : '');
      setStartingValue(String(existingActivity.currentValue));
    }
  }, [existingActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lowerBoundNum = parseInt(lowerBound, 10) || 0;
    const upperBoundNum = hasUpperBound && upperBound ? parseInt(upperBound, 10) : null;
    const startingValueNum = startingValue ? parseInt(startingValue, 10) : undefined;

    if (isEditing && existingActivity) {
      await updateActivity(existingActivity.id, {
        name,
        lowerBound: lowerBoundNum,
        upperBound: upperBoundNum,
      });
      navigate(`/activity/${existingActivity.id}`);
    } else {
      const newId = await createActivity(name, lowerBoundNum, upperBoundNum, startingValueNum);
      navigate(`/activity/${newId}`);
    }
  };

  const handleDelete = async () => {
    if (!existingActivity) return;

    if (isDeleting) {
      await deleteActivity(existingActivity.id);
      navigate('/');
    } else {
      setIsDeleting(true);
    }
  };

  if (isEditing && existingActivity === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isEditing && existingActivity === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Activity not found</p>
          <Link to="/" className="text-blue-500 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Link to={isEditing ? `/activity/${id}` : '/'} className="mr-4 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Activity' : 'New Activity'}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Activity Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="e.g., Push-ups, Books read, Meditation sessions"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lowerBound" className="block text-sm font-medium text-gray-700 mb-2">
                Starting Point
              </label>
              <input
                type="number"
                id="lowerBound"
                value={lowerBound}
                onChange={(e) => setLowerBound(e.target.value)}
                min="0"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            {!isEditing && (
              <div>
                <label htmlFor="startingValue" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Count
                </label>
                <input
                  type="number"
                  id="startingValue"
                  value={startingValue}
                  onChange={(e) => setStartingValue(e.target.value)}
                  placeholder={lowerBound || '0'}
                  min={lowerBound || '0'}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={hasUpperBound}
                onChange={(e) => setHasUpperBound(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Set a goal (upper limit)</span>
            </label>

            {hasUpperBound && (
              <div>
                <label htmlFor="upperBound" className="block text-sm font-medium text-gray-700 mb-2">
                  Goal
                </label>
                <input
                  type="number"
                  id="upperBound"
                  value={upperBound}
                  onChange={(e) => setUpperBound(e.target.value)}
                  min={lowerBound || '0'}
                  required={hasUpperBound}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="e.g., 100"
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Activity'}
            </button>
          </div>

          {isEditing && (
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDelete}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isDeleting
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                {isDeleting ? 'Tap again to confirm delete' : 'Delete Activity'}
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
