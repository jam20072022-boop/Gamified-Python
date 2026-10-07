export type QuestionType =
  | 'mcq'
  | 'fill_blank'
  | 'parsons'
  | 'code_editor'
  | 'bug_hunting'
  | 'visual_data';

export type TrackId = 'python_basics' | 'data_analysis' | 'ai_ml';

export type LanguageCode = 'ar' | 'en' | 'fr' | 'es' | 'de';

export interface VideoExplainer {
  title: string;
  durationSeconds: number;
  voiceTranscriptAr: string;
  voiceTranscriptEn: string;
  whyWrongAr?: string;
  codeSteps: {
    step: number;
    title: string;
    code: string;
    highlightLine: number;
    explanationAr: string;
    explanationEn: string;
  }[];
  englishVocabulary: {
    keyword: string;
    phonetic?: string;
    meaningAr: string;
    whyUsed: string;
  }[];
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  titleEn: string;
  instructions: string;
  instructionsEn: string;
  translations?: Partial<Record<LanguageCode, { title: string; instructions: string; explanation: string }>>;
  xpReward: number;
  hint?: string;
  hintEn?: string;
  explanation: string;
  explanationEn: string;
  videoExplainer?: VideoExplainer;
}

export interface McqQuestion extends BaseQuestion {
  type: 'mcq';
  codeSnippet?: string;
  options: string[];
  optionsEn?: string[];
  correctAnswerIndex: number;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill_blank';
  codeTemplate: string;
  availableTokens: string[];
  correctTokens: string[];
}

export interface ParsonsQuestion extends BaseQuestion {
  type: 'parsons';
  scrambledLines: { id: string; text: string; indent: number }[];
  correctOrder: string[];
}

export interface CodeEditorQuestion extends BaseQuestion {
  type: 'code_editor';
  initialCode: string;
  solutionCode: string;
  testCases: {
    description: string;
    descriptionEn: string;
    expectedOutputSubstring?: string;
    testAssertionCode?: string;
  }[];
}

export interface BugHuntingQuestion extends BaseQuestion {
  type: 'bug_hunting';
  buggyCode: string;
  bugHint: string;
  bugHintEn: string;
  fixedCode: string;
  testOutput: string;
}

export interface VisualDataQuestion extends BaseQuestion {
  type: 'visual_data';
  chartType: 'bar' | 'line' | 'scatter' | 'confusion_matrix';
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color?: string;
    }[];
  };
  questionPrompt: string;
  questionPromptEn: string;
  options: string[];
  optionsEn?: string[];
  correctAnswerIndex: number;
}

export type Question =
  | McqQuestion
  | FillBlankQuestion
  | ParsonsQuestion
  | CodeEditorQuestion
  | BugHuntingQuestion
  | VisualDataQuestion;

export interface Lesson {
  id: string;
  moduleId: string;
  trackId: TrackId;
  order: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  questions: Question[];
}

export interface Module {
  id: string;
  trackId: TrackId;
  order: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  color: string;
  lessons: Lesson[];
}

export interface Track {
  id: TrackId;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  badge: string;
  accentColor: string;
  bgImage: string;
  modules: Module[];
}

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'guest';
  createdAt: string;
  lastLoginAt: string;
}

export interface UserStats {
  xp: number;
  hearts: number;
  maxHearts: number;
  nextHeartTimestamp: number | null;
  gems: number;
  streakDays: number;
  lastActiveDate: string;
  streakFrozen: boolean;
  accuracy: number;
  totalQuestionsAnswered: number;
  correctAnswersCount: number;
  completedLessonIds: string[];
  lessonStars: Record<string, number>;
  badges: string[];
  selectedTheme: 'dark' | 'monokai' | 'cyberpunk' | 'emerald';
  soundEnabled: boolean;
  language: LanguageCode;
  passedExams?: string[];
  certificates?: Certificate[];
  userAccount?: UserAccount;
}

export interface Badge {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  requiredXp?: number;
  requiredLessons?: number;
  requiredStreak?: number;
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  chartOutput?: {
    type: 'bar' | 'line' | 'scatter' | 'table';
    title: string;
    labels: string[];
    values: number[] | (string | number)[][];
    columns?: string[];
  };
  passedAssertions?: number;
  totalAssertions?: number;
}

// Proctored Exam System Types
export interface Exam {
  id: string;
  trackId: TrackId;
  title: string;
  titleEn: string;
  durationMinutes: number;
  passingScore: number;
  questions: Question[];
}

export interface ProctorAlert {
  id: string;
  timestamp: string;
  type: 'tab_switch' | 'paste_detected' | 'rapid_answer' | 'mouse_leave';
  message: string;
  messageEn: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Certificate {
  id: string;
  examId: string;
  examTitle: string;
  userName: string;
  score: number;
  integrityScore: number;
  date: string;
  verificationCode: string;
}

// Real-World Full App Project Types
export interface ProjectStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  starterCode: string;
  solutionCode: string;
  expectedOutput: string;
}

export interface RealProject {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  descriptionEn: string;
  icon: string;
  steps: ProjectStep[];
}
