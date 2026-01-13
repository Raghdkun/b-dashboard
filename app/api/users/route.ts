import { NextRequest, NextResponse } from "next/server";

// Mock users data
const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    avatar: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    status: "active",
    avatar: null,
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "editor",
    status: "active",
    avatar: null,
    createdAt: "2024-03-10T00:00:00Z",
    updatedAt: "2024-03-10T00:00:00Z",
  },
  {
    id: "4",
    name: "Bob Wilson",
    email: "bob@example.com",
    role: "user",
    status: "inactive",
    avatar: null,
    createdAt: "2024-04-05T00:00:00Z",
    updatedAt: "2024-04-05T00:00:00Z",
  },
  {
    id: "5",
    name: "Alice Brown",
    email: "alice@example.com",
    role: "user",
    status: "pending",
    avatar: null,
    createdAt: "2024-05-20T00:00:00Z",
    updatedAt: "2024-05-20T00:00:00Z",
  },
  {
    id: "6",
    name: "Charlie Davis",
    email: "charlie@example.com",
    role: "editor",
    status: "active",
    avatar: null,
    createdAt: "2024-06-12T00:00:00Z",
    updatedAt: "2024-06-12T00:00:00Z",
  },
  {
    id: "7",
    name: "Diana Evans",
    email: "diana@example.com",
    role: "user",
    status: "active",
    avatar: null,
    createdAt: "2024-07-08T00:00:00Z",
    updatedAt: "2024-07-08T00:00:00Z",
  },
  {
    id: "8",
    name: "Edward Foster",
    email: "edward@example.com",
    role: "user",
    status: "inactive",
    avatar: null,
    createdAt: "2024-08-25T00:00:00Z",
    updatedAt: "2024-08-25T00:00:00Z",
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";

  // Filter users
  let filteredUsers = [...mockUsers];

  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    );
  }

  if (role) {
    filteredUsers = filteredUsers.filter((user) => user.role === role);
  }

  if (status) {
    filteredUsers = filteredUsers.filter((user) => user.status === status);
  }

  // Pagination
  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return NextResponse.json({
    data: paginatedUsers,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
    },
  });
}
