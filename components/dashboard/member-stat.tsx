"use client";

import { useMembersCount } from "@/services/member";
import { Venus, Mars } from "lucide-react";
import { StatCard } from "./stat-card";
import { useFamiliesCount } from "@/services/family";

export default function MemberStat() {
  const { data: dataMember } = useMembersCount();
  const { data: dataFamilies } = useFamiliesCount();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <StatCard
        description="Total Families"
        quantity={dataFamilies?.all ?? 0}
        title="Families"
      />
      <StatCard
        description="Total members"
        quantity={dataMember?.all ?? 0}
        title="Member"
      />
      <StatCard
        description="Total Female members"
        quantity={dataMember?.female ?? 0}
        title="Female Member"
        icon={<Venus className="h-5 w-5 text-pink-600" />}
      />
      <StatCard
        description="Total Male members"
        quantity={dataMember?.male ?? 0}
        title="Male Member"
        icon={<Mars className="h-5 w-5 text-blue-600" />}
      />
    </div>
  );
}
