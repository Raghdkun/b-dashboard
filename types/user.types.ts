export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "editor";
  status: "active" | "inactive" | "pending";
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: User["role"];
  password: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: User["role"];
  status?: User["status"];
  avatar?: string | null;
}
