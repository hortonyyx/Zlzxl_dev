import type {
  ClassSession,
  KnowledgePoint,
  LearningNode,
  Library,
  Mailuo,
  MasterySignal,
} from '../types/learning';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export interface MockStore {
  libraries: Library[];
  knowledgePoints: KnowledgePoint[];
  signals: MasterySignal[];
  nodes: LearningNode[];
  mailuos: Mailuo[];
  classSessions: ClassSession[];
}

export const mockStore: MockStore = {
  libraries: [
    {
      _id: 'lib-demo-design-history',
      name: '设计史 Demo',
      createdAt: now - 21 * day,
      mode: 'course',
      classCount: 3,
      isDemo: true,
    },
  ],
  knowledgePoints: [
    {
      _id: 'kp-bauhaus',
      libraryId: 'lib-demo-design-history',
      name: '包豪斯的功能主义',
      aliases: ['Bauhaus', '功能主义'],
      relatedIds: ['kp-modernism'],
      firstSeenNodeId: 'node-demo-class-1',
      status: 'green',
      lastReviewedAt: now - 2 * day,
    },
    {
      _id: 'kp-modernism',
      libraryId: 'lib-demo-design-history',
      name: '现代主义设计的社会理想',
      aliases: ['现代主义', '社会理想'],
      relatedIds: ['kp-bauhaus', 'kp-postmodern'],
      firstSeenNodeId: 'node-demo-class-1',
      status: 'yellow',
      lastReviewedAt: now - 9 * day,
    },
    {
      _id: 'kp-postmodern',
      libraryId: 'lib-demo-design-history',
      name: '后现代对统一理性的反拨',
      aliases: ['后现代设计', '反理性'],
      relatedIds: ['kp-modernism'],
      firstSeenNodeId: 'node-demo-class-2',
      status: 'gray',
      lastReviewedAt: null,
    },
    {
      _id: 'kp-consumer-culture',
      libraryId: 'lib-demo-design-history',
      name: '消费文化与符号',
      aliases: ['消费社会', '设计符号'],
      relatedIds: ['kp-postmodern'],
      firstSeenNodeId: 'node-demo-class-3',
      status: 'yellow',
      lastReviewedAt: now - 1 * day,
    },
  ],
  signals: [
    {
      _id: 'sig-demo-1',
      knowledgePointId: 'kp-bauhaus',
      sourceNodeId: 'node-demo-study-1',
      sourceModule: 'quiz',
      type: 'quiz-correct',
      value: 1,
      timestamp: now - 2 * day,
    },
    {
      _id: 'sig-demo-2',
      knowledgePointId: 'kp-modernism',
      sourceNodeId: 'node-demo-class-2',
      sourceModule: 'class-record',
      type: 'mark-question',
      value: null,
      timestamp: now - 9 * day,
    },
    {
      _id: 'sig-demo-3',
      knowledgePointId: 'kp-consumer-culture',
      sourceNodeId: 'node-demo-study-2',
      sourceModule: 'flashcard',
      type: 'flashcard-fail',
      value: 0,
      timestamp: now - 1 * day,
    },
  ],
  nodes: [
    {
      _id: 'node-demo-class-1',
      libraryId: 'lib-demo-design-history',
      type: 'class',
      createdAt: now - 20 * day,
      classIndex: 1,
      transcript: '第一节课讨论包豪斯、功能主义和现代主义设计的社会愿望。',
      summary: {
        full: '这节课建立了现代设计的起点:形式服从功能,以及设计服务大众生活的理想。',
        points: ['包豪斯强调功能与工艺结合', '现代主义把设计视为社会改良工具'],
        coreQuestions: ['功能主义是否会牺牲人的复杂感受?'],
      },
    },
    {
      _id: 'node-demo-class-2',
      libraryId: 'lib-demo-design-history',
      type: 'class',
      createdAt: now - 10 * day,
      classIndex: 2,
      transcript: '第二节课把现代主义的统一理性和后现代的多元表达放在一起比较。',
      summary: {
        full: '课程延续上次的功能主义问题,转向后现代为何反对单一理性和统一风格。',
        points: ['后现代不是简单装饰化', '它回应了现代主义被制度化后的僵硬'],
        coreQuestions: ['多元表达怎样避免变成纯消费符号?'],
      },
    },
    {
      _id: 'node-demo-class-3',
      libraryId: 'lib-demo-design-history',
      type: 'class',
      createdAt: now - 3 * day,
      classIndex: 3,
      transcript: '第三节课讨论消费文化如何吸收设计风格,并把反叛转化为可购买的符号。',
      summary: {
        full: '这节课把后现代设计接到消费文化,解释为什么反叛风格也可能被市场吸收。',
        points: ['消费文化会包装风格差异', '设计符号既表达身份也可能遮蔽结构问题'],
        coreQuestions: ['用户为什么会把风格当作身份表达?'],
      },
    },
  ],
  mailuos: [
    {
      _id: 'mailuo-demo-design-history',
      libraryId: 'lib-demo-design-history',
      updatedAt: now - 3 * day,
      latestUpdateNote: '本次把后现代的反拨接到了消费文化,上次的"多元表达"问题有了新的解释。',
      stations: [
        {
          nodeId: 'node-demo-class-1',
          classIndex: 1,
          title: '现代设计的起点',
          status: 'green',
          knowledgePointIds: ['kp-bauhaus', 'kp-modernism'],
        },
        {
          nodeId: 'node-demo-class-2',
          classIndex: 2,
          title: '后现代的反拨',
          status: 'yellow',
          knowledgePointIds: ['kp-modernism', 'kp-postmodern'],
        },
        {
          nodeId: 'node-demo-class-3',
          classIndex: 3,
          title: '消费文化吸收风格',
          status: 'yellow',
          knowledgePointIds: ['kp-postmodern', 'kp-consumer-culture'],
        },
      ],
      stickyNotes: {
        unresolved: ['现代主义的社会理想为什么会被批评为压抑差异?'],
        observations: ['你对"风格如何变成身份"还不稳定,今天复习会优先安排它。'],
      },
    },
  ],
  classSessions: [],
};

let sequence = 0;

export function createMockId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${now}-${sequence}`;
}

export function getMockNow(): number {
  return Date.now();
}
