import type { ClassSession, ClassSessionStatus, KnowledgePoint, LearningNode, MailuoStation } from '../types/learning';
import { callCloud } from './cloud';
import { refreshStationStatuses } from './knowledge';
import { createMockId, getMockNow, mockStore } from './mock-store';

interface SubmitManualClassRequest {
  libraryId: string;
  content: string;
}

interface SubmitManualClassResponse {
  sessionId: string;
  nodeId: string;
}

interface AdvanceClassRequest {
  sessionId: string;
}

interface AdvanceClassResponse {
  status: ClassSessionStatus;
  nodeId?: string;
}

export function submitManualClass(libraryId: string, content: string): Promise<SubmitManualClassResponse> {
  return callCloud('submitClass', { libraryId, content }, mockSubmitManualClass);
}

export function advanceClass(sessionId: string): Promise<AdvanceClassResponse> {
  return callCloud('advanceClass', { sessionId }, mockAdvanceClass);
}

export function getClassSession(sessionId: string): Promise<ClassSession | null> {
  return Promise.resolve(mockStore.classSessions.find((session) => session._id === sessionId) ?? null);
}

function mockSubmitManualClass(request: SubmitManualClassRequest): SubmitManualClassResponse {
  const now = getMockNow();
  const classIndex =
    mockStore.nodes.filter((node) => node.libraryId === request.libraryId && node.type === 'class').length + 1;
  const nodeId = createMockId('node-class');
  const pointIds = upsertClassKnowledgePoints(request.libraryId, nodeId, classIndex);
  const node: LearningNode = {
    _id: nodeId,
    libraryId: request.libraryId,
    type: 'class',
    createdAt: now,
    classIndex,
    transcript: request.content,
    summary: {
      full: `第 ${classIndex} 节课已用 mock 服务整理。核心内容会沉淀进知识点池,并更新学习脉络。`,
      points: ['课程主题已提炼为稳定知识点', '新课会复用旧知识点 ID 形成跨课关联'],
      coreQuestions: ['这节课和上次未解决的问题如何接上?'],
    },
    markedQuestions: [{ atMs: 0, note: 'mock: 课中疑问会让对应知识点变黄' }],
  };
  const session: ClassSession = {
    _id: createMockId('session'),
    libraryId: request.libraryId,
    status: 'done',
    nodeId,
    updatedAt: now,
    steps: ['transcribing', 'summarizing', 'extracting', 'rewriting'].map((name) => ({
      name: name as ClassSessionStatus,
      attempts: 1,
      status: 'done',
      updatedAt: now,
    })),
  };

  mockStore.nodes.push(node);
  mockStore.classSessions.push(session);
  const library = mockStore.libraries.find((item) => item._id === request.libraryId);
  if (library) {
    library.classCount = classIndex;
  }

  updateMailuoAfterClass(request.libraryId, nodeId, classIndex, pointIds);
  return { sessionId: session._id, nodeId };
}

function mockAdvanceClass(request: AdvanceClassRequest): AdvanceClassResponse {
  const session = mockStore.classSessions.find((item) => item._id === request.sessionId);
  if (!session) {
    return { status: 'failed' };
  }

  return { status: session.status, nodeId: session.nodeId };
}

function upsertClassKnowledgePoints(libraryId: string, nodeId: string, classIndex: number): string[] {
  const existing = mockStore.knowledgePoints.find((point) => point.libraryId === libraryId);
  const reusedPoint = existing ?? createKnowledgePoint(libraryId, nodeId, '课程主线问题', []);
  const newPoint = createKnowledgePoint(libraryId, nodeId, `第 ${classIndex} 节课的新概念`, [reusedPoint._id]);
  reusedPoint.relatedIds = Array.from(new Set([...reusedPoint.relatedIds, newPoint._id]));

  mockStore.signals.push({
    _id: createMockId('sig'),
    knowledgePointId: reusedPoint._id,
    sourceNodeId: nodeId,
    sourceModule: 'class-record',
    type: 'mark-question',
    value: null,
    timestamp: getMockNow(),
  });
  reusedPoint.status = 'yellow';

  return [reusedPoint._id, newPoint._id];
}

function createKnowledgePoint(
  libraryId: string,
  nodeId: string,
  name: string,
  relatedIds: string[],
): KnowledgePoint {
  const point: KnowledgePoint = {
    _id: createMockId('kp'),
    libraryId,
    name,
    aliases: [],
    relatedIds,
    firstSeenNodeId: nodeId,
    status: 'gray',
    lastReviewedAt: null,
  };
  mockStore.knowledgePoints.push(point);
  return point;
}

function updateMailuoAfterClass(libraryId: string, nodeId: string, classIndex: number, pointIds: string[]): void {
  const now = getMockNow();
  let mailuo = mockStore.mailuos.find((item) => item.libraryId === libraryId);
  if (!mailuo) {
    mailuo = {
      _id: createMockId('mailuo'),
      libraryId,
      updatedAt: now,
      latestUpdateNote: '',
      stations: [],
      stickyNotes: { unresolved: [], observations: [] },
    };
    mockStore.mailuos.push(mailuo);
  }

  const station: MailuoStation = {
    nodeId,
    classIndex,
    title: `第 ${classIndex} 节课`,
    status: 'gray',
    knowledgePointIds: pointIds,
  };
  mailuo.stations.push(station);
  mailuo.updatedAt = now;
  mailuo.latestUpdateNote =
    classIndex > 1
      ? '这节课复用了旧知识点 ID,脉络已经能展示跨课关联。'
      : '第一节课已建立起点,后续课堂会沿着这里继续生长。';
  mailuo.stickyNotes = {
    unresolved: ['mock 标记的问题会优先进入今日学习。'],
    observations: classIndex > 1 ? ['本次课堂和上次的主线问题接上了。'] : ['先完成一次测验,状态色会回写到这里。'],
  };
  refreshStationStatuses(libraryId);
}
