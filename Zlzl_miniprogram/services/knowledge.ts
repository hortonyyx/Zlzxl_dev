import type { KnowledgePoint, LearningStatus, MailuoStation, MasterySignal, MasterySignalType } from '../types/learning';
import { getMockNow, mockStore } from './mock-store';

const REVIEW_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const PASSING_SIGNAL_TYPES: MasterySignalType[] = ['quiz-correct', 'flashcard-good'];
const FAILING_SIGNAL_TYPES: MasterySignalType[] = ['quiz-wrong', 'flashcard-fail'];

export function listKnowledgePoints(libraryId: string): Promise<KnowledgePoint[]> {
  return Promise.resolve(mockStore.knowledgePoints.filter((point) => point.libraryId === libraryId));
}

export function listMasterySignals(knowledgePointId: string): Promise<MasterySignal[]> {
  return Promise.resolve(
    mockStore.signals
      .filter((signal) => signal.knowledgePointId === knowledgePointId)
      .sort((left, right) => left.timestamp - right.timestamp),
  );
}

export function calculateKnowledgeStatus(signals: MasterySignal[]): LearningStatus {
  if (signals.length === 0) {
    return 'gray';
  }

  const latestQuestion = latestTimestamp(signals, ['mark-question']);
  const latestPassing = latestTimestamp(signals, PASSING_SIGNAL_TYPES);
  const latestFailing = latestTimestamp(signals, FAILING_SIGNAL_TYPES);

  if (latestQuestion !== null && (latestPassing === null || latestQuestion > latestPassing)) {
    return 'yellow';
  }

  if (latestFailing !== null && (latestPassing === null || latestFailing > latestPassing)) {
    return 'yellow';
  }

  if (latestPassing !== null) {
    return 'green';
  }

  return 'gray';
}

export function refreshKnowledgeStatus(knowledgePointId: string): KnowledgePoint | null {
  const point = mockStore.knowledgePoints.find((item) => item._id === knowledgePointId);
  if (!point) {
    return null;
  }

  const signals = mockStore.signals.filter((signal) => signal.knowledgePointId === knowledgePointId);
  point.status = calculateKnowledgeStatus(signals);
  point.lastReviewedAt = latestTimestamp(signals, PASSING_SIGNAL_TYPES);
  return point;
}

export function summarizeStationStatus(knowledgePointIds: string[]): LearningStatus {
  const statuses = knowledgePointIds
    .map((id) => mockStore.knowledgePoints.find((point) => point._id === id)?.status)
    .filter((status): status is LearningStatus => Boolean(status));

  if (statuses.includes('yellow')) {
    return 'yellow';
  }

  if (statuses.includes('gray') || statuses.length === 0) {
    return 'gray';
  }

  return 'green';
}

export function refreshStationStatuses(libraryId: string): MailuoStation[] {
  const mailuo = mockStore.mailuos.find((item) => item.libraryId === libraryId);
  if (!mailuo) {
    return [];
  }

  mailuo.stations = mailuo.stations.map((station) => ({
    ...station,
    status: summarizeStationStatus(station.knowledgePointIds),
  }));

  return mailuo.stations;
}

export function getDueKnowledgePoints(libraryId: string): KnowledgePoint[] {
  const now = getMockNow();
  return mockStore.knowledgePoints.filter((point) => {
    if (point.libraryId !== libraryId) {
      return false;
    }

    if (point.status === 'yellow') {
      return true;
    }

    if (point.status === 'green' && point.lastReviewedAt !== null) {
      return point.lastReviewedAt + REVIEW_INTERVAL_MS <= now;
    }

    return false;
  });
}

function latestTimestamp(signals: MasterySignal[], types: MasterySignalType[]): number | null {
  const timestamps = signals.filter((signal) => types.includes(signal.type)).map((signal) => signal.timestamp);
  return timestamps.length > 0 ? Math.max(...timestamps) : null;
}
