export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface UserResponse extends User {
  // Response from API after login/register
}
