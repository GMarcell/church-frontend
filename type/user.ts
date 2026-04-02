export type CreateUserDto = {
  email: string;
  password: string;
  role: string;
  regionId?: string;
};

export type UpdateUserDto = Partial<CreateUserDto>;

export type User = {
  id: string;
  email: string;
  role: string;
  regionId?: string | null;
  createdAt: string;
  updatedAt?: string;
};
