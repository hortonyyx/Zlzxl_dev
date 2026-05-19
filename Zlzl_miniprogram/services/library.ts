import type { Library, LibraryMode } from '../types/learning';
import { createMockId, getMockNow, mockStore } from './mock-store';

export function listLibraries(): Promise<Library[]> {
  return Promise.resolve([...mockStore.libraries]);
}

export function getLibrary(libraryId: string): Promise<Library | null> {
  return Promise.resolve(mockStore.libraries.find((library) => library._id === libraryId) ?? null);
}

export function createLibrary(name: string, mode: LibraryMode = 'course'): Promise<Library> {
  const library: Library = {
    _id: createMockId('lib'),
    name,
    createdAt: getMockNow(),
    mode,
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

  return Promise.resolve(library);
}
