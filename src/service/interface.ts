export interface IAuthCallback {
  callback(req: Request): Promise<void>;
}
