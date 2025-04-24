'use client'

import React from "react";
import { PlusIcon, ClockIcon, WrenchIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Dropdown } from "flowbite-react";
import { usePathname } from "next/navigation";

export default function TaskDropdown() {
  const pathname = usePathname();
  return (
    <Dropdown
      inline
      label=""
      dismissOnClick={false}
      renderTrigger={() =>     
        <button
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          style={{ backgroundImage: 'none' }} // Remove background arrow
        >
          <span className="hidden md:block">New</span>
          <PlusIcon className="h-5 md:ml-4" />
        </button>
      }
      placement="bottom"
    >
      <Dropdown.Item icon={ClockIcon} href={`${pathname}/recurring/create`}>PM Task</Dropdown.Item>
      <Dropdown.Item icon={WrenchIcon} href={`${pathname}/repair/create`}>Repair Request</Dropdown.Item>
      <Dropdown.Item icon={CalendarIcon} href={`${pathname}/renewal/create`}>Renewal</Dropdown.Item>
    </Dropdown>
  );
}
