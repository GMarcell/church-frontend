import { Branch } from "./branch";

export type RegionCount = {
  id: string;
  regionName: string;
  totalFamilies: number;
};

export type CreateRegionDto = {
  name: string;
  branchId: string;
};

export type UpdateRegionDto = Partial<CreateRegionDto>;

export type AssignRegionCoordinatorDto = {
  memberId: string | null;
};

export type RegionCoordinatorMember = {
  id: string;
  name: string;
  email?: string;
  familyId?: string;
};

export type Regions = {
  id: string;
  name: string;
  branchId: string;
  coordinatorId?: string | null;
  createdAt: string;
  branch?: Branch;
  coordinator?: RegionCoordinatorMember | null;
};
