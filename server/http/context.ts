export interface RouteContext {
  request: Request;
  url: URL;
  path: string;
  method: string;
  cookies: string[];
  respond: (data: unknown, status?: number) => Response;
}
