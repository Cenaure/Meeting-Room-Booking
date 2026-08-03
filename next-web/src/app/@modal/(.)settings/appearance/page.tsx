import RoutedModal from "@/components/ui/shared/modal/routed-modal";
import SettingsComponent from "@/components/ui/profile/settings-component";

export default function SettingsModal() {
  return (
    <RoutedModal>
      <SettingsComponent defaultTab="appearance"/>
    </RoutedModal>
  )
}