import { db, type Activity, type Entry } from './database';

export async function createActivity(
  name: string,
  lowerBound: number = 0,
  upperBound: number | null = null,
  startingValue?: number
): Promise<number> {
  const now = new Date();
  const count = await db.activities.count();
  return db.activities.add({
    name,
    lowerBound,
    upperBound,
    currentValue: startingValue ?? lowerBound,
    sortOrder: count,
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
  return db.activities.orderBy('sortOrder').toArray();
}

export async function incrementActivity(
  activityId: number,
  note: string = ''
): Promise<void> {
  await db.transaction('rw', db.activities, db.entries, async () => {
    const activity = await db.activities.get(activityId);
    if (!activity) throw new Error('Activity not found');

    const newValue = activity.currentValue + 1;

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

export async function resetActivity(activityId: number): Promise<void> {
  await db.transaction('rw', db.activities, db.entries, async () => {
    const activity = await db.activities.get(activityId);
    if (!activity) throw new Error('Activity not found');
    if (activity.currentValue === activity.lowerBound) return;

    await db.entries.add({
      activityId,
      previousValue: activity.currentValue,
      newValue: activity.lowerBound,
      note: 'Counter reset',
      timestamp: new Date(),
    } as Entry);

    await db.activities.update(activityId, {
      currentValue: activity.lowerBound,
      updatedAt: new Date(),
    });
  });
}

export async function reorderActivities(orderedIds: number[]): Promise<void> {
  await db.transaction('rw', db.activities, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.activities.update(orderedIds[i], { sortOrder: i });
    }
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
