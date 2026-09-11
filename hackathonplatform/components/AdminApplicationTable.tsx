"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";

type Application = {
  id: string;
  applicant_type: "hacker" | "judge" | "mentor" | "volunteer";
  full_name: string;
  email: string;
  school: string;
  team_name: string | null;
  status: "submitted" | "accepted" | "rejected";
  score: number | null;
  review_notes: string | null;
};

type SortKey = "full_name" | "school";
type Direction = "asc" | "desc";

const rowStyles = {
  submitted: "bg-white",
  accepted: "bg-green-50",
  rejected: "bg-red-50",
};

const statusLabels = {
  submitted: "Submitted",
  accepted: "Accepted",
  rejected: "Rejected",
};

function Arrow({ direction }: { direction: Direction | null }) {
  if (!direction) return null;
  return <span aria-hidden="true" className="ml-1 text-green-700">{direction === "asc" ? "↑" : "↓"}</span>;
}

export default function AdminApplicationTable({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Application["status"] | null>(null);
  const [typeFilter, setTypeFilter] = useState<Application["applicant_type"] | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; direction: Direction } | null>(null);

  const visibleApplications = useMemo(() => {
    const filtered = applications.filter((application) =>
      (!statusFilter || application.status === statusFilter) &&
      (!typeFilter || application.applicant_type === typeFilter) &&
      [application.full_name, application.email, application.team_name ?? ""]
        .some((value) => value.toLowerCase().includes(search.trim().toLowerCase())),
    );
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const left = String(a[sort.key] ?? "").toLowerCase();
      const right = String(b[sort.key] ?? "").toLowerCase();
      return left.localeCompare(right) * (sort.direction === "asc" ? 1 : -1);
    });
  }, [applications, search, statusFilter, typeFilter, sort]);

  function exportCsv() {
    router.push("/api/admin/export");
  }

  function toggleSort(key: SortKey) {
    setSort((current) => current?.key === key
      ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
      : { key, direction: "asc" });
  }

  function cycleStatus() {
    setStatusFilter((current) => current === null ? "submitted" : current === "submitted" ? "accepted" : current === "accepted" ? "rejected" : null);
  }

  function cycleType() {
    setTypeFilter((current) =>
      current === null
        ? "hacker"
        : current === "hacker"
          ? "judge"
          : current === "judge"
            ? "mentor"
            : current === "mentor"
              ? "volunteer"
              : null,
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email, or team name"
          aria-label="Search applications by name, email, or team name"
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm sm:max-w-md"
        />
        <button type="button" onClick={exportCsv} className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-medium hover:border-green-600 hover:text-green-700">
          Export to CSV
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="hidden grid-cols-[1.4fr_1.1fr_1fr_1fr_180px] gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 md:grid">
        <button onClick={() => toggleSort("full_name")} className="cursor-pointer text-left hover:text-green-700">Applicant<Arrow direction={sort?.key === "full_name" ? sort.direction : null} /></button>
        <button onClick={cycleType} className="cursor-pointer text-left hover:text-green-700">Type{typeFilter && `: ${typeFilter}`} </button>
        <button onClick={() => toggleSort("school")} className="cursor-pointer text-left hover:text-green-700">School<Arrow direction={sort?.key === "school" ? sort.direction : null} /></button>
        <span>Team</span>
        <button onClick={cycleStatus} className="cursor-pointer text-center hover:text-green-700">Status{statusFilter && `: ${statusLabels[statusFilter]}`}</button>
      </div>
      {visibleApplications.map((application) => (
        <div key={`${application.id}-${application.status}`} className={`group grid cursor-pointer gap-4 border-b border-zinc-200 px-5 py-4 transition hover:bg-zinc-100 md:grid-cols-[1.4fr_1.1fr_1fr_1fr_180px] md:items-center ${rowStyles[application.status]}`}>
          <Link href={`/admin/applications/${application.id}`} className="min-w-0">
            <p className="truncate font-semibold">{application.full_name}</p>
            <p className="truncate text-sm text-zinc-500">{application.email}</p>
          </Link>
          <Link href={`/admin/applications/${application.id}`} className="capitalize text-sm">{application.applicant_type}</Link>
          <Link href={`/admin/applications/${application.id}`} className="truncate text-sm">{application.school}</Link>
          <Link href={`/admin/applications/${application.id}`} className="truncate text-sm">{application.team_name ?? "Solo"}</Link>
          <div className="flex items-center justify-center">
            <ReviewForm id={application.id} status={application.status} score={application.score} reviewNotes={application.review_notes} />
          </div>
        </div>
      ))}
      {!visibleApplications.length && <p className="p-8 text-center text-zinc-500">No applications match this filter.</p>}
      </div>
    </div>
  );
}
