"use client";

import { CheckIcon, LanguageIcon } from "@heroicons/react/24/solid";
import { useState, useTransition } from "react";
import { Dropdown } from "flowbite-react";
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/services/locale";
import clsx from "clsx";

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export default function LocaleSwitcherSelect({ defaultValue, items, label }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedLocale, setSelectedLocale] = useState(defaultValue);

  function onChange(value: string) {
    const locale = value as Locale;
    setSelectedLocale(locale);
    startTransition(() => {
      setUserLocale(locale);
    });
  }

  return (
    <div className="relative">
      <Dropdown
        label=""
        dismissOnClick
        renderTrigger={() => (
          <button
            aria-label={label}
            className={clsx(
              "rounded-sm p-2 transition-colors hover:bg-slate-200 flex items-center",
              isPending && "pointer-events-none opacity-60"
            )}
          >
            <LanguageIcon className="h-6 w-6 text-slate-600 transition-colors group-hover:text-slate-900" />
          </button>
        )}
      >
        {items.map((item) => (
          <Dropdown.Item key={item.value} onClick={() => onChange(item.value)} className="flex items-center">
            <div className="mr-2 w-[1rem]">
              {item.value === selectedLocale && <CheckIcon className="h-5 w-5 text-slate-600" />}
            </div>
            <span className="text-slate-900">{item.label}</span>
          </Dropdown.Item>
        ))}
      </Dropdown>
    </div>
  );
}
