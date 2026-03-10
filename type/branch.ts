import { Regions } from "./region";

export type BranchCount = {
  id: string;
  branchName: string;
  totalRegions: number;
};

export type Branch = {
  id: string;
  name: string;
  createdAt: string;
  regions?: Regions[];
};
