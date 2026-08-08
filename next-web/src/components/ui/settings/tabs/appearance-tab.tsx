"use client"

import {useTheme} from "next-themes";
import {useEffect, useState} from "react";
import {MonitorIcon, MoonIcon, SunIcon} from "@phosphor-icons/react/ssr";
import WalkingFoxImage from "@/components/ui/settings/walking-fox-image";

const THEMES = [
  {value: "light", label: "Світла", icon: SunIcon},
  {value: "dark", label: "Темна", icon: MoonIcon},
  {value: "system", label: "Системна", icon: MonitorIcon},
] as const;

export default function AppearanceTab() {
  const {theme, setTheme} = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <div className="space-y-4">
        <h2 className="font-semibold">Зовнішній вигляд</h2>

        <h3>Теми за замовчуванням</h3>
        <div>
          <WalkingFoxImage />

          <div className="grid grid-cols-3 gap-3 max-w-sm">
            {THEMES.map(({value, label, icon: Icon}) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2 rounded-md border p-4 transition-colors ${
                  mounted && theme === value
                    ? "border-lavender-400 bg-lavender-400/10"
                    : "border-border hover:bg-surface-1"
                }`}
              >
                <Icon size={20}/>
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </>

  );
}