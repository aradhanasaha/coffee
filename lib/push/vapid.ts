/**
 * Web Push (VAPID) shared client config.
 *
 * The public VAPID key is NOT a secret — it is shipped to every browser as the
 * `applicationServerKey`. We read it from env so it lives in exactly one place
 * and can be rotated without code changes. A literal fallback keeps existing
 * subscriptions working if the env var is ever missing at build time.
 */

const FALLBACK_VAPID_PUBLIC_KEY =
    'BKntPVco71jin1umb6iMv8Ct8SDzt0kcq70TUT0W8ata_FXHUVTadyLiRH9vV4FJWatELUzzaLhIWEgr4z6flnY';

export const VAPID_PUBLIC_KEY =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || FALLBACK_VAPID_PUBLIC_KEY;

/**
 * Convert a base64url VAPID public key into the Uint8Array that
 * `PushManager.subscribe({ applicationServerKey })` expects.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = typeof window !== 'undefined' ? window.atob(base64) : atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
