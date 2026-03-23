import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { trackEvent } from '../services/analyticsService'
import { fetchProperties, isPropertyPublicListing } from '../services/propertiesService'
import type { Property, PropertyStatus } from '../data/properties'
import { parsePesoAmount } from '../data/deals'
import PropertyCard from '../components/PropertyCard'
import './Properties.css'

/** Public listing: exclude archived; "all" status omits draft/cancelled/archived for a sensible browse. */
const CLIENT_STATUS_OPTIONS: Array<{ value: PropertyStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All listings' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'under_negotiation', label: 'Under Negotiation' },
  { value: 'processing_docs', label: 'Processing Docs' },
  { value: 'sold', label: 'Sold' },
]

type SortOption = 'newest' | 'price-asc' | 'price-desc'

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('q') ?? ''
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [typeFilter, setTypeFilter] = useState<'all' | 'Condo' | 'House' | 'Lot' | 'Commercial'>('all')
  /** Default "All listings" so the browse page shows every public-eligible property (not only Available). */
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const properties = fetchProperties()

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setSearch(q)
  }, [searchParams])

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 120)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!loading) trackEvent('page_view', { page: 'properties' })
  }, [loading])

  const filteredSorted = useMemo(() => {
    let list: Property[] = properties.filter((p) => isPropertyPublicListing(p))

    if (statusFilter === 'all') {
      list = list.filter((p) => !['cancelled'].includes(p.status))
    } else {
      list = list.filter((p) => p.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      list = list.filter((p) => p.type === typeFilter)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((p) => `${p.title} ${p.location} ${p.type}`.toLowerCase().includes(q))
    }

    const minN = priceMin.trim() ? parsePesoAmount(priceMin) : null
    const maxN = priceMax.trim() ? parsePesoAmount(priceMax) : null
    if (minN != null || maxN != null) {
      list = list.filter((p) => {
        const n = parsePesoAmount(p.price)
        if (n == null) return false
        if (minN != null && n < minN) return false
        if (maxN != null && n > maxN) return false
        return true
      })
    }

    const sorted = [...list]
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else if (sortBy === 'price-asc') {
      sorted.sort((a, b) => {
        const na = parsePesoAmount(a.price) ?? 0
        const nb = parsePesoAmount(b.price) ?? 0
        return na - nb
      })
    } else {
      sorted.sort((a, b) => {
        const na = parsePesoAmount(a.price) ?? 0
        const nb = parsePesoAmount(b.price) ?? 0
        return nb - na
      })
    }

    return sorted
  }, [properties, typeFilter, search, statusFilter, priceMin, priceMax, sortBy])

  const syncQueryToUrl = (nextSearch: string) => {
    const params = new URLSearchParams(searchParams)
    if (nextSearch.trim()) params.set('q', nextSearch.trim())
    else params.delete('q')
    setSearchParams(params, { replace: true })
  }

  if (loading) {
    return (
      <div className="properties-page">
        <div className="container section">
          <p className="client-page-loading">Loading properties…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="properties-page">
      <section className="page-hero">
        <div className="container">
          <h1 className="page-title">Properties</h1>
          <p className="page-subtitle">Houses and lots for sale. Browse listings and filter to match what you need.</p>
          <div className="properties-filters">
            <input
              type="search"
              className="properties-filter-input"
              placeholder="Search by title, location, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => syncQueryToUrl(search)}
              onKeyDown={(e) => e.key === 'Enter' && syncQueryToUrl(search)}
              aria-label="Search properties"
            />
            <select
              className="properties-filter-input"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'Condo' | 'House' | 'Lot' | 'Commercial')}
              aria-label="Filter property type"
            >
              <option value="all">All types</option>
              <option value="Condo">Condo</option>
              <option value="House">House</option>
              <option value="Lot">Lot</option>
              <option value="Commercial">Commercial</option>
            </select>
            <select
              className="properties-filter-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | 'all')}
              aria-label="Filter status"
            >
              {CLIENT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <input
              type="text"
              className="properties-filter-input properties-filter-input--narrow"
              placeholder="Min price (e.g. 1000000)"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              aria-label="Minimum price"
            />
            <input
              type="text"
              className="properties-filter-input properties-filter-input--narrow"
              placeholder="Max price (e.g. 5000000)"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              aria-label="Maximum price"
            />
            <select
              className="properties-filter-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort properties"
            >
              <option value="newest">Newest updated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>
      </section>
      <section className="properties-list section">
        <div className="container">
          {filteredSorted.length === 0 ? (
            <p className="properties-empty">No properties match your search. Try adjusting filters.</p>
          ) : (
            <div className="property-grid property-grid--browse" role="list">
              {filteredSorted.map((p) => (
                <div key={p.id} className="property-grid__cell" role="listitem">
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
