import type { LearningNode } from '../types/learning';
import { callCloud } from './cloud';
import { mockStore } from './mock-store';

export function getLearningNode(nodeId: string): Promise<LearningNode | null> {
  return callCloud('getLearningNode', { nodeId }, mockGetLearningNode);
}

function mockGetLearningNode(request: { nodeId: string }): LearningNode | null {
  return mockStore.nodes.find((node) => node._id === request.nodeId) ?? null;
}
