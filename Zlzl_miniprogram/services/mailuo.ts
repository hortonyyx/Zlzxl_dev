import type { Mailuo } from '../types/learning';
import { mockStore } from './mock-store';
import { refreshStationStatuses } from './knowledge';

export function getMailuo(libraryId: string): Promise<Mailuo | null> {
  refreshStationStatuses(libraryId);
  return Promise.resolve(mockStore.mailuos.find((mailuo) => mailuo.libraryId === libraryId) ?? null);
}
