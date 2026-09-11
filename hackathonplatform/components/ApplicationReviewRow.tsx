import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";

type Application = {
  id: string;
  applicant_type: string;
  full_name: string;
  email: string;
  school: string;
  experience_level: string;
  status: string;
  score: number | null;
  review_notes: string | null;
};

const rowStyles: Record<string, string> = {
  submitted: "bg-white",
  accepted: "bg-green-50",
  rejected: "bg-red-50",
};

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function ApplicationReviewRow({ application }: { application: Application }) {
  return (
    <div className={`grid gap-4 border-b border-zinc-200 px-5 py-4 md:grid-cols-[1.4fr_1.2fr_1fr_1fr_180px] md:items-center ${rowStyles[application.status] ?? "bg-white"}`}>
      <Link href={`/admin/applications/${application.id}`} className="min-w-0">
        <p className="truncate font-semibold">{application.full_name}</p>
        <p className="truncate text-sm text-zinc-500">{application.email}</p>
      </Link>
      <Link href={`/admin/applications/${application.id}`} className="capitalize text-sm">{application.applicant_type}</Link>
      <Link href={`/admin/applications/${application.id}`} className="truncate text-sm">{application.school}</Link>
      <Link href={`/admin/applications/${application.id}`} className="capitalize text-sm">{application.experience_level}</Link>
      <div className="flex items-center justify-center gap-2">
        <span className="sr-only">{statusLabels[application.status] ?? "Submitted"}</span>
        <ReviewForm id={application.id} status={application.status} score={application.score} reviewNotes={application.review_notes} />
      </div>
    </div>
  );
}
