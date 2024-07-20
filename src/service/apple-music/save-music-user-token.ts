'use server';

import { Session } from "@/lib/session";

export async function saveMusicUserToken(token?: string) {
  await using session = await Session.get();
  session.appleMusicUserToken = token;
}
