export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
      <button
        className="btn btn-secondary"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &laquo; Previous
      </button>

      {Array.from(
        { length: totalPages },
        (_, i) => i + 1
      )
        .filter(
          (page) =>
            page === 1 ||
            page === totalPages ||
            Math.abs(page - currentPage) <= 2
        )
        .map((page, index, array) => (
          <span key={page}>
            {index > 0 &&
              page - array[index - 1] > 1 &&
              "..."}
            <button
              className={`btn ${
                currentPage === page
                  ? "btn-primary"
                  : "btn-outline-primary"
              } mx-1`}
              onClick={() =>
                onPageChange(page)
              }
            >
              {page}
            </button>
          </span>
        ))}

      <button
        className="btn btn-secondary"
        disabled={currentPage === totalPages}
        onClick={() =>
          onPageChange(currentPage + 1)
        }
      >
        Next &raquo;
      </button>
    </div>
  );
}