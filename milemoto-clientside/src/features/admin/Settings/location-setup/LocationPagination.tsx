// src/features/admin/Settings/location-setup/LocationPagination.tsx
'use client';

import React from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/pagination';

// Custom hook to generate pagination ranges
function usePagination({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
}: {
  totalCount: number;
  pageSize: number;
  siblingCount?: number;
  currentPage: number;
}) {
  const totalPageCount = Math.ceil(totalCount / pageSize);

  // Core logic to determine page numbers
  const paginationRange = React.useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPageCount) {
      return Array.from({ length: totalPageCount }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPageCount - rightItemCount + i + 1,
      );
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      );
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
    return [];
  }, [totalPageCount, siblingCount, currentPage]);

  return paginationRange;
}

type Props = {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function LocationPagination({ totalCount, currentPage, pageSize, onPageChange }: Props) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const paginationRange = usePagination({
    totalCount,
    pageSize,
    currentPage,
  });

  if (totalPages <= 1) {
    return null; // Don't render pagination if only one page
  }

  const onNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="flex items-center justify-between pt-4">
      <div className="text-foreground/80 text-sm">
        Page {currentPage} of {totalPages} (Total {totalCount} items)
      </div>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={e => {
                e.preventDefault();
                onPrevious();
              }}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
            />
          </PaginationItem>

          {paginationRange.map((page, index) => {
            if (page === '...') {
              return (
                <PaginationItem key={`dots-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={e => {
                    e.preventDefault();
                    onPageChange(page as number);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={e => {
                e.preventDefault();
                onNext();
              }}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
