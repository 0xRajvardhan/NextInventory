
import { Avatar, Dropdown, DropdownDivider, DropdownHeader, DropdownItem } from "flowbite-react";
import { createClient } from "@/app/lib/supabase/server";
import Link from "next/link";

export default async function Component() {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
      <Dropdown
        label={<Avatar alt="User settings" placeholderInitials="EV" rounded >
          <div className="space-y-1 font-medium dark:text-white">
          <div>Emilio Visaez</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
        </div>
        </Avatar>}
        arrowIcon={false}
        inline
      >
        <DropdownHeader>
          <span className="block text-sm">Bonnie Green</span>
          <span className="block truncate text-sm font-medium">name@flowbite.com</span>
        </DropdownHeader>
        <DropdownItem>Dashboard</DropdownItem>
        <DropdownItem>Settings</DropdownItem>
        <DropdownItem>Earnings</DropdownItem>
        <DropdownDivider />
        <DropdownItem>Sign out</DropdownItem>
      </Dropdown>
  ) : (
    <Link
      href="/login"
      className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
    >
      Login
    </Link>
  );
}
