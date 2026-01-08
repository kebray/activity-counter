import { db, type Activity, type Entry } from './database';

// Activity operations
export async function createActivity(
  name: string,
  lowerBound: number = 0,
  upperBound: number | null = null,
  startingValue?: number
): Promise<number> {
  const now = new Date();
  return db.activities.add({
    name,
    lowerBound,
    upperBound,
    currentValue: startingValue ?? lowerBound,
    createdAt: now,
    updatedAt: now,
  } as Activity);
}

export async function updateActivity(
  id: number,
  updates: Partial<Pick<Activity, 'name' | 'lowerBound' | 'upperBound'>>
): Promise<void> {
  await db.activities.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function deleteActivity(id: number): Promise<void> {
  await db.transaction('rw', db.activities, db.entries, async () => {
    await db.entries.where('activityId').equals(id).delete();
    await db.activities.delete(id);
  });
}

export async function getActivity(id: number): Promise<Activity | undefined> {
  return db.activities.get(id);
}

export async function getAllActivities(): Promise<Activity[]> {
  return db.activities.orderBy('updatedAt').reverse().toArray();
}

// Entry operations
export async function incrementActivity(
  activityId: number,
  note: string = ''
): Promise<void> {
  await db.transaction('rw', db.activities, db.entries, async () => {
    const activity = await db.activities.get(activityId);
    if (!activity) throw new Error('Activity not found');

    const newValue = activity.currentValue + 1;

    // Don't exceed upper bound if set
    if (activity.upperBound !== null && newValue > activity.upperBound) {
      return;
    }

    await db.entries.add({
      activityId,
      previousValue: activity.currentValue,
      newValue,
      note,
      timestamp: new Date(),
    } as Entry);

    await db.activities.update(activityId, {
      currentValue: newValue,
      updatedAt: new Date(),
    });
  });
}

export async function decrementActivity(
  activityId: number,
  note: string = ''
): Promise<void> {
  await db.transaction('rw', db.activities, db.entries, async () => {
    const activity = await db.activities.get(activityId);
    if (!activity) throw new Error('Activity not found');

    const newValue = activity.currentValue - 1;

    // Don't go below lower bound
    if (newValue < activity.lowerBound) {
      return;
    }

    await db.entries.add({
      activityId,
      previousValue: activity.currentValue,
      newValue,
      note,
      timestamp: new Date(),
    } as Entry);

    await db.activities.update(activityId, {
      currentValue: newValue,
      updatedAt: new Date(),
    });
  });
}

export async function getEntriesForActivity(activityId: number): Promise<Entry[]> {
  return db.entries
    .where('activityId')
    .equals(activityId)
    .reverse()
    .sortBy('timestamp');
}

export async function updateEntry(
  id: number,
  note: string
): Promise<void> {
  await db.entries.update(id, { note });
}

export async function deleteEntry(id: number): Promise<void> {
  await db.entries.delete(id);
}
