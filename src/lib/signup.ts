import { INDEX_SIGNUP_ENDPOINT } from './site';

/**
 * Shared submit logic for the two email captures: the Index "Notify me" form
 * and the "Verify a pull request" modal. Both post to the same Loops hosted
 * newsletter endpoint and are told apart by userGroup.
 *
 * The request shape mirrors what Loops' own generated script sends, so the
 * endpoint sees exactly what it expects: a urlencoded POST carrying
 * userGroup, an empty mailingLists, and the address.
 */

const RATE_LIMIT_KEY = 'loops-form-timestamp';
const RATE_LIMIT_MS = 60_000;

export type SignupResult =
  | { ok: true }
  | { ok: false; message: string; rateLimited?: boolean };

/** Loops' own guard: one submit per minute per browser. */
function rateLimited(): boolean {
  try {
    const last = window.localStorage.getItem(RATE_LIMIT_KEY);
    if (!last) return false;
    return Date.now() - Number(last) < RATE_LIMIT_MS;
  } catch {
    // Private mode or blocked storage: let the submit through rather than
    // locking the reader out of the form entirely.
    return false;
  }
}

function stampAttempt(): void {
  try {
    window.localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    /* nothing we can do, and nothing that should block the submit */
  }
}

function clearStamp(): void {
  try {
    window.localStorage.setItem(RATE_LIMIT_KEY, '');
  } catch {
    /* as above */
  }
}

export async function submitSignup(
  email: string,
  userGroup: string,
): Promise<SignupResult> {
  if (rateLimited()) {
    return {
      ok: false,
      rateLimited: true,
      message: 'Too many signups, please try again shortly.',
    };
  }

  // Stamp before the request, and clear it again if the request fails, so a
  // failed attempt does not cost the reader a minute before retrying.
  stampAttempt();

  const body = `userGroup=${encodeURIComponent(userGroup)}&mailingLists=&email=${encodeURIComponent(email)}`;

  try {
    const res = await fetch(INDEX_SIGNUP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (res.ok) return { ok: true };

    clearStamp();

    // Loops returns a JSON body with a message on most failures, but not all,
    // so fall back to the status text.
    let message = res.statusText || 'Something went wrong, please try again.';
    try {
      const data = await res.json();
      if (data && typeof data.message === 'string' && data.message) {
        message = data.message;
      }
    } catch {
      /* not JSON; keep the status text */
    }

    return { ok: false, message };
  } catch (error) {
    clearStamp();

    const message =
      error instanceof Error && error.message.includes('Failed to fetch')
        ? 'Too many signups, please try again shortly.'
        : 'Something went wrong, please try again.';

    return { ok: false, message };
  }
}
