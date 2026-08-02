import HeaderComponent from "@/components/ui/header/header-component";

export default function Home() {
  return (
    <div className="h-full relative flex flex-col md:grid md:grid-cols-[1fr_3.5fr_1fr] bg-zinc-50 ">
      <aside className="bg-surface-0 pt-4 border-r">
        Calendar
      </aside>

      <div className="bg-surface-1 px-8 min-h-full h-full border-r">
        <header>
          <HeaderComponent/>
        </header>

        Week
      </div>

      <div className="bg-surface-1 p-4">
        <h1>Створити бронювання</h1>
        <h6>Оберіть інтрервал в середені тиждня</h6>
      </div>
    </div>
  );
}