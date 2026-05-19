export const routes = {
  home: '/pages/index/index',
  libraryList: '/pages/library-list/index',
  libraryCreate: '/pages/library-create/index',
  libraryDetail: '/pages/library-detail/index',
  stationDetail: '/pages/station-detail/index',
  classRecord: '/pages/class-record/index',
  classProcessing: '/pages/class-processing/index',
  nodeSummary: '/pages/node-summary/index',
  studyNode: '/pages/study-node/index',
  quizRun: '/pages/quiz-run/index',
  flashcardRun: '/pages/flashcard-run/index',
  nodeResult: '/pages/node-result/index',
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
