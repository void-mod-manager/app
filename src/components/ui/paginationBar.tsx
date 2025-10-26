import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../primitives/pagination";

// biome-ignore lint/correctness/noUnusedVariables: Is used
namespace PaginationBar {
  export interface Props {
    currentPage: number;
    totalPages: number;

    onPaginate: (page: number) => void;
  }
}

function PaginationBar(props: PaginationBar.Props) {
  return (
    <Pagination className="absolute bottom-0 left-[35%] mx-auto w-fit rounded-xl border border-border/30 bg-background/95 p-2 shadow-lg">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-label="Previous page"
            className={`rounded-full px-3 py-2 transition-colors ${
              props.currentPage === 1
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-muted/30"
            }`}
            onClick={() => {
              if (props.currentPage > 1) {
                // TODO: Only if onPaginate exists
                props.onPaginate(props.currentPage - 1);
              }
            }}
            tabIndex={props.currentPage === 1 ? -1 : 0}
          />
        </PaginationItem>
        {Array.from({ length: props.totalPages }, (_, i) => i + 1).map(
          (page) => {
            // Only show first, last, current, and neighbors for brevity
            const showPage =
              page === 1 ||
              page === props.totalPages ||
              Math.abs(page - props.currentPage) <= 1;
            if (!showPage) {
              // Only show ellipsis once between gaps
              if (
                page === props.currentPage - 2 ||
                page === props.currentPage + 2
              ) {
                return (
                  <PaginationItem key={`ellipsis-${page}`}>
                    <PaginationEllipsis className="mx-1 text-muted-foreground" />
                  </PaginationItem>
                );
              }
              return null;
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === props.currentPage}
                  href="#"
                  onClick={() => props.onPaginate(page)}
                  className={`rounded-full px-3 py-2 transition-colors ${
                    page === props.currentPage
                      ? "bg-primary font-bold text-primary-foreground shadow"
                      : "hover:bg-muted/30"
                  }`}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          },
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-label="Next page"
            className={`rounded-full px-3 py-2 transition-colors ${
              props.currentPage === props.totalPages
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-muted/30"
            }`}
            onClick={async () => {
              if (props.currentPage < props.totalPages) {
                props.onPaginate(props.currentPage + 1);
              }
            }}
            tabIndex={props.currentPage === props.totalPages ? -1 : 0}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default PaginationBar;
