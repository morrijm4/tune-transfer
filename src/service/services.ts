export enum Services {
  Spotify = 'spotify',
  AppleMusic = 'apple-music',
}

export function assertService(service: string): asserts service is Services {
  if (!Object.values<string>(Services).includes(service))
    throw new Error('Invalid service');
}
