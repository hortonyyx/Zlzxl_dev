import type { LearningNode } from '../types/learning';
import { callCloud } from './cloud';
import { mockStore } from './mock-store';

export function getLearningNode(nodeId: string): Promise<LearningNode | null> {
  return callCloud('getLearningNode', { nodeId }, mockGetLearningNode);
}

export function listClassNodes(libraryId: string): Promise<LearningNode[]> {
  return callCloud('listClassNodes', { libraryId }, mockListClassNodes);
}

function mockGetLearningNode(request: { nodeId: string }): LearningNode | null {
  return mockStore.nodes.find((node) => node._id === request.nodeId) ?? null;
}

function mockListClassNodes(request: { libraryId: string }): LearningNode[] {
  return mockStore.nodes
    .filter((node) => node.libraryId === request.libraryId && node.type === 'class')
    .sort((a, b) => (b.classIndex ?? 0) - (a.classIndex ?? 0));
}
