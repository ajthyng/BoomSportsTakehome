import axios from 'axios'
import { mocked } from 'ts-jest/utils'
import mockTeams from './mockData/mock-teams-data.json'
import mockRosters from './mockData/mock-athlete-data.json'
import { Logger } from '../utils/Logger'
import { SportsAPI } from './SportsAPI'

jest.mock('../utils/Logger')

describe('Sports API Tests', () => {
  let espnAPI: SportsAPI

  beforeEach(() => {
    mocked(Logger).mockClear()
    espnAPI = new SportsAPI('http://site.api.espn.com/apis/site/v2/sports/football/nfl')
  })

  describe('getTeams tests', () => {
    it('should return empty array on errors and log error', async () => {
      axios.get = jest.fn().mockImplementationOnce(() => Promise.reject(new Error('Arbitrary Error')))
      const data = await espnAPI.getTeams()

      expect(data).toStrictEqual([])
      expect(mocked(Logger).mock.instances[0].log).toBeCalledWith('Arbitrary Error')
    })

    it('should parse a currently valid response from espn', async () => {
      axios.get = jest.fn().mockImplementationOnce(() => Promise.resolve({ data: mockTeams }))
      const nflTeams = await espnAPI.getTeams()

      expect(nflTeams.length).toEqual(25)
    })

    it('should return an empty array on unexpected espon results', async () => {
    // Generated from https://www.json-generator.com/
      axios.get = jest.fn().mockImplementationOnce(() => Promise.resolve({
        data: {
          _id: '5f748cb1e368a1d71526d841',
          index: 1,
          guid: '3e8b2f8f-a0bd-4a40-9170-7bc7ad759c32',
          isActive: false,
          balance: '$2,746.75',
          picture: 'http://placehold.it/32x32',
          age: 25,
          eyeColor: 'green',
          name: 'Saunders Fitzpatrick',
          gender: 'male',
          company: 'VITRICOMP',
          email: 'saundersfitzpatrick@vitricomp.com'
        }
      }))

      const nflTeams = await espnAPI.getTeams()

      expect(nflTeams.length).toBe(0)
      expect(mocked(Logger).mock.instances[0].log).toBeCalledTimes(1)
    })

    it('should cache a response', async () => {
      axios.get = jest.fn().mockImplementationOnce(() => Promise.resolve({ data: mockTeams }))

      const nflTeams = await espnAPI.getTeams()

      expect(nflTeams.length).toBe(25)
      expect(axios.get).toBeCalledTimes(1)

      axios.get = jest.fn().mockImplementationOnce(() => Promise.resolve({ data: [] }))
      const allegedlyCachedNflTeams = await espnAPI.getTeams()

      expect(allegedlyCachedNflTeams.length).toBe(25)
      expect(axios.get).toBeCalledTimes(0)
    })

    it('should return an empty array if it cannot find the nfl league', async () => {
      axios.get = jest.fn().mockImplementationOnce(() => Promise.resolve({
        data: {
          sports: [
            { leagues: [{ slug: 'cfl' }] }
          ]
        }
      }))

      const nflTeams = await espnAPI.getTeams()

      expect(nflTeams.length).toBe(0)
    })

    it('should return an empty array if leagues are missing', async () => {
      axios.get = jest.fn().mockImplementationOnce(() => Promise.resolve({
        data: {
          sports: [
            { abbreviation: 'nfl' }
          ]
        }
      }))

      const nflTeams = await espnAPI.getTeams()

      expect(nflTeams.length).toBe(0)
    })
  })

  describe('getAthletes tests', () => {
    beforeEach(() => {
      axios.get = jest.fn().mockImplementation((url: string) => {
        switch (url) {
          case '/teams/22/roster':
            return Promise.resolve({ data: mockRosters['22'] })
          case '/teams/1/roster':
            return Promise.resolve({ data: mockRosters['1'] })
          case '/teams/7/roster':
            return Promise.resolve({ data: mockRosters['7'] })
          default:
            return Promise.reject(new Error('Team not found'))
        }
      })
    })

    it('should return a flattened array of atheletes for given team IDs', async () => {
      const athletes = await espnAPI.getAthletes(['22', '7'])

      expect(athletes.length).toBe(106)
    })

    it('should return an empty array for missing teams', async () => {
      const athletes = await espnAPI.getAthletes(['45'])

      expect(mocked(Logger).mock.instances[0].log).toBeCalledWith('Team not found')
      expect(athletes).toStrictEqual([])
    })

    it('should return two complete rosters and one empty roster', async () => {
      const athletes = await espnAPI.getAthletes(['1', '7', '50'])

      expect(athletes.length).toBe(105)
    })

    it('should cache results to avoid passing load to espn', async () => {
      const athletes = await espnAPI.getAthletes(['1'])
      expect(athletes.length).toBe(52)

      await espnAPI.getAthletes(['1'])
      expect(axios.get).toHaveBeenCalledTimes(1)
    })
  })
})
