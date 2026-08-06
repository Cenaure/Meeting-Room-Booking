import HeaderComponent from "@/components/ui/header/desktop/header-component";
import AsideNavigation from "@/components/ui/aside-navigation/aside-navigation";
import WeekGrid from "@/components/ui/week-grid/week-grid";
import TimezoneDiffersToast from "@/components/ui/header/timezone-differs-toast";
import MobileHeaderComponent from "@/components/ui/header/mobile/mobile-header";
import MobileBottomNavigation from "@/components/ui/mobile-bottom-navigation/mobile-bottom-navigation";

export default function Home() {
  return (
    <div className="h-screen flex relative">
      <div className="hidden md:block">
        <AsideNavigation/>

      </div>

      <div className="h-full bg-zinc-50 flex flex-col md:flex-row w-full">
        <div className="bg-surface-1 border-r flex flex-col w-full h-full">
          <header className="lg:px-4 shrink-0">
            <HeaderComponent/>
            <MobileHeaderComponent/>
          </header>

          <div className="flex-1 min-h-0">
            <WeekGrid/>
          </div>
        </div>

        <div className="hidden lg:block bg-surface-1 p-4 w-[380px]">
          <h1>Створити бронювання</h1>
          <h6>Оберіть інтрервал в середені тиждня</h6>
        </div>

      </div>

      <MobileBottomNavigation/>

      <TimezoneDiffersToast/>

    </div>
  );
}