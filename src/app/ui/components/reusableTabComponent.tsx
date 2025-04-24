"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface ClickableTableRowProps {
  href: string;
  children: React.ReactNode;
}

export default function ClickableTableRow({ href, children }: ClickableTableRowProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={handleClick}
      className="cursor-pointer"
    >
      {children}
    </tr>
  );
}
