import Link from "next/link";
import { SignInLink } from "@/components/sign-in-link";
import { getViewer } from "@/lib/viewer";

export async function SiteHeader() {
  const viewer = await getViewer();

  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-semibold">
          Ski diary
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {viewer.profile ? (
            <Link href={`/users/${viewer.profile.username}`} className="underline">
              {viewer.profile.username}
            </Link>
          ) : null}
          {viewer.user ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="underline">
                Sign out
              </button>
            </form>
          ) : (
            <SignInLink />
          )}
        </nav>
      </div>
    </header>
  );
}
