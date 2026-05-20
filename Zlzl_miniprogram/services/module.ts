import type { Flashcard, ModuleResult, ModuleType, QuizQuestion } from '../types/learning';
import { callCloud } from './cloud';
import { refreshKnowledgeStatus, refreshStationStatuses } from './knowledge';
import { createMockId, getMockNow, mockStore } from './mock-store';

interface GradeModuleRequest {
  studyNodeId: string;
  moduleType: ModuleType;
  answers: Array<{ knowledgePointId: string; pass: boolean }>;
}

const moduleResultsByNode = new Map<string, ModuleResult[]>();

export function getQuizQuestions(knowledgePointIds: string[]): Promise<QuizQuestion[]> {
  return callCloud('getQuizQuestions', { knowledgePointIds }, mockGetQuizQuestions);
}

export function getFlashcards(knowledgePointIds: string[]): Promise<Flashcard[]> {
  return callCloud('getFlashcards', { knowledgePointIds }, mockGetFlashcards);
}

export function gradeModule(
  studyNodeId: string,
  moduleType: ModuleType,
  answers: Array<{ knowledgePointId: string; pass: boolean }>,
): Promise<ModuleResult[]> {
  return callCloud('gradeModule', { studyNodeId, moduleType, answers }, mockGradeModule);
}

export function getModuleResults(studyNodeId: string): Promise<ModuleResult[]> {
  return Promise.resolve(moduleResultsByNode.get(studyNodeId) ?? []);
}

function mockGradeModule(request: GradeModuleRequest): ModuleResult[] {
  const node = mockStore.nodes.find((item) => item._id === request.studyNodeId);
  const now = getMockNow();

  const results = request.answers.map((answer) => {
    const point = mockStore.knowledgePoints.find((item) => item._id === answer.knowledgePointId);
    const previousStatus = point?.status ?? 'gray';
    mockStore.signals.push({
      _id: createMockId('sig'),
      knowledgePointId: answer.knowledgePointId,
      sourceNodeId: request.studyNodeId,
      sourceModule: request.moduleType,
      type:
        request.moduleType === 'quiz'
          ? answer.pass
            ? 'quiz-correct'
            : 'quiz-wrong'
          : answer.pass
            ? 'flashcard-good'
            : 'flashcard-fail',
      value: answer.pass ? 1 : 0,
      timestamp: now,
    });

    const refreshed = refreshKnowledgeStatus(answer.knowledgePointId);
    if (node) {
      refreshStationStatuses(node.libraryId);
      updateMailuoAfterModule(node.libraryId, request.moduleType, resultsPassLabel(answer.pass));
    }

    return {
      knowledgePointId: answer.knowledgePointId,
      pass: answer.pass,
      previousStatus,
      nextStatus: refreshed?.status ?? previousStatus,
      comment: answer.pass ? '已回写为通过信号。' : '已回写为薄弱信号,今日学习会继续优先安排。',
    };
  });

  moduleResultsByNode.set(request.studyNodeId, results);
  return results;
}

function updateMailuoAfterModule(libraryId: string, moduleType: ModuleType, label: string): void {
  const mailuo = mockStore.mailuos.find((item) => item.libraryId === libraryId);
  if (!mailuo) {
    return;
  }

  const moduleName = moduleType === 'quiz' ? '测验' : '闪卡';
  mailuo.updatedAt = getMockNow();
  mailuo.latestUpdateNote = `刚完成一次${moduleName},${label}已经回写到知识点状态。黄色站点会继续提醒你补牢。`;
  mailuo.stickyNotes = {
    unresolved: mailuo.stickyNotes.unresolved,
    observations: [`${moduleName}结果已改变脉络颜色,回到库主页可以看到复习后的 delta。`],
  };
}

function resultsPassLabel(pass: boolean): string {
  return pass ? '通过信号' : '薄弱信号';
}

function mockGetQuizQuestions(request: { knowledgePointIds: string[] }): QuizQuestion[] {
  return request.knowledgePointIds.map((knowledgePointId) => {
    const point = mockStore.knowledgePoints.find((item) => item._id === knowledgePointId);
    return {
      _id: createMockId('quiz'),
      knowledgePointId,
      prompt: `请解释「${point?.name ?? '这个知识点'}」和课程主线的关系。`,
      expectedAnswer: '能说出概念含义,并连接到最近课堂中的问题。',
    };
  });
}

function mockGetFlashcards(request: { knowledgePointIds: string[] }): Flashcard[] {
  return request.knowledgePointIds.map((knowledgePointId) => {
    const point = mockStore.knowledgePoints.find((item) => item._id === knowledgePointId);
    return {
      _id: createMockId('flashcard'),
      knowledgePointId,
      front: point?.name ?? '知识点',
      back: `用自己的话复述「${point?.name ?? '知识点'}」,并说出一个课堂例子。`,
    };
  });
}
