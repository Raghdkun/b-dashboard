/* ────────────────────────────────────────────────────────────────────────── */
/*  Quality Assurance (QA) API Types                                        */
/* ────────────────────────────────────────────────────────────────────────── */

// ── Raw API types (snake_case) ─────────────────────────────────────────

export interface ApiQAStore {
  id: number;
  store: string;
  group: number;
  created_at: string;
  updated_at: string;
}

export interface ApiQAUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ApiQAAudit {
  id: number;
  store_id: number;
  user_id: number;
  date: string;
  created_at: string;
  updated_at: string;
  store: ApiQAStore;
  user: ApiQAUser;
}

export interface ApiQAPaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ApiQAPaginatedData {
  current_page: number;
  data: ApiQAAudit[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: ApiQAPaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ApiQAAuditsResponse {
  status: string;
  message: string;
  data: ApiQAPaginatedData;
  errors: unknown;
}

// ── Frontend types (camelCase) ─────────────────────────────────────────

export interface QAStore {
  id: number;
  store: string;
  group: number;
  createdAt: string;
  updatedAt: string;
}

export interface QAUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface QAAudit {
  id: number;
  storeId: number;
  userId: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  store: QAStore;
  user: QAUser;
}

export interface QAPaginationInfo {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number | null;
  to: number | null;
}

export interface QAAuditsResponse {
  audits: QAAudit[];
  pagination: QAPaginationInfo;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface QAErrorState {
  message: string;
  code: string;
  retryable: boolean;
}
