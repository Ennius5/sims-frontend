interface PaginationProps {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, lastPage, total, perPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null

  const start = (currentPage - 1) * perPage + 1
  const end = Math.min(currentPage * perPage, total)

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
      <p className="text-sm text-gray-600">
        Showing {start}–{end} of {total} (page {currentPage} of {lastPage})
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}