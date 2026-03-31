import { Regions } from "./region";

export type FamilyCount = {
  all: number;
};

export type CreateFamilyMemberDto = {
  name: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  role: string;
  isActive: boolean;
};

export type CreateFamilyDto = {
  familyName: string;
  address: string;
  regionId: string;
  members?: CreateFamilyMemberDto[];
};

export type UpdateFamilyDto = Partial<CreateFamilyDto>;

export type Family = {
  id: string;
  familyName: string;
  address: string;
  regionId: string;
  createdAt: string;
  region?: Regions;
};
