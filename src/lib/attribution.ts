// First-party attribution capture: UTMs, click IDs, Meta parameters, device and page data.
// First-touch is written once and never overwritten; last-touch updates on every campaign visit.

const STORAGE_KEY = "bscalex_attribution";

const TOUCH_KEYS = ["source", "medium", "campaign", "content", "term"] as const;

const KNOWN_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "campaign_id", "adset_id", "ad_id", "campaign_name", "adset_name", "ad_name",
  "placement", "publisher_platform", "site_source_name",
  "fbclid", "gclid", "wbraid", "gbraid", "msclkid",
  // legacy parameters kept for older ad links
  "utm_adset", "utm_ad", "utm_placement", "utm_device",
];

type Touch = Record<(typeof TOUCH_KEYS)[number], string>;

export type AttributionStore = {
  firstTouch: Touch;
  lastTouch: Touch;
  firstParams: Record<string, string>;
  lastParams: Record<string, string>;
  landingPageUrl: string;
  firstPageUrl: string;
  lastPageUrl: string;
  referrer: string;
  firstVisitAt: string;
};

const clip = (value: string | null | undefined, max = 500) => (value ?? "").toString().slice(0, max);

function emptyTouch(): Touch {
  return { source: "", medium: "", campaign: "", content: "", term: "" };
}

function readParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const collected: Record<string, string> = {};
  params.forEach((value, key) => {
    const clean = clip(value, 300);
    // Meta leaves unresolved macros like {{campaign.name}} — treat those as empty.
    if (!clean || /^\{\{.*\}\}$/.test(clean)) return;
    collected[key.toLowerCase().slice(0, 60)] = clean;
  });
  return collected;
}

function touchFrom(params: Record<string, string>): Touch {
  return {
    source: params["utm_source"] ?? "",
    medium: params["utm_medium"] ?? "",
    campaign: params["utm_campaign"] ?? "",
    content: params["utm_content"] ?? params["utm_ad"] ?? "",
    term: params["utm_term"] ?? "",
  };
}

function hasTouch(touch: Touch) {
  return TOUCH_KEYS.some((key) => touch[key]);
}

function read(): AttributionStore | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AttributionStore) : null;
  } catch {
    return null;
  }
}

function write(store: AttributionStore) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — attribution falls back to the current URL */
  }
}

/** Call once per page load. Preserves first-touch, refreshes last-touch and page trail. */
export function captureAttribution(): AttributionStore | null {
  if (typeof window === "undefined") return null;
  const params = readParams();
  const touch = touchFrom(params);
  const now = new Date().toISOString();
  const pageUrl = clip(window.location.href);
  const referrer = clip(document.referrer);
  const existing = read();

  if (!existing) {
    const store: AttributionStore = {
      firstTouch: touch,
      lastTouch: touch,
      firstParams: params,
      lastParams: params,
      landingPageUrl: pageUrl,
      firstPageUrl: pageUrl,
      lastPageUrl: pageUrl,
      referrer,
      firstVisitAt: now,
    };
    write(store);
    return store;
  }

  const updated: AttributionStore = {
    ...existing,
    firstTouch: hasTouch(existing.firstTouch ?? emptyTouch()) ? existing.firstTouch : touch,
    firstParams: Object.keys(existing.firstParams ?? {}).length ? existing.firstParams : params,
    lastTouch: hasTouch(touch) ? touch : existing.lastTouch ?? emptyTouch(),
    lastParams: Object.keys(params).length ? params : existing.lastParams ?? {},
    lastPageUrl: pageUrl,
    referrer: existing.referrer || referrer,
  };
  write(updated);
  return updated;
}

function deviceInfo() {
  const ua = navigator.userAgent;
  const isTablet = /iPad|Tablet|Nexus 7|Nexus 10|Silk|Kindle/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const isMobile = !isTablet && /Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua);
  const os = /Windows/i.test(ua) ? "Windows"
    : /iPhone|iPad|iPod/i.test(ua) ? "iOS"
    : /Android/i.test(ua) ? "Android"
    : /Mac OS X/i.test(ua) ? "macOS"
    : /Linux/i.test(ua) ? "Linux" : "Other";
  const browserMatch = /(Edg|OPR|Chrome|Firefox|Safari)\/([\d.]+)/.exec(ua);
  const browserNames: Record<string, string> = { Edg: "Edge", OPR: "Opera", Chrome: "Chrome", Firefox: "Firefox", Safari: "Safari" };
  const engine = browserMatch?.[1] ?? "";
  const browser = engine ? `${browserNames[engine] ?? engine} ${browserMatch?.[2]?.split(".")[0] ?? ""}`.trim() : "Other";
  let timeZone = "";
  try { timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ""; } catch { timeZone = ""; }
  return {
    deviceType: isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop",
    operatingSystem: os,
    browser,
    screenResolution: `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`,
    deviceLanguage: clip(navigator.language, 20),
    timeZone: clip(timeZone, 80),
    userAgent: clip(ua, 500),
  };
}

export type AttributionPayload = ReturnType<typeof getAttributionPayload>;

/** Flattened attribution + device + page snapshot sent with a lead. */
export function getAttributionPayload() {
  const empty = {
    firstTouch: emptyTouch(), lastTouch: emptyTouch(),
    firstParams: {} as Record<string, string>, lastParams: {} as Record<string, string>,
    landingPageUrl: "", firstPageUrl: "", lastPageUrl: "", referrer: "", firstVisitAt: "",
  };
  if (typeof window === "undefined") return { ...empty, pageUrl: "", pageTitle: "", metaAttribution: {}, extraParams: {}, clickIds: {}, device: null as null | ReturnType<typeof deviceInfo> };

  const store = captureAttribution() ?? empty;
  const params = { ...(store.firstParams ?? {}), ...(store.lastParams ?? {}) };
  const pick = (...keys: string[]) => keys.map((key) => params[key]).find((value) => value) ?? "";

  const metaAttribution = {
    campaignName: pick("campaign_name", "utm_campaign"),
    campaignId: pick("campaign_id"),
    adsetName: pick("adset_name", "utm_adset"),
    adsetId: pick("adset_id"),
    adName: pick("ad_name", "utm_content", "utm_ad"),
    adId: pick("ad_id"),
    placement: pick("placement", "utm_placement"),
    publisherPlatform: pick("publisher_platform"),
    siteSourceName: pick("site_source_name"),
  };
  const clickIds = {
    fbclid: pick("fbclid"), gclid: pick("gclid"), wbraid: pick("wbraid"),
    gbraid: pick("gbraid"), msclkid: pick("msclkid"),
  };
  const extraParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (!KNOWN_PARAMS.includes(key)) extraParams[key] = value;
  });

  return {
    firstTouch: store.firstTouch ?? emptyTouch(),
    lastTouch: store.lastTouch ?? emptyTouch(),
    firstParams: store.firstParams ?? {},
    lastParams: store.lastParams ?? {},
    landingPageUrl: store.landingPageUrl ?? "",
    firstPageUrl: store.firstPageUrl ?? "",
    lastPageUrl: clip(window.location.href),
    referrer: store.referrer ?? "",
    firstVisitAt: store.firstVisitAt ?? "",
    pageUrl: clip(window.location.href),
    pageTitle: clip(document.title, 200),
    metaAttribution,
    clickIds,
    extraParams,
    device: deviceInfo(),
  };
}
