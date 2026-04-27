import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, incrementActivity, decrementActivity, resetActivity } from '../db';
import { ProgressBar } from '../components/ProgressBar';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const activityId = Number(id);

  const activity = useLiveQuery(() => db.activities.get(activityId), [activityId]);
  const entries = useLiveQuery(
    () => db.entries.where('activityId').equals(activityId).reverse().sortBy('timestamp'),
    [activityId]
  );

  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (activity === undefined || entries === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (activity === null) {
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

  const canDecrement = activity.currentValue > activity.lowerBound;
  const canReset = activity.currentValue > activity.lowerBound;
  const isComplete = activity.upperBound !== null && activity.currentValue >= activity.upperBound;

  const handleIncrement = async () => {
    await incrementActivity(activityId, note);
    setNote('');
    setShowNoteInput(false);
  };

  const handleDecrement = async () => {
    if (!canDecrement) return;
    await decrementActivity(activityId, note);
    setNote('');
    setShowNoteInput(false);
  };

  const handleReset = async () => {
    await resetActivity(activityId);
    setShowResetConfirm(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="mr-4 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 truncate">{activity.name}</h1>
          </div>
          <div className="flex items-center gap-1">
            {canReset && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-gray-600 hover:text-gray-900 p-2"
                aria-label="Reset counter"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M1 4v6h6M3.51 15a9 9 0 102.13-9.36L1 10"
                  />
                </svg>
              </button>
            )}
            <Link
              to={`/activity/${activityId}/edit`}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold mb-2 ${isComplete ? 'text-green-500' : 'text-gray-900'}`}>
              {activity.currentValue}
            </div>
            {activity.upperBound !== null && (
              <div className="text-gray-500">of {activity.upperBound}</div>
            )}
            {isComplete && (
              <div className="mt-2 inline-block text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Goal reached!
              </div>
            )}
          </div>

          <ProgressBar
            current={activity.currentValue}
            min={activity.lowerBound}
            max={activity.upperBound}
          />

          {/* Increment/Decrement Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handleDecrement}
              disabled={!canDecrement}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold transition-all ${
                canDecrement
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Decrement"
            >
              −
            </button>
            <button
              onClick={handleIncrement}
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold transition-all bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
              aria-label="Increment"
            >
              +
            </button>
          </div>

          {/* Note Input */}
          <div className="mt-6">
            {showNoteInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note (optional)"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setNote('');
                    setShowNoteInput(false);
                  }}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNoteInput(true)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                + Add note with next entry
              </button>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">History</h2>
            {entries.length > 0 && (
              <Link
                to={`/activity/${activityId}/log`}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                View all
              </Link>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No entries yet. Start tracking!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const diff = entry.newValue - entry.previousValue;
                        const isReset = diff < -1;
                        return (
                          <span
                            className={`text-sm font-medium px-2 py-0.5 rounded ${
                              isReset
                                ? 'bg-amber-50 text-amber-600'
                                : diff > 0
                                  ? 'bg-green-50 text-green-600'
                                  : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {isReset ? 'Reset' : diff > 0 ? `+${diff}` : `${diff}`}
                          </span>
                        );
                      })()}
                      <span className="text-gray-900">{entry.previousValue} → {entry.newValue}</span>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(entry.timestamp)}</span>
                  </div>
                  {entry.note && (
                    <p className="mt-1 text-sm text-gray-600 ml-8">{entry.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Counter"
        message={`Reset "${activity.name}" from ${activity.currentValue} back to ${activity.lowerBound}?`}
        confirmLabel="Reset"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
        variant="danger"
      />
    </div>
  );
}
