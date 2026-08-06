"use client"

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {useDebounced} from "@/hooks/use-debounced";
import TextInput from "@/components/ui/_shared/inputs/text-input";

export function WishedCapacityFilter() {
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("wishedCapacity") ?? "");
  const debouncedValue = useDebounced(value, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedValue) {
      params.set("wishedCapacity", debouncedValue);
    } else {
      params.delete("wishedCapacity");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedValue]);

  return (
    <TextInput
      type="number"
      value={value}
      placeholder="Введіть потрібну місткість"
      state="noError"
      onChange={(e) => setValue(e.target.value)}
    />
  );
}