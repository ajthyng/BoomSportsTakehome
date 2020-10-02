import axios, { AxiosInstance } from 'axios'
import pMap from 'p-map'
import { Athlete, NFLTeamRoster } from '../types/nfl-roster.type'
import { NFLTeam } from '../types/nfl-team.type'
import { SportsResponse } from '../types/sports-response.type'
import { timeValue } from '../utils/Helpers'
import { InMemoryCache } from '../utils/InMemoryCache'
import { Logger } from '../utils/Logger'

export class SportsAPI {
  private api: AxiosInstance
  private readonly logger: Logger
  private readonly cache: InMemoryCache
  private readonly teamsCacheKey = 'football-teams'
  private readonly rosterCacheKey = (teamID: string) => `roster:${teamID}`

  constructor (baseURL: string) {
    this.api = axios.create({
      baseURL
    })
    this.logger = new Logger()
    this.cache = new InMemoryCache()
    this.getTeams = this.getTeams.bind(this)
  }

  async getTeams () {
    try {
      const cachedResponse = await this.cache.getValue<NFLTeam[]>(this.teamsCacheKey)

      if (cachedResponse) {
        return cachedResponse
      }

      const response = await espnAPI.get<SportsResponse<{ team: NFLTeam}>>('/teams')
      const sports = response.data.sports

      const nflTeams = sports.reduce<NFLTeam[]>((acc, cur) => {
        if (cur.leagues && cur.leagues.length > 0) {
          const nfl = cur.leagues.find(league => league.slug === 'nfl')
          if (nfl) {
            acc.push(...nfl.teams.map(entry => entry.team))
          }
        }
        return acc
      }, [])

      this.cache.setValue(this.teamsCacheKey, nflTeams, timeValue(24, 'hours').to('ms'))
      return nflTeams
    } catch (err) {
      this.logger.log(err.message)
      return []
    }
  }

  async getAthletes (teamIDs: string[]) {
    const getRoster = async (teamID: string) => {
      try {
        const cacheKey = this.rosterCacheKey(teamID)
        const cachedResponse = await this.cache.getValue<Athlete[]>(cacheKey)
        if (cachedResponse) return cachedResponse

        const response = await this.api.get<NFLTeamRoster>(`/teams/${teamID}/roster`)

        const athletes = response.data.athletes.flatMap(({ items }) => items)
        await this.cache.setValue(cacheKey, athletes, timeValue(24, 'hours').to('ms'))

        return athletes
      } catch (err) {
        this.logger.log(err.message)
        return []
      }
    }

    const athletes = await pMap(teamIDs, getRoster, { concurrency: 13 })

    return athletes.flat()
  }
}

const espnAPI = axios.create({
  baseURL: 'http://site.api.espn.com/apis/site/v2/sports/football/nfl'
})
