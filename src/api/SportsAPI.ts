import axios, { AxiosInstance } from 'axios'
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

      const response = await espnAPI.get<SportsResponse<NFLTeam>>('/teams')
      const sports = response.data.sports

      const nflTeams = sports.reduce<NFLTeam[]>((acc, cur) => {
        if (cur.leagues && cur.leagues.length > 0) {
          const nfl = cur.leagues.find(league => league.slug === 'nfl')
          if (nfl) {
            acc.push(...nfl.teams)
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

  async getPlayers (teamIDs: string[]) {

  }
}

const espnAPI = axios.create({
  baseURL: 'http://site.api.espn.com/apis/site/v2/sports/football/nfl'
})
