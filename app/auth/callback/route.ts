import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

function safeNextPath(value: string | undefined) {
  if (!value) return "/";
  let path = value;
  try {
    path = decodeURIComponent(value);
  } catch {
    return "/";
  }
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

function requestOrigin(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return request.nextUrl.origin;
  }
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) return `https://${forwardedHost}`;
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = safeNextPath(request.cookies.get("auth_next")?.value);
  const env = publicEnv();

  if (!env || !code) {
    return NextResponse.redirect(new URL("/login?error=auth", origin));
  }

  const pending: PendingCookie[] = [];
  const cacheHeaders: Record<string, string> = {};
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        pending.push(...cookiesToSet);
        Object.assign(cacheHeaders, headers);
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
    : { data: null };

  const destination = new URL(profile ? nextPath : "/onboarding", origin);
  const response = NextResponse.redirect(destination);
  pending.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  Object.entries(cacheHeaders).forEach(([key, value]) => response.headers.set(key, value));
  response.cookies.set("auth_next", "", { path: "/", maxAge: 0 });
  return response;
}
