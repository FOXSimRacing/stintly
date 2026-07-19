export class IracingAuthError extends Error {}

export class IracingApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}
