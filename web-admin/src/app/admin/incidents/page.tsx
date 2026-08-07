import { getPrisma } from "@/lib/prisma";
import IncidentsTable from "./incidents-table";

export default async function IncidentsPage() {
  const prisma = await getPrisma();
  const incidents = await prisma.incident.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      description: true,
      status: true,
      images: true,
      customCategoryText: true,
      createdAt: true,
      acceptedAt: true,
      completedAt: true,
      machine: { select: { name: true, code: true, location: true } },
      reporter: { select: { name: true, employeeCode: true } },
      assignedTo: { select: { name: true, employeeCode: true } },
      category: { select: { name: true, isOther: true } },
      maintenanceLogs: {
        select: {
          durationMinutes: true,
          repairDetail: true,
          partsReplaced: true,
          skillRating: true,
          technician: { select: { name: true } },
        },
      },
    },
  });

  return (
    <div>
      <IncidentsTable incidents={incidents} />
    </div>
  );
}
