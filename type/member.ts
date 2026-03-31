import { Family } from "./family";

export type CreateMemberDto = {
  name: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  role: string;
  isActive: boolean;
  familyId: string;
};

export type UpdateMemberDto = Partial<CreateMemberDto>;

export type Member = {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  role: string;
  pelkat?: string;
  memberPelkat?: string;
  isActive: boolean;
  familyId: string;
  createdAt: string;
  family: Family;
};

export type CountMember = {
  all: number;
  male: number;
  female: number;
};

export type PelkatMemberCount = {
  pelkat: string;
  total: number;
};
