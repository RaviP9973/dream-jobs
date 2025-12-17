"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";

interface iAppsProps {
    totalPages: number;
    currentPage: number
}

export function MainPagination({currentPage, totalPages} : iAppsProps)  {
  const searchParams = useSearchParams();


  function createPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `?${params.toString()}`;
  }

  function generatePaginationItems() {
    const items = [];

    if(totalPages <= 5) {
        for(let i = 1; i <= totalPages; i++) {
            items.push(i);
        }
    }else{
        if(currentPage <= 3) {
            for(let i = 1; i <= 3; i++) {
                items.push(i);
            }

            items.push(null);
            items.push(totalPages);
        }else if(currentPage >= totalPages -2) {
            items.push(1);
            items.push(null);

            for(let i = totalPages -2; i <= totalPages; i++) {
                items.push(i);
            }
        }else {
            items.push(1);
            items.push(null);
            items.push(currentPage -1);
            items.push(currentPage);
            items.push(currentPage +1);
            items.push(null);
            items.push(totalPages);
        }
    } 

    return items;
  }

  return (
    <Pagination>
        <PaginationContent>
            <PaginationItem> 
                <PaginationPrevious 
                  href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ""}
                  aria-disabled={currentPage === 1}
                />
            </PaginationItem>
            {generatePaginationItems().map((page,i) => (
                page === null ? (
                    <PaginationItem key={i}>
                        <PaginationEllipsis />
                    </PaginationItem>
                ) : (
                    <PaginationItem key={i}>
                        <PaginationLink 
                          href={createPageUrl(page)}
                          isActive={page === currentPage}
                        >
                            {page} 
                        </PaginationLink>
                    </PaginationItem>
                )
            ))}

            <PaginationItem>
                <PaginationNext 
                  href={currentPage < totalPages ? createPageUrl(currentPage + 1) : "#"}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ""}
                  aria-disabled={currentPage === totalPages}
                />
            </PaginationItem>
        </PaginationContent>
    </Pagination>
  );
}
