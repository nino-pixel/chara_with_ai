const STORAGE_KEY = 'chara_marketing_attribution_v1'

export type MarketingAttribution = {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
}

function empty(): MarketingAttribution {
  return { utm_source: null, utm_medium: null, utm_campaign: null }
}

function readSession(): MarketingAttribution | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as Partial<MarketingAttribution>
    return {
      utm_source: typeof o.utm_source === 'string' ? o.utm_source : null,
      utm_medium: typeof o.utm_medium === 'string' ? o.utm_medium : null,
      utm_campaign: typeof o.utm_campaign === 'string' ? o.utm_campaign : null,
    }
  } catch {
    return null
  }
}

function writeSession(a: MarketingAttribution) {
  if (typeof window === 'undefined') return
  if (!a.utm_source && !a.utm_medium && !a.utm_campaign) return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(a))
}

/** Parse UTM + Facebook click id from a query string (leading ? optional). */
export function parseMarketingFromSearch(search: string): MarketingAttribution {
  const q = search.startsWith('?') ? search.slice(1) : search
  const sp = new URLSearchParams(q)
  const utm_source = sp.get('utm_source')?.trim() || null
  const utm_medium = sp.get('utm_medium')?.trim() || null
  const utm_campaign = sp.get('utm_campaign')?.trim() || null
  const fbclid = sp.get('fbclid')?.trim()
  return {
    utm_source: utm_source || (fbclid ? 'facebook' : null),
    utm_medium: utm_medium || (fbclid ? 'paid_social' : null),
    utm_campaign,
  }
}

/**
 * Call on each route change. When the URL carries UTM or fbclid, merge into sessionStorage
 * so attribution survives in-app navigation without query params.
 */
export function syncMarketingAttributionFromLocation(search: string) {
  const fromUrl = parseMarketingFromSearch(search)
  if (!fromUrl.utm_source && !fromUrl.utm_medium && !fromUrl.utm_campaign) return
  const prev = readSession()
  writeSession({
    utm_source: fromUrl.utm_source ?? prev?.utm_source ?? null,
    utm_medium: fromUrl.utm_medium ?? prev?.utm_medium ?? null,
    utm_campaign: fromUrl.utm_campaign ?? prev?.utm_campaign ?? null,
  })
}

/** Current URL wins per field; then session (first landing in this tab). */
export function getMarketingAttribution(): MarketingAttribution {
  if (typeof window === 'undefined') return empty()
  const fromUrl = parseMarketingFromSearch(window.location.search)
  const prev = readSession()
  return {
    utm_source: fromUrl.utm_source ?? prev?.utm_source ?? null,
    utm_medium: fromUrl.utm_medium ?? prev?.utm_medium ?? null,
    utm_campaign: fromUrl.utm_campaign ?? prev?.utm_campaign ?? null,
  }
}

/**
 * For `navigate()` / programmatic routing: merge optional query params with current marketing UTM.
 */
export function buildPublicPath(pathname: string, baseParams?: URLSearchParams): string {
  const p = baseParams ? new URLSearchParams(baseParams.toString()) : new URLSearchParams()
  const m = getMarketingAttribution()
  if (m.utm_source) p.set('utm_source', m.utm_source)
  if (m.utm_medium) p.set('utm_medium', m.utm_medium)
  if (m.utm_campaign) p.set('utm_campaign', m.utm_campaign)
  const qs = p.toString()
  return qs ? `${pathname}?${qs}` : pathname
}
