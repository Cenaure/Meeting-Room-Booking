import RoutedModal from "@/components/ui/_shared/modal/routed-modal";
import SettingsComponent from "@/components/ui/settings/settings-component";

export default function SettingsModal() {
  return (
    <RoutedModal>
      <SettingsComponent defaultTab="appearance"/>
    </RoutedModal>
  )
}