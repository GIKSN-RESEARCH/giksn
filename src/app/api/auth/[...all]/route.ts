import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const authHandler = auth.handler;

/**
 * Better Auth's internal endpoints (e.g. /sign-in/social, /sign-in/magic-link)
 * only declare support for application/json by default (unlike /sign-in/email which explicitly
 * allows form-urlencoded). Native <form method="post"> submissions send urlencoded.
 *
 * This thin wrapper transparently converts form posts to JSON requests so that plain HTML
 * forms (and any other form submissions) continue to work against all auth endpoints.
 */
async function handler(request: Request) {
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const formData = await request.formData();
        const jsonBody: Record<string, any> = {};
        for (const [key, value] of formData.entries()) {
          if (key in jsonBody) {
            const existing = jsonBody[key];
            if (Array.isArray(existing)) {
              existing.push(value);
            } else {
              jsonBody[key] = [existing, value];
            }
          } else {
            jsonBody[key] = value;
          }
        }

        const newHeaders = new Headers(request.headers);
        newHeaders.set('content-type', 'application/json');
        newHeaders.delete('content-length');

        const jsonRequest = new Request(request.url, {
          method: 'POST',
          headers: newHeaders,
          body: JSON.stringify(jsonBody),
        });

        return authHandler(jsonRequest);
      } catch {
        // Fall back to original request; Better Auth will produce a proper error
      }
    }
  }

  return authHandler(request);
}

export { handler as GET, handler as POST };