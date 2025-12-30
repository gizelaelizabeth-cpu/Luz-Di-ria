
export interface Devotional {
  title: string;
  verse: string;
  reference: string;
  content: string;
  reflection: string;
  prayer: string;
}

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  date: string;
  isAnswered: boolean;
}

export interface ReadingPlanItem {
  id: number;
  book: string;
  chapters: string;
  completed: boolean;
}

export interface WordStudy {
  word: string;
  original: string;
  meaning: string;
  application: string;
}

export interface QuickInspiration {
  verse: string;
  ref: string;
  phrase: string;
}

export type AppTab = 'home' | 'prayers' | 'plan' | 'settings';
