import { EncryptJWT, base64url, jwtDecrypt, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

type SessionData = JWTPayload & Payload;

type Payload = {
  spotify?: Service;
};

type Service = {
  accessToken: string;
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
    if (!this.#instance) {
      const cookieJar = cookies();
      const session = cookieJar.get('session');

      let data: SessionData = {};
      if (session?.value) {
        try {
          const secret = this.#getSecret();
          const { payload } = await jwtDecrypt(session.value, secret, {
            issuer: process.env.JWT_ISSUER,
          });
          data = payload;
        } catch (err) {
          console.error('Failed to parse session', err);
        }
      }

      this.#instance = new Session(data, false);
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

  print(): void {
    console.log('Session:', this.#data);
  }

  get spotify(): Service | undefined {
    return this.#data.spotify;
  }

  set spotify(service: Service) {
    this.#data.spotify = service;
    this.#dirty = true;
  }
}
