export type User = {
  user_id: number;
  email: string;
  username: string;
  type: "access";
  google_id?: string;
  is_activated: boolean;
}