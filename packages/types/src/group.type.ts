export interface CreateGroupBody {
  name: string;
  avatar?: string | null;
  memberIds: string[];
}

export interface GroupSummary {
  _id: string;
  name: string;
  avatar?: string | null;
  created_By: string;
  admin: string[];
  conversationId: string;
}
