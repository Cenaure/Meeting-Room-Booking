import HeaderComponent from "@/components/ui/header/header-component";
import AsideNavigation from "@/components/ui/aside-navigation/aside-navigation";
import WeekGrid from "@/components/ui/week-grid/week-grid";

export default function Home() {
  return (
    <div className="h-screen flex relative">
      <div className="hidden md:block">
        <AsideNavigation/>

      </div>

      <div className="h-full bg-zinc-50 flex flex-col md:flex-row w-full">
        <div className="bg-surface-1 border-r flex flex-col w-full h-full">
          <header className="px-4 shrink-0">
            <HeaderComponent/>
          </header>

          <div className="flex-1 min-h-0">
            <WeekGrid/>
          </div>
        </div>

        <div className="bg-surface-1 p-4 w-[380px]">
          <h1>Створити бронювання</h1>
          <h6>Оберіть інтрервал в середені тиждня</h6>
        </div>
      </div>

    </div>
  );
}