"use client";

import {useEffect, useRef, useState} from "react";
import {User} from "@/models/user";
import logout from "@/app/(misc)/actions/user/logout";

interface AccountDropdownProps {
  user: User;
  onLogout?: () => void;
}

export default function AccountDropdown({
                                          user,
                                        }: AccountDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-lavender-50 bg-lavender-500 font-semibold transition hover:bg-lavender-600"
      >
        {user.username.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-md border bg-surface-1">
          <div className="border-b px-4 py-3">
            <p className="font-medium">{user.username}</p>
            {"email" in user && user.email && (
              <p className="text-sm text-neutral-500">{user.email}</p>
            )}
          </div>

          <div className="py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-surface-2/40"
            >
              Налаштування
            </button>

            <button
              onClick={logout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10"
            >
              Вийти з акаунту
            </button>
          </div>
        </div>
      )}
    </div>
  );
}