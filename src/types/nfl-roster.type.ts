import { NFLTeam } from './nfl-team.type'

/**
 * Mostly generated with http://www.json2ts.com/ using response
 * from site.api.espn.com
 */
export interface Season {
  year: number
  type: number
  name: string
}

export interface Coach {
  id: string
  firstName: string
  lastName: string
  experience: number
}

export interface Link {
  language: string
  rel: string[]
  href: string
  text: string
  shortText: string
  isExternal: boolean
  isPremium: boolean
}

export interface BirthPlace {
  city: string
  state: string
  country: string
}

export interface College {
  id: string
  mascot: string
  name: string
  shortName: string
  abbrev: string
}

export interface Headshot {
  href: string
  alt: string
}

export interface ParentPosition {
  id: string
  name: string
  displayName: string
  abbreviation: string
  leaf: boolean
}

export interface Position {
  id: string
  name: string
  displayName: string
  abbreviation: string
  leaf: boolean
  parent: ParentPosition
}

export interface Injury {
  status: string
  date: string
}

export interface Team {
  $ref: string
}

export interface Experience {
  years: number
}

export interface Status {
  id: string
  name: string
  type: string
  abbreviation: string
}

export interface Hand {
  type: string
  abbreviation: string
  displayValue: string
}

export interface Athlete {
  id: string
  uid: string
  guid: string
  alternateIds: { sdr: string }
  firstName: string
  lastName: string
  fullName: string
  displayName: string
  shortName: string
  weight: number
  displayWeight: string
  height: number
  displayHeight: string
  age: number
  dateOfBirth: string
  debutYear: number
  links: Link[]
  birthPlace: BirthPlace
  college: College
  slug: string
  headshot: Headshot
  jersey: string
  position: Position
  injuries: Injury[]
  teams: Team[]
  contracts: any[]
  experience: Experience
  status: Status
  hand: Hand
}

export interface AthleteGroup {
  position: string
  items: Athlete[]
}

export interface Groups {
  $ref: string
}

export interface NFLTeamSummary extends NFLTeam {
  logo: string
}

export interface NFLTeamRoster {
  timestamp: Date
  status: string
  season: Season
  coach: Coach[]
  athletes: AthleteGroup[]
  team: NFLTeamSummary
}
