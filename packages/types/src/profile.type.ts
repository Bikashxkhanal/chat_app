export interface UpdateProfileBody {
  full_name?: string;
  email?: string;
  avatar?: string | null;
}

export interface PublicUserProfile {
  _id: string;
  full_name?: string | null;
  email?: string | null;
  avatar?: string | null;
  phone_number: string;
}
