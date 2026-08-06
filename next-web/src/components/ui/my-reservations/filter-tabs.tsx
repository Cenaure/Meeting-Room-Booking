"use client";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ReservationFilters} from "@/models/reservation";
import Button from "@/components/ui/_shared/button/button";

interface FilterTabsProps {
  activeFilter: ReservationFilters;
}

export default function FilterTabs({activeFilter}: FilterTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = (filter: ReservationFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", filter);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, {scroll: false});
  };

  return (
    <div className="flex w-fit rounded-md border">
      <Button
        variant="ghost"
        key="past"
        onClick={() => setFilter("past")}
        className={`transition-colors
          ${activeFilter === "past"
          ? "dark:bg-surface-1! bg-surface-3!"
          : "text-foreground/60!"
        }`}
      >
        Минулі
      </Button>

      <Button
        variant="ghost"
        key="future"
        onClick={() => setFilter("future")}
        className={`transition-colors
          ${activeFilter === "future"
          ? "dark:bg-surface-1! bg-surface-3!"
          : "text-foreground/60!"
        }`}
      >
        Майбутні
      </Button>
    </div>
  );
}