interface League<T> {
  id: string,
  uid: string
  name: string
  abbreviation: string
  slug: string
  teams: T[]
}

interface Sport<T> {
  id: string
  uid: string
  name: string
  slug: string
  leagues: League<T>[]
}

export interface SportsResponse<T> {
  sports: Sport<T>[]
}
