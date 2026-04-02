import { Branch } from "./branch";
import { User } from "./user";

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
  coordinatorId: string | null;
};

export type Regions = {
  id: string;
  name: string;
  branchId: string;
  coordinatorId?: string | null;
  createdAt: string;
  branch?: Branch;
  coordinator?: User | null;
};
