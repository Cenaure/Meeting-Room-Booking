"use client"

import {useState} from "react";

import {useUser} from "@/stores/user.store";
import {PaletteIcon, UserIcon} from "@phosphor-icons/react/ssr";
import ProfileTab from "@/components/ui/settings/tabs/profile-tab";
import AppearanceTab from "@/components/ui/settings/tabs/appearance-tab";

type Tab = "profile" | "appearance";

const TABS: { value: Tab; label: string; icon: typeof UserIcon }[] = [
  {value: "profile", label: "Акаунт", icon: UserIcon},
  {value: "appearance", label: "Зовнішній вигляд", icon: PaletteIcon},
];

export default function SettingsComponent({defaultTab = "profile"}: { defaultTab?: Tab }) {
  const user = useUser((state) => state.user);

  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  return (
    <div
      className="w-full pt-10 lg:pt-0 lg:w-4xl h-screen lg:h-[66vh] lg:max-h-300 lg:max-w-4xl mx-auto relative bg-surface-0 rounded-md shadow-xs ring-2 ring-border md:grid md:grid-cols-[220px_1fr]">
      <nav className="border-b lg:border-b-0 lg:border-r border-border p-4 space-y-1">
        {TABS.map(({value, label, icon: Icon}) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value)}
            className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors ${
              activeTab === value
                ? "bg-lavender-400/20 text-lavender-500 font-medium"
                : "hover:bg-surface-2/80 text-foreground/80 dark:hover:bg-surface-1/80"
            }`}
          >
            <Icon size={20}/>
            {label}
          </button>
        ))}
      </nav>

      <div className="p-8 space-y-4 overflow-y-auto">
        {activeTab === "profile" && <ProfileTab user={user}/>}

        {activeTab === "appearance" && <AppearanceTab/>}
      </div>
    </div>
  );
}