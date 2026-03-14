"use server";

import { setAuthCookie, clearAuthCookie } from "@/lib/auth";

export async function setTokenCookie(token: string) {
  await setAuthCookie(token);
}

export async function removeTokenCookie() {
  await clearAuthCookie();
}
