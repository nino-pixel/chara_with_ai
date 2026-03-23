import { setPropertyStore } from '../data/properties'

/** When a deal reaches Closed, mark the listing as sold (Cancelled does not change property). */
export function syncPropertyWhenDealStatusChanges(
  propertyId: string | null | undefined,
  previousStatus: string | undefined,
  nextStatus: string | undefined
) {
  if (!propertyId) return
  if (nextStatus !== 'Closed') return
  if (previousStatus === 'Closed') return
  const today = new Date().toISOString().slice(0, 10)
  setPropertyStore((prev) =>
    prev.map((p) => (p.id === propertyId ? { ...p, status: 'sold', updatedAt: today } : p))
  )
}
