import { Session } from "@/lib/session";
import { IAuthCallback } from "../interface";

export class AppleMusicAuthCallback implements IAuthCallback { 
  async callback(req: Request): Promise<void> {
    console.log('start apple music auth callback');

    const url = new URL(req.url); 
    const musicUserToken = url.searchParams.get('mut');
    const developerToken = url.searchParams.get('dt');

    await using session = await Session.get();
    session.appleMusicUserToken = musicUserToken;
    session.appleMusicDeveloperToken = developerToken;

    console.log('end apple music auth callback');
  }
};