import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";
import { UsernameForm } from "./username-form";

export default async function OnboardingPage() {
  const viewer = await getViewer();
  if (!viewer.configured) {
    redirect("/");
  }
  if (!viewer.user) {
    redirect("/login");
  }
  if (viewer.profile) {
    redirect(`/users/${viewer.profile.username}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Choose a username</h1>
        <p className="text-sm text-zinc-600">
          This becomes your profile address. Letters, numbers, and hyphens, 3 to 20 characters.
        </p>
      </div>
      <UsernameForm />
    </main>
  );
}
