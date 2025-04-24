"use client";

import { Dropdown } from "flowbite-react";
import { Cog8ToothIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface WorkOrderDropdownProps {
  id?: string;
  children?: ReactNode;
}

export function WorkOrderDropdown({ id, children }: WorkOrderDropdownProps) {
  const pathname = usePathname();

  return (
    <Dropdown
      className="flowbite-dropdown absolute z-10"
      inline
      label=''
      renderTrigger={() => <Cog8ToothIcon className="overflow-visible h-6 w-6" />}
      placement="bottom"
    >
      {children ? (
        children
      ) : (
        <>
          <Dropdown.Item icon={PencilSquareIcon} href={`${pathname}/${id}/edit`}>
            Edit
          </Dropdown.Item>
          <Dropdown.Item icon={TrashIcon} href={`${pathname}/${id}/delete`}>
            Delete
          </Dropdown.Item>
        </>
      )}
    </Dropdown>
  );
}

export default WorkOrderDropdown;
