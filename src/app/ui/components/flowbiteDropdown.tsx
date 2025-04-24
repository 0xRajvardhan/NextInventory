"use client";

import { Dropdown } from "flowbite-react";
import { Cog8ToothIcon, ViewfinderCircleIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function FlowbiteDropdown({ id }: { id: string }) {
  const pathname = usePathname();
  const t = useTranslations("Dropdown");
  return (
    <Dropdown   
      className="flowbite-dropdown absolute z-10"
      inline label={<Cog8ToothIcon className="overflow-visible h-6 w-6"/>} 
      placement="top"
    >
      <Dropdown.Item icon={ViewfinderCircleIcon} href={`${pathname}/${id}`}>{t('view')}</Dropdown.Item>
      <Dropdown.Item icon={PencilSquareIcon} href={`${pathname}/${id}/edit`}>{t('edit')}</Dropdown.Item>
      <Dropdown.Item icon={TrashIcon} href={`${pathname}/${id}/delete`}>{t('delete')}</Dropdown.Item>
    </Dropdown>
  );
}
export default FlowbiteDropdown;