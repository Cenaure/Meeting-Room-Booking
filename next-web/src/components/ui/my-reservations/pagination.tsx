"use client";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {CaretLeftIcon, CaretRightIcon} from "@phosphor-icons/react/ssr";
import Button from "@/components/ui/shared/button/button";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  limit: number;
}

export default function Pagination({currentPage, totalItems, limit}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / limit);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs text-foreground/50">
        Сторінка {currentPage} з {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="auto"
          className="aspect-square w-8"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          <CaretLeftIcon size={18}/>
        </Button>

        <Button
          variant="ghost"
          size="auto"
          className="aspect-square w-8"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          <CaretRightIcon size={18}/>
        </Button>
      </div>
    </div>
  );
}