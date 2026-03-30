import { Regions } from "./region";

export type FamilyCount = {
  all: number;
};

export type CreateFamilyDto = {
  familyName: string;
  address: string;
  regionId: string;
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
