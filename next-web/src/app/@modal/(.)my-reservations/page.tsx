import RoutedModal from "@/components/ui/_shared/modal/routed-modal";
import MyReservationsComponent from "@/components/ui/my-reservations/my-reservations";

interface MyReservationsModalProps {
  searchParams: Promise<{ page?: string, limit?: string }>
}

export default async function MyReservationsModal({searchParams}: MyReservationsModalProps) {
  const sParams = await searchParams;

  return <RoutedModal>
    <MyReservationsComponent searchParams={sParams}/>
  </RoutedModal>
}