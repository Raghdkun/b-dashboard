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

// ── QA Category types ──────────────────────────────────────────────────

export interface ApiQACategory {
  id: number;
  label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ApiQACategoryCreateResponse {
  status: string;
  message: string;
  data: ApiQACategory;
}

export interface QACategory {
  id: number;
  label: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQACategoryPayload {
  label: string;
  sort_order?: number;
}

// ── QA Entity types ────────────────────────────────────────────────────

export interface ApiQAEntity {
  id: number;
  entity_label: string;
  category_id: number;
  date_range_type: string;
  report_type: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiQAEntityCreateResponse {
  status: string;
  message: string;
  data: ApiQAEntity;
}

export interface QAEntity {
  id: number;
  entityLabel: string;
  categoryId: number;
  dateRangeType: string;
  reportType: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQAEntityPayload {
  entity_label: string;
  category_id?: number;
  date_range_type: "daily" | "weekly";
  report_type?: string | null;
  sort_order?: number;
  active: boolean;
}

// ── QA Entities List response (includes categories) ────────────────────

export interface ApiQAEntityListCategory {
  id: number;
  label: string;
  sort_order: number;
  entities_count?: number;
  created_at: string;
  updated_at: string;
}

/** Entity returned by GET /entities — includes nested category */
export interface ApiQAEntityWithCategory extends ApiQAEntity {
  category?: ApiQAEntityListCategory;
}

export interface ApiQAEntitiesListResponse {
  status: string;
  message: string;
  data: {
    entities: ApiQAEntityWithCategory[];
    categories: ApiQAEntityListCategory[];
  };
  errors: unknown;
}

export interface QAEntityListCategory {
  id: number;
  label: string;
  sortOrder: number;
  entitiesCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Frontend entity with resolved category label */
export interface QAEntityWithCategory extends QAEntity {
  categoryLabel?: string;
}

/** Combined response for entities + categories */
export interface QAEntitiesAndCategories {
  entities: QAEntityWithCategory[];
  categories: QAEntityListCategory[];
}
