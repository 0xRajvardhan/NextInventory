"use client";

// Import the house icon from Bootstrap Icons
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useTranslations } from "use-intl";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "home", href: "/dashboard", iconClass: "bi-house" },
  {
    name: "equipment",
    href: "/dashboard/equipment",
    iconClass: "bi-truck",
  },
  {
    name: "inventory",
    href: "/dashboard/inventory",
    iconClass: "bi-inboxes-fill",
  },
  {
    name: "purchaseorders",
    href: "/dashboard/purchaseorders",
    iconClass: "bi-cart-plus",
  },
  {
    name: "workorders",
    href: "/dashboard/workorders",
    iconClass: "bi-box-arrow-up",
  },
  {
    name: "employees",
    href: "/dashboard/employees",
    iconClass: "bi bi-person-add",
  },
  {
    name: "vendors",
    href: "/dashboard/vendors",
    iconClass: "bi bi-house-add",
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  const t = useTranslations("DashboardNavLinks");

  return (
    <>
      {links.map((link) => {
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "bg-sky-100 text-blue-600": pathname === link.href,
              }
            )}
          >
            <i className={`bi ${link.iconClass} w-6`} />
            <p className="hidden md:block">{t(link.name)}</p>
          </Link>
        );
      })}
    </>
  );
}
