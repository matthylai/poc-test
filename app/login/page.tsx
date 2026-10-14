import { LoginButton } from "./login-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/";

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-zinc-600">
          Use Google to log visits. Reviews stay public.
        </p>
      </div>
      {params.error === "auth" ? (
        <p className="text-sm text-red-700">Sign-in did not complete.</p>
      ) : null}
      <LoginButton nextPath={nextPath} />
    </main>
  );
}
