import type { Mailuo } from '../types/learning';
import { callCloud } from './cloud';
import { mockStore } from './mock-store';
import { refreshStationStatuses } from './knowledge';

export function getMailuo(libraryId: string): Promise<Mailuo | null> {
  return callCloud('getMailuo', { libraryId }, mockGetMailuo);
}

function mockGetMailuo(request: { libraryId: string }): Mailuo | null {
  refreshStationStatuses(request.libraryId);
  return mockStore.mailuos.find((mailuo) => mailuo.libraryId === request.libraryId) ?? null;
}
