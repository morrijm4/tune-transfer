'use server';

import { Session } from '@/lib/session';
import { createPrivateKey, KeyObject } from 'crypto';
import { SignJWT } from 'jose';

const teamId: string = process.env.APPLE_MUSIC_TEAM_ID!;

const keyId: string = process.env.APPLE_MUSIC_KEY_ID!;

const privateKey: KeyObject = createPrivateKey({
  key: Buffer.from(process.env.APPLE_MUSIC_PRIVATE_KEY!, 'base64').toString(),
});

export async function generateDeveloperToken(): Promise<string> {
  await using session = await Session.get();

  session.appleMusicDeveloperToken ??= await new SignJWT()
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuedAt()
    .setIssuer(teamId)
    .setExpirationTime('26 weeks') // ~ 6 months
    .sign(privateKey);

  return session.appleMusicDeveloperToken;
}
