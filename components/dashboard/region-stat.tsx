"use client";

import { useRegionsCount } from "@/services/region";
import { StatCard } from "./stat-card";

export default function RegionStat() {
  const { data } = useRegionsCount();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <StatCard
        description="Total Region"
        quantity={data?.length ?? 0}
        title="Region"
      />
      {data?.map((item) => (
        <StatCard
          key={item.id}
          description="Total Families"
          quantity={item?.totalFamilies ?? 0}
          title={item.regionName}
        />
      ))}
    </div>
  );
}
