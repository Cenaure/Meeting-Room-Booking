import SignInComponent from "@/components/ui/auth/sign-in/sign-in";
import RoutedModal from "@/components/ui/_shared/modal/routed-modal";

export default function SignInModal() {

  return (
    <RoutedModal>
      <SignInComponent/>
    </RoutedModal>
  )
}