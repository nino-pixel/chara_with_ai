import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { syncMarketingAttributionFromLocation } from '../utils/marketingAttribution'

/** Keeps sessionStorage UTM/fbclid in sync with the address bar on every navigation. */
export default function MarketingAttributionSync() {
  const location = useLocation()
  useEffect(() => {
    syncMarketingAttributionFromLocation(location.search)
  }, [location.pathname, location.search])
  return null
}
