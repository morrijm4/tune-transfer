import { EncryptJWT, base64url, jwtDecrypt, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

type SessionData = JWTPayload & Payload;

type Payload = {
  done?: boolean;
  spotify?: SpotifySession;
  appleMusicDeveloperToken?: string;
  appleMusicUserToken?: string;
};

type SpotifySession = {
  accessToken: string;
  refreshToken: string;
};

export class Session {
  static #instance?: Session;
  static #decodedSecret?: Uint8Array;

  #data: SessionData;
  #dirty: boolean;

  private constructor(data: SessionData, dirty: boolean) {
    this.#data = data;
    this.#dirty = dirty;
  }

  static async get(): Promise<Session> {
    try {
      const cookieJar = cookies();
      const session = cookieJar.get('session');

      if (!session?.value) {
        throw new Error();
      }

      try {
        const { payload } = await jwtDecrypt(session?.value, this.#getSecret());
        this.#instance = new Session(payload, false);
      } catch {
        cookieJar.delete('session');
        this.#instance = new Session({}, false);
      }
    } catch {
      this.#instance = new Session({}, false);
    }

    return this.#instance;
  }

  async save(): Promise<void> {
    if (!this.#dirty) {
      return;
    }

    const cookieJar = cookies();
    const token = await new EncryptJWT(this.#data)
      .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
      .setIssuedAt()
      .setIssuer(process.env.JWT_ISSUER!)
      .setExpirationTime('1d')
      .encrypt(Session.#getSecret());

    const isSecure = process.env.NODE_ENV === 'production';
    cookieJar.set('session', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      maxAge: 60 * 60 * 24,
    });
    this.#dirty = false;
  }

  static #getSecret(): Uint8Array {
    if (!this.#decodedSecret) {
      this.#decodedSecret = base64url.decode(process.env.JWT_SECRET!);
    }
    return this.#decodedSecret;
  }

  async [Symbol.asyncDispose](): Promise<void> {
    await this.save();
  }

  print(msg?: string): void {
    msg ??= 'Session:';
    console.log(msg, this.#data);
  }

  get spotify(): SpotifySession | undefined {
    return this.#data.spotify;
  }

  set spotify(service: SpotifySession) {
    this.#data.spotify = service;
    this.#dirty = true;
  }

  get appleMusicDeveloperToken(): string | undefined {
    return this.#data.appleMusicDeveloperToken;
  }

  set appleMusicDeveloperToken(token: string | undefined | null) {
    this.#data.appleMusicDeveloperToken = token ?? undefined;
    this.#dirty = true;
  }

  get appleMusicUserToken(): string | undefined {
    return this.#data.appleMusicUserToken;
  }

  set appleMusicUserToken(token: string | undefined | null) {
    this.#data.appleMusicUserToken = token ?? undefined;
    this.#dirty = true;
  }

  get done(): boolean {
    return this.#data.done ?? false;
  }

  set done(done: boolean) {
    this.#data.done = done;
    this.#dirty = true;
  }
}
