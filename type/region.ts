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

export type Regions = {
  id: string;
  name: string;
  branchId: string;
  createdAt: string;
  branch?: Branch;
};
