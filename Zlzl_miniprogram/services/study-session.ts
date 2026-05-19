import type { LearningNode, StudyPlan, StudyPlanItem, StudySession } from '../types/learning';
import { callCloud } from './cloud';
import { getDueKnowledgePoints } from './knowledge';
import { createMockId, getMockNow, mockStore } from './mock-store';

interface PlanStudyRequest {
  libraryId: string;
}

export function planStudy(libraryId: string): Promise<StudySession> {
  return callCloud('planStudy', { libraryId }, mockPlanStudy);
}

export function getStudyNode(studyNodeId: string): Promise<LearningNode | null> {
  return Promise.resolve(mockStore.nodes.find((node) => node._id === studyNodeId && node.type === 'study') ?? null);
}

function mockPlanStudy(request: PlanStudyRequest): StudySession {
  const duePoints = getDueKnowledgePoints(request.libraryId);
  const selectedPoints = duePoints.slice(0, 3);
  const pointIds = selectedPoints.map((point) => point._id);
  const plan: StudyPlan = {
    rationale:
      selectedPoints.length > 0
        ? '优先安排黄色知识点和已经到期的绿色知识点。'
        : '当前没有到期知识点,可以回看最近课堂总结。',
    modules:
      pointIds.length > 0
        ? [
            { type: 'quiz', knowledgePointIds: pointIds, rationale: '先用测验确认能否主动回忆。' },
            { type: 'flashcard', knowledgePointIds: pointIds, rationale: '再用闪卡补齐概念表述。' },
          ]
        : [],
  };
  const node: LearningNode = {
    _id: createMockId('node-study'),
    libraryId: request.libraryId,
    type: 'study',
    createdAt: getMockNow(),
    plan,
  };
  const dueItems: StudyPlanItem[] = selectedPoints.map((point) => ({
    knowledgePointId: point._id,
    status: point.status,
    rationale: point.status === 'yellow' ? '最近有错误或未解决疑问。' : '绿色知识点已到固定复习间隔。',
    dueAt: point.lastReviewedAt,
  }));

  mockStore.nodes.push(node);
  return { studyNodeId: node._id, plan, dueItems };
}
