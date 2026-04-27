import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateEntry, deleteEntry, type Entry } from '../db';

export function EntryLog() {
  const { id } = useParams<{ id: string }>();
  const activityId = Number(id);

  const activity = useLiveQuery(() => db.activities.get(activityId), [activityId]);
  const entries = useLiveQuery(
    () => db.entries.where('activityId').equals(activityId).reverse().sortBy('timestamp'),
    [activityId]
  );

  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editNote, setEditNote] = useState('');
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);

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

  const handleEditStart = (entry: Entry) => {
    setEditingEntry(entry);
    setEditNote(entry.note);
    setDeletingEntryId(null);
  };

  const handleEditSave = async () => {
    if (!editingEntry) return;
    await updateEntry(editingEntry.id, editNote);
    setEditingEntry(null);
    setEditNote('');
  };

  const handleEditCancel = () => {
    setEditingEntry(null);
    setEditNote('');
  };

  const handleDeleteClick = (entryId: number) => {
    if (deletingEntryId === entryId) {
      deleteEntry(entryId);
      setDeletingEntryId(null);
    } else {
      setDeletingEntryId(entryId);
      setEditingEntry(null);
    }
  };

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, Entry[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Link to={`/activity/${activityId}`} className="mr-4 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Entry Log</h1>
            <p className="text-sm text-gray-500">{activity.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {entries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">No entries yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dayEntries]) => (
              <div key={date}>
                <h2 className="text-sm font-medium text-gray-500 mb-2 px-1">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className="p-4">
                      {editingEntry?.id === entry.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Add a note..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleEditSave}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
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
                              <span className="text-gray-900 font-medium">
                                {entry.previousValue} → {entry.newValue}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {entry.note && (
                            <p className="text-gray-600 text-sm mb-3 ml-1">{entry.note}</p>
                          )}

                          <div className="flex gap-2 ml-1">
                            <button
                              onClick={() => handleEditStart(entry)}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              {entry.note ? 'Edit note' : 'Add note'}
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleDeleteClick(entry.id)}
                              className={`text-sm ${
                                deletingEntryId === entry.id
                                  ? 'text-red-600 font-medium'
                                  : 'text-gray-500 hover:text-red-600'
                              }`}
                            >
                              {deletingEntryId === entry.id ? 'Tap to confirm' : 'Delete'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
