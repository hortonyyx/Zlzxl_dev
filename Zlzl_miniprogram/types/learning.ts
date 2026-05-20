export type LibraryMode = 'course' | 'self';
export type LearningStatus = 'green' | 'yellow' | 'gray';
export type LearningNodeType = 'class' | 'study';
export type ModuleType = 'quiz' | 'flashcard';
export type ClassSessionStatus =
  | 'recording-uploaded'
  | 'transcribing'
  | 'summarizing'
  | 'extracting'
  | 'rewriting'
  | 'generating-quiz'
  | 'done'
  | 'failed';
export type ClassSessionStepStatus = 'pending' | 'running' | 'done' | 'failed';
export type QuizState = 'not-started' | 'in-progress' | 'done';
export type QuizAnswerMode = 'text' | 'voice';

export interface Library {
  _id: string;
  name: string;
  createdAt: number;
  mode: LibraryMode;
  classCount: number;
  isDemo?: boolean;
}

export interface KnowledgePoint {
  _id: string;
  libraryId: string;
  name: string;
  aliases: string[];
  relatedIds: string[];
  firstSeenNodeId: string;
  status: LearningStatus;
  lastReviewedAt: number | null;
}

export type MasterySignalSourceModule = 'quiz' | 'flashcard' | 'class-record';
export type MasterySignalType =
  | 'quiz-correct'
  | 'quiz-wrong'
  | 'flashcard-good'
  | 'flashcard-fail'
  | 'mark-question'
  | 'correction';

export interface MasterySignal {
  _id: string;
  knowledgePointId: string;
  sourceNodeId: string;
  sourceModule: MasterySignalSourceModule;
  type: MasterySignalType;
  value: number | null;
  timestamp: number;
}

export interface ClassSummary {
  full: string;
  points: string[];
  keyPoints?: string[];
  coreQuestions: string[];
}

export interface StudyPlanModule {
  type: ModuleType;
  knowledgePointIds: string[];
  rationale: string;
}

export interface StudyPlan {
  rationale: string;
  modules: StudyPlanModule[];
}

export interface LearningNode {
  _id: string;
  libraryId: string;
  type: LearningNodeType;
  createdAt: number;
  title?: string;
  classIndex?: number;
  recordingFileId?: string;
  recordingFileIds?: string[];
  transcript?: string;
  summary?: ClassSummary;
  quiz?: QuizQuestion[];
  quizState?: QuizState;
  markedQuestions?: Array<{ atMs: number; note?: string }>;
  plan?: StudyPlan;
}

export interface MailuoStation {
  nodeId: string;
  classIndex: number;
  title: string;
  status: LearningStatus;
  knowledgePointIds: string[];
}

export interface Mailuo {
  _id: string;
  libraryId: string;
  updatedAt: number;
  latestUpdateNote: string;
  stations: MailuoStation[];
  stickyNotes: {
    unresolved: string[];
    observations: string[];
  };
}

export interface ClassSessionStep {
  name: ClassSessionStatus;
  attempts: number;
  status: ClassSessionStepStatus;
  updatedAt: number;
  jobId?: string;
}

export interface ClassSession {
  _id: string;
  libraryId: string;
  status: ClassSessionStatus;
  steps: ClassSessionStep[];
  updatedAt: number;
  recordingFileId?: string;
  nodeId?: string;
  error?: string;
  lockedUntil?: number;
}

export interface StudyPlanItem {
  knowledgePointId: string;
  status: LearningStatus;
  rationale: string;
  dueAt: number | null;
}

export interface StudySession {
  studyNodeId: string;
  plan: StudyPlan;
  dueItems: StudyPlanItem[];
}

export interface QuizQuestion {
  _id: string;
  knowledgePointId: string;
  stem: string;
  referenceAnswer: string;
  gradingRubric?: string;
  prompt: string;
  expectedAnswer: string;
}

export interface QuizAnswer {
  questionId: string;
  mode: QuizAnswerMode;
  text: string;
  voiceFileId?: string;
  passed?: boolean;
  score?: number;
  feedback?: string;
}

export interface QuizGradingResult {
  answer: QuizAnswer;
  completed: boolean;
}

export interface Flashcard {
  _id: string;
  knowledgePointId: string;
  front: string;
  back: string;
}

export interface ModuleResult {
  knowledgePointId: string;
  pass: boolean;
  previousStatus: LearningStatus;
  nextStatus: LearningStatus;
  comment?: string;
}
