export type CreateUserDto = {
  email: string;
  password: string;
  role: string;
};

export type UpdateUserDto = Partial<CreateUserDto>;

export type User = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
};
