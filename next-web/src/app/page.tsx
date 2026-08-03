import HeaderComponent from "@/components/ui/header/header-component";
import AsideNavigation from "@/components/ui/aside-navigation/aside-navigation";

export default function Home() {
  return (
    <div className="h-full flex relative">
      <AsideNavigation/>

      <div
        className="h-full relative bg-zinc-50 flex flex-col md:flex-row w-full"
      >
        <div className="bg-surface-1 px-4 min-h-full h-full border-r w-full">
          <header>
            <HeaderComponent/>
          </header>

          Week
        </div>

        <div className="bg-surface-1 p-4 w-[380px]">
          <h1>Створити бронювання</h1>
          <h6>Оберіть інтрервал в середені тиждня</h6>
        </div>
      </div>

    </div>
  );
}