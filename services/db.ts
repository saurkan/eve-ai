import { Dexie, type Table } from 'dexie';
import type { Case, ChatMessage } from '../types';

export class WomenHealthAIDexie extends Dexie {
  cases!: Table<Case, string>;
  chatMessages!: Table<ChatMessage, string>;

  constructor() {
    super('WomenHealthAIDatabase');
    // Schema is updated to handle the new, more generic Case structure
    // FIX: Add type assertion to resolve incorrect 'version' does not exist error.
    (this as Dexie).version(1).stores({
      cases: 'id, patientId, createdAt, status, priority, healthDomain, scanType',
      chatMessages: 'id, timestamp',
    });
  }
}

export const db = new WomenHealthAIDexie();