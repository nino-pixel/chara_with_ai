import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMarketingLinkTo } from '../hooks/useMarketingLinkTo'
import PropertyCard from '../components/PropertyCard'
import { setSavedPropertyIds } from '../data/savedPropertiesStorage'
import { useSavedPropertyIds } from '../hooks/useSavedProperties'
import { fetchProperties, isPropertyPublicListing, type Property } from '../services/propertiesService'
import './SavedProperties.css'

export default function SavedProperties() {
  const propertiesTo = useMarketingLinkTo('/properties')
  const savedIds = useSavedPropertyIds()

  // Drop unknown / non-public IDs when visiting this page (keeps localStorage tidy)
  useEffect(() => {
    const all = fetchProperties()
    const byId = new Map(all.map((p) => [p.id, p]))
    const pruned = savedIds.filter((id) => {
      const p = byId.get(id)
      return p != null && isPropertyPublicListing(p)
    })
    if (pruned.length === savedIds.length) return
    setSavedPropertyIds(pruned)
  }, [savedIds])

  const savedProperties = useMemo(() => {
    const all = fetchProperties()
    const byId = new Map(all.map((p) => [p.id, p]))
    const list: Property[] = []
    for (const id of savedIds) {
      const p = byId.get(id)
      if (p && isPropertyPublicListing(p)) list.push(p)
    }
    return list
  }, [savedIds])

  return (
    <div className="saved-properties-page section">
      <div className="container">
        <header className="saved-properties-header">
          <h1 className="page-title">Saved properties</h1>
          <p className="page-subtitle saved-properties-subtitle">
            Properties you&apos;ve saved for later. Only active listings are shown.
          </p>
        </header>

        {savedProperties.length === 0 ? (
          <div className="saved-properties-empty">
            <p className="saved-properties-empty-text">You haven&apos;t saved any properties yet.</p>
            <Link to={propertiesTo} className="btn btn-primary">
              Browse properties
            </Link>
          </div>
        ) : (
          <ul className="saved-properties-grid">
            {savedProperties.map((p) => (
              <li key={p.id}>
                <PropertyCard property={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
