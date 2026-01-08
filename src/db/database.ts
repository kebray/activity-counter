import Dexie, { type EntityTable } from 'dexie';

export interface Activity {
  id: number;
  name: string;
  lowerBound: number;
  upperBound: number | null;
  currentValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entry {
  id: number;
  activityId: number;
  previousValue: number;
  newValue: number;
  note: string;
  timestamp: Date;
}

const db = new Dexie('ActivityTrackerDB') as Dexie & {
  activities: EntityTable<Activity, 'id'>;
  entries: EntityTable<Entry, 'id'>;
};

db.version(1).stores({
  activities: '++id, name, createdAt, updatedAt',
  entries: '++id, activityId, timestamp',
});

export { db };
