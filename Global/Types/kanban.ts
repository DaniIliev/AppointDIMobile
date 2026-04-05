export type Priority = "low" | "medium" | "high" | "urgent";
export type CardStatus = "Planned" | "In Progress" | "Finished";

export interface KanbanUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface KanbanComment {
  _id: string;
  userId: string;
  user: KanbanUser;
  text: string;
  parentId?: string;
  replies?: KanbanComment[];
  createdAt: string;
  updatedAt: string;
}

export interface KanbanAttachment {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface KanbanCard {
  _id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  priority?: Priority;
  status?: CardStatus;
  columnId: string;
  assignedUsers: KanbanUser[];
  comments: KanbanComment[];
  attachments: KanbanAttachment[];
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface KanbanColumn {
  _id: string;
  title: string;
  color: string;
  order: number;
  limit?: number;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  _id: string;
  title: string;
  description?: string;
  columns: KanbanColumn[];
  members: KanbanUser[];
  createdAt: string;
  updatedAt: string;
}
