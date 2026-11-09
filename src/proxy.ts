import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

// Dans Next.js 16, « middleware » s'appelle « proxy ».
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Toutes les pages, sauf les fichiers statiques et les images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
