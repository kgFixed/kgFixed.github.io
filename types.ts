
export interface LDESMember {
  id: string;
  type?: string;
  label?: string;
  properties: Array<{
    predicate: string;
    object: string;
    shortPredicate?: string;
  }>;
}

export interface LDESFeed {
  baseUrl: string;
  latestTtlUrl: string;
  nextFragmentUrl?: string;
  title: string;
  description?: string;
  members: LDESMember[];
  loading: boolean;
  statusMessage?: string;
  error?: string;
  aiAnalysis?: string;
}

export interface AppState {
  feeds: LDESFeed[];
  selectedFeed: string | null;
}
