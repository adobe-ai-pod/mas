/**
 * Rewrites AEM-authored asset URLs (aem.live/aem.page) to origin-relative
 * paths when the page itself is served from an Adobe production/stage host,
 * so the browser requests the asset through that host's CDN instead of the
 * authoring origin. Every other input (relative paths, DAM/third-party
 * hosts, malformed values) is returned unchanged.
 *
 * JSON-LD image URLs (src/json-ld.js) deliberately do not use this helper:
 * schema.org image values must remain absolute.
 */

export const AEM_ORIGIN_HOST_SUFFIXES = ['.aem.live', '.aem.page'];

// Mutable on purpose: it is the seam browser tests use to register their own
// (localhost) origin and exercise the rewrite without stubbing this module.
export const ADOBE_ORIGIN_HOSTS = new Set(['www.adobe.com', 'stage.adobe.com']);

const ABSOLUTE_OR_PROTOCOL_RELATIVE = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;

function isAemAuthoringHost(hostname) {
    return AEM_ORIGIN_HOST_SUFFIXES.some(
        (suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix),
    );
}

export function normalizeImageUrl(value, hostname = window.location.hostname) {
    if (!value || typeof value !== 'string') return value;
    if (!ABSOLUTE_OR_PROTOCOL_RELATIVE.test(value)) return value;
    if (!ADOBE_ORIGIN_HOSTS.has(hostname)) return value;
    let url;
    try {
        url = new URL(value, window.location.href);
    } catch {
        return value;
    }
    if (!isAemAuthoringHost(url.hostname)) return value;
    return `${url.pathname}${url.search}${url.hash}`;
}
