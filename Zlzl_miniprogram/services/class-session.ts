import type { ClassSession, ClassSessionStatus, LearningNode, QuizQuestion } from '../types/learning';
import { callCloud } from './cloud';
import { createMockId, getMockNow, mockStore } from './mock-store';

interface SubmitClassRequest {
  libraryId: string;
  recordingFileId?: string;
  transcriptFallback?: string;
}

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
  return submitClass(libraryId, undefined, content);
}

export function submitClass(
  libraryId: string,
  recordingFileId?: string,
  transcriptFallback?: string,
): Promise<SubmitManualClassResponse> {
  return callCloud('submitClass', { libraryId, recordingFileId, transcriptFallback }, mockSubmitClass);
}

export function advanceClass(sessionId: string): Promise<AdvanceClassResponse> {
  return callCloud('advanceClass', { sessionId }, mockAdvanceClass);
}

export function getClassSession(sessionId: string): Promise<ClassSession | null> {
  return callCloud('getClassSession', { sessionId }, mockGetClassSession);
}

function mockSubmitClass(request: SubmitClassRequest): SubmitManualClassResponse {
  const now = getMockNow();
  const classIndex =
    mockStore.nodes.filter((node) => node.libraryId === request.libraryId && node.type === 'class').length + 1;
  const nodeId = createMockId('node-class');
  const transcript =
    request.transcriptFallback?.trim() ||
    `mock 转写:第 ${classIndex} 节课围绕课程主线展开,老师反复比较概念、案例和考试中的论述方式。`;
  const keyPoints = buildMockKeyPoints(classIndex);
  const coreQuestions = buildMockCoreQuestions(classIndex);
  const quiz = buildMockQuiz(classIndex, coreQuestions);
  const node: LearningNode = {
    _id: nodeId,
    libraryId: request.libraryId,
    type: 'class',
    createdAt: now,
    title: `第 ${classIndex} 节课`,
    classIndex,
    recordingFileId: request.recordingFileId,
    recordingFileIds: request.recordingFileId ? [request.recordingFileId] : [],
    transcript,
    summary: {
      full: `第 ${classIndex} 节课已整理完成。这份 mock 输出模拟真实链路中的 ASR 转写和 LLM 总结,会先帮助你回看本节课讲了什么,再进入课后测验。`,
      points: keyPoints,
      keyPoints,
      coreQuestions,
    },
    quiz,
    quizState: 'not-started',
  };
  const session: ClassSession = {
    _id: createMockId('session'),
    libraryId: request.libraryId,
    status: 'done',
    recordingFileId: request.recordingFileId,
    nodeId,
    updatedAt: now,
    steps: ['recording-uploaded', 'transcribing', 'summarizing', 'generating-quiz'].map((name) => ({
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

  ensureLegacyMailuoRecord(request.libraryId, nodeId, classIndex);
  return { sessionId: session._id, nodeId };
}

function mockGetClassSession(request: { sessionId: string }): ClassSession | null {
  return mockStore.classSessions.find((session) => session._id === request.sessionId) ?? null;
}

function mockAdvanceClass(request: AdvanceClassRequest): AdvanceClassResponse {
  const session = mockStore.classSessions.find((item) => item._id === request.sessionId);
  if (!session) {
    return { status: 'failed' };
  }

  return { status: session.status, nodeId: session.nodeId };
}

function ensureLegacyMailuoRecord(libraryId: string, nodeId: string, classIndex: number): void {
  const now = getMockNow();
  let mailuo = mockStore.mailuos.find((item) => item.libraryId === libraryId);
  if (!mailuo) {
    mailuo = {
      _id: createMockId('mailuo'),
      libraryId,
      updatedAt: now,
      latestUpdateNote: '本轮 MVP 暂不生成学习脉络,这里仅保留兼容记录。',
      stations: [],
      stickyNotes: { unresolved: [], observations: [] },
    };
    mockStore.mailuos.push(mailuo);
  }

  mailuo.stations.push({
    nodeId,
    classIndex,
    title: `第 ${classIndex} 节课`,
    status: 'gray',
    knowledgePointIds: [],
  });
  mailuo.updatedAt = now;
  mailuo.latestUpdateNote = '本节课的总结和测验已生成;学习脉络暂不进入本轮主路径。';
  mailuo.stickyNotes = {
    unresolved: [],
    observations: ['下一步先完成本节课测验,不进入今日学习编排。'],
  };
}

function buildMockKeyPoints(classIndex: number): string[] {
  return [
    `第 ${classIndex} 节课的核心概念已经从课堂内容中提炼出来。`,
    '课堂例子和老师强调的比较关系会进入课后测验。',
    '先确认本节课是否听懂,长期复习和脉络后续再接。',
  ];
}

function buildMockCoreQuestions(classIndex: number): string[] {
  return [
    `第 ${classIndex} 节课最重要的概念是什么?`,
    '老师用哪些例子解释了这个概念?',
    '这个概念在考试论述中可能怎么展开?',
  ];
}

function buildMockQuiz(classIndex: number, coreQuestions: string[]): QuizQuestion[] {
  return coreQuestions.map((question, index) => ({
    _id: createMockId('quiz'),
    stem: question,
    referenceAnswer: `参考回答应包含第 ${classIndex} 节课的概念解释、课堂例子和自己的判断。`,
    gradingRubric: '能说清概念含义,能引用课堂例子,能形成完整句子。',
    prompt: question,
    expectedAnswer: `参考回答应包含第 ${classIndex} 节课的概念解释、课堂例子和自己的判断。`,
    knowledgePointId: '',
  }));
}
