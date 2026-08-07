import ButtonLink from "@/components/ui/_shared/button/button-link";
import {my_reservations_route} from "@/lib/routes";
import {CalendarDotsIcon} from "@phosphor-icons/react/ssr";
import Hint from "@/components/ui/_shared/hint/hint";

export default function MyReservationsAsideButton() {

  return (
    <Hint content={"Перегляд заброньованих кімнат"} className="w-full">
      <ButtonLink
        fullWidth
        variant="outline"
        className="font-normal!"
        href={my_reservations_route}
      >
        <CalendarDotsIcon size={18} className="mr-2"/>
        <p className="flex-1 text-center">Мої бронювання</p>
      </ButtonLink>
    </Hint>

  )
}