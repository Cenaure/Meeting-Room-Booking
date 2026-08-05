import {getMyReservations} from "@/app/my-reservations/actions";
import {ReservationFilters} from "@/models/reservation";
import ReservationCard from "@/components/ui/my-reservations/reservation-card";
import FilterTabs from "@/components/ui/my-reservations/filter-tabs";
import Pagination from "@/components/ui/shared/pagination/pagination";
import {CalendarXIcon, WifiSlashIcon} from "@phosphor-icons/react/ssr";
import CancelReservationApproval from "@/components/ui/my-reservations/cancel-reservation-approval";

interface MyReservationsProps {
  searchParams: {
    page?: string;
    limit?: string;
    filter?: ReservationFilters;
  };
}

export default async function MyReservationsComponent({searchParams}: MyReservationsProps) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 5;
  const filter = searchParams.filter || "future";

  const response = await getMyReservations({page, limit, filter});
  const data = response.ok ? response.data : null;

  return (
    <div className="flex h-screen lg:max-h-[85vh] w-full flex-col rounded-md bg-surface-0 ring-2 ring-border md:w-2xl">
      <div className="shrink-0 space-y-4">
        <h1 className="flex items-center gap-2 text-lg font-semibold p-6 pb-2">
          Мої бронювання
          {data && (
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-lavender-500 px-1.5 text-xs font-medium text-lavender-50">
              {data.total}
            </span>
          )}
        </h1>

        <div className="border-y border-border p-4 px-6">
          <FilterTabs activeFilter={filter}/>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6 pt-4">
        {!response.ok ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <WifiSlashIcon size={32} className="text-foreground/40"/>
            <p className="text-sm font-semibold">
              {response.isServerDown ? "Сервер тимчасово недоступний" : "Не вдалося завантажити бронювання"}
            </p>
            <p className="max-w-xs text-xs text-foreground/60">{response.message}</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <CalendarXIcon size={32} className="text-foreground/40"/>
            <p className="text-sm font-semibold">
              {filter === "future" ? "Немає майбутніх бронювань" : "Немає минулих бронювань"}
            </p>
            <p className="max-w-xs text-xs text-foreground/60">
              {filter === "future"
                ? "Заброньовані переговорні з'являться тут"
                : "Тут з'являться бронювання, термін яких минув"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map((r) => (
              <ReservationCard key={r.id} reservation={r}/>
            ))}
          </div>
        )}
      </div>

      {response.ok && data && data.total > limit && (
        <div className="shrink-0 border-t border-border p-4">
          <Pagination currentPage={page} totalItems={data.total} limit={limit}/>
        </div>
      )}

      <CancelReservationApproval/>
    </div>
  );
}