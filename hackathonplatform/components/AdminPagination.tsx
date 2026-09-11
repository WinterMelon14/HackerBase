import Link from "next/link";

export default function AdminPagination({ page, hasNextPage }: { page: number; hasNextPage: boolean }) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      {page > 1 ? <Link href={`/admin?page=${page - 1}`} className="rounded-lg border border-zinc-300 px-4 py-2 hover:border-green-600 hover:text-green-700">Previous</Link> : <span />}
      <span className="text-zinc-500">Page {page}</span>
      {hasNextPage ? <Link href={`/admin?page=${page + 1}`} className="rounded-lg border border-zinc-300 px-4 py-2 hover:border-green-600 hover:text-green-700">Next</Link> : <span />}
    </div>
  );
}
