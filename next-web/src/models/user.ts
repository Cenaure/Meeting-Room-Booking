export interface User {
  user_id: number;
  email: string;
  username: string;
  type: "access";
  is_activated: boolean;
}