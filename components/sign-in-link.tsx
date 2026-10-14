"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SignInLink() {
  const pathname = usePathname();
  const next =
    pathname && pathname !== "/" && pathname !== "/login"
      ? `?next=${encodeURIComponent(pathname)}`
      : "";

  return (
    <Link href={`/login${next}`} className="underline">
      Sign in
    </Link>
  );
}
