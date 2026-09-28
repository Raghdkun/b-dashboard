/* ────────────────────────────────────────────────────────────────────────── */
/*  Maintenance Request Types                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export type MaintenanceStatus = "done" | "in_progress" | "pending" | "canceled" | "cancelled";

export interface MaintenanceRequest {
  id: number;
  entryNumber: number;
  status: MaintenanceStatus;
  brokenItem: string;
  submittedAt: string;
}

/* ── Pagination ────────────────────────────────────────────────────────── */

export interface PaginationInfo {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number;
  to: number;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface MaintenanceResponse {
  storeNumber: string;
  storeName: string;
  pagination?: PaginationInfo;
  links?: PaginationLinks;
  /** Present when the response uses limit-based (non-paginated) format */
  limit?: number;
  count?: number;
  data: MaintenanceRequest[];
}

/* ── Raw API shape (snake_case) ────────────────────────────────────────── */

export interface ApiMaintenanceRequest {
  id: number;
  entry_number: number;
  status: string;
  broken_item: string;
  submitted_at: string;
}

export interface ApiPaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface ApiPaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface ApiMaintenanceResponse {
  store_number: string;
  store_name: string;
  pagination?: ApiPaginationInfo;
  links?: ApiPaginationLinks;
  /** Present when the response uses limit-based (non-paginated) format */
  limit?: number;
  count?: number;
  data: ApiMaintenanceRequest[];
}

export interface MaintenanceErrorState {
  message: string;
  code: string;
  retryable: boolean;
}

export interface GetMaintenanceParams {
  storeId: string;
  page?: number;
}

/* ── Maintenance Request Detail ───────────────────────────────────────── */

export interface MaintenanceUserSummary {
  id: number;
  name: string;
  email: string;
}

export interface MaintenancePersonSummary {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface MaintenanceUrgencyLevel {
  id: number;
  name: string;
  description: string | null;
  priorityOrder: number | null;
}

export interface MaintenanceAttachment {
  id: number;
  contentType: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  createdAt: string;
}

export interface MaintenanceLink {
  id: number;
  linkType: string;
  downloadUrl: string;
  description: string | null;
  createdAt: string;
}

export interface MaintenanceStoreSummary {
  id: number;
  storeNumber: string;
  name: string;
  address: string | null;
}

export interface MaintenanceStatusHistory {
  id: number;
  notes: string | null;
  changedAt: string;
  oldStatus: string | null;
  newStatus: string | null;
  changedByUser: MaintenanceUserSummary | null;
}

export interface MaintenanceRequestDetail {
  id: number;
  storeId: number;
  formId: string | null;
  descriptionOfIssue: string | null;
  urgencyLevelId: number | null;
  equipmentWithIssue: string | null;
  basicTroubleshootDone: boolean;
  requestDate: string | null;
  dateSubmitted: string | null;
  entryNumber: number | null;
  requesterId: number | null;
  reviewedByManagerId: number | null;
  webhookId: string | null;
  notInCognito: number | null;
  assignmentSource: string | null;
  dueDate: string | null;
  taskEndDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  status: string;
  reason: string | null;
  costs: string | null;
  howWeFixedIt: string | null;
  progressDescription: string | null;
  requester: MaintenancePersonSummary | null;
  reviewedByManager: MaintenancePersonSummary | null;
  assignedTo: MaintenanceUserSummary | null;
  urgencyLevel: MaintenanceUrgencyLevel | null;
  attachments: MaintenanceAttachment[];
  links: MaintenanceLink[];
  store: MaintenanceStoreSummary | null;
  statusHistories: MaintenanceStatusHistory[];
}

/* ── Detail raw API shape (snake_case) ────────────────────────────────── */

export interface ApiMaintenanceUserSummary {
  id: number;
  name: string;
  email: string;
}

export interface ApiMaintenancePersonSummary {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface ApiMaintenanceUrgencyLevel {
  id: number;
  name: string;
  description: string | null;
  priority_order: number | null;
}

export interface ApiMaintenanceAttachment {
  id: number;
  content_type: string;
  file_name: string;
  file_size: number;
  download_url: string;
  created_at: string;
}

export interface ApiMaintenanceLink {
  id: number;
  link_type: string;
  download_url: string;
  description: string | null;
  created_at: string;
}

export interface ApiMaintenanceStoreSummary {
  id: number;
  store_number: string;
  name: string;
  address: string | null;
}

export interface ApiMaintenanceStatusHistory {
  id: number;
  notes: string | null;
  changed_at: string;
  old_status: string | null;
  new_status: string | null;
  changed_by_user: ApiMaintenanceUserSummary | null;
}

export interface ApiMaintenanceRequestDetail {
  id: number;
  store_id: number;
  form_id: string | null;
  description_of_issue: string | null;
  urgency_level_id: number | null;
  equipment_with_issue: string | null;
  basic_troubleshoot_done: boolean;
  request_date: string | null;
  date_submitted: string | null;
  entry_number: number | null;
  requester_id: number | null;
  reviewed_by_manager_id: number | null;
  webhook_id: string | null;
  not_in_cognito: number | null;
  assignment_source: string | null;
  due_date: string | null;
  task_end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  status: string;
  reason: string | null;
  costs: string | null;
  how_we_fixed_it: string | null;
  progress_description: string | null;
  requester: ApiMaintenancePersonSummary | null;
  reviewed_by_manager: ApiMaintenancePersonSummary | null;
  assigned_to: ApiMaintenanceUserSummary | null;
  urgency_level: ApiMaintenanceUrgencyLevel | null;
  attachments: ApiMaintenanceAttachment[];
  links: ApiMaintenanceLink[];
  store: ApiMaintenanceStoreSummary | null;
  status_histories: ApiMaintenanceStatusHistory[];
}
