import type { Property } from './properties'
import type { InquiryRecord } from './mockAdmin'
import type { ClientRecord, ClientTransactionRow } from './clientsData'
import type { ActivityLogEntry } from './activityLog'
import { hydrateSimulationFromStorage, registerSimulationSnapshotGetters } from './simulationSnapshot'
import { getPropertyStore, setPropertyStore } from './properties'
import { getInquiryStore, setInquiryStore } from './mockAdmin'
import {
  getClientStore,
  setClientStore,
  getTransactionsStoreSnapshot,
  replaceTransactionsStore,
} from './clientsData'
import { getActivityStore, setActivityStore } from './activityLog'
import { rebalanceAllClientDealsCounts } from './clientsData'

/**
 * Call once at app startup (before render). Loads unified localStorage snapshot into all stores.
 */
export function initSimulationPersistence() {
  hydrateSimulationFromStorage({
    setProperties: (list) => setPropertyStore(() => list as Property[]),
    setInquiries: (list) => setInquiryStore(() => list as InquiryRecord[]),
    setClients: (list) => setClientStore(() => list as ClientRecord[]),
    setTransactionsByClient: (map) => replaceTransactionsStore(map as Record<string, ClientTransactionRow[]>),
    setActivity: (list) => setActivityStore(() => list as ActivityLogEntry[]),
  })

  rebalanceAllClientDealsCounts()

  registerSimulationSnapshotGetters({
    properties: () => getPropertyStore() as unknown[],
    inquiries: () => getInquiryStore() as unknown[],
    clients: () => getClientStore() as unknown[],
    transactionsByClient: () => getTransactionsStoreSnapshot() as unknown as Record<string, unknown[]>,
    activity: () => getActivityStore() as unknown[],
  })
}
