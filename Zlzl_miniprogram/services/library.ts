import type { Library, LibraryMode } from '../types/learning';
import { callCloud } from './cloud';
import { createMockId, getMockNow, mockStore } from './mock-store';

export function listLibraries(): Promise<Library[]> {
  return callCloud('listLibraries', undefined, mockListLibraries);
}

export function getLibrary(libraryId: string): Promise<Library | null> {
  return callCloud('getLibrary', { libraryId }, mockGetLibrary);
}

export function createLibrary(name: string, mode: LibraryMode = 'course'): Promise<Library> {
  return callCloud('createLibrary', { name, mode }, mockCreateLibrary);
}

function mockListLibraries(): Library[] {
  return [...mockStore.libraries];
}

function mockGetLibrary(request: { libraryId: string }): Library | null {
  return mockStore.libraries.find((library) => library._id === request.libraryId) ?? null;
}

function mockCreateLibrary(request: { name: string; mode: LibraryMode }): Library {
  const library: Library = {
    _id: createMockId('lib'),
    name: request.name,
    createdAt: getMockNow(),
    mode: request.mode,
    classCount: 0,
  };

  mockStore.libraries.push(library);
  mockStore.mailuos.push({
    _id: createMockId('mailuo'),
    libraryId: library._id,
    updatedAt: getMockNow(),
    latestUpdateNote: '第一节课后,这里会显示脉络如何长大。',
    stations: [],
    stickyNotes: {
      unresolved: [],
      observations: ['空库会先用手动课堂内容跑通 MVP 闭环。'],
    },
  });

  return library;
}
