import axios from 'axios'
import { mocked } from 'ts-jest/utils'
import mockData from './mockData/mock-teams-data.json'
import { Logger } from '../utils/Logger'
import { SportsAPI } from './SportsAPI'

jest.mock('../utils/Logger')

describe('Sports API Tests', () => {
  let espnAPI: SportsAPI

  beforeEach(() => {
    mocked(Logger).mockClear()
    espnAPI = new SportsAPI('http://site.api.espn.com/apis/site/v2/sports/football/nfl')
  })

  it('should return empty array on errors and log error', async () => {
    axios.get = jest.fn().mockImplementationOnce(() => Promise.reject(new Error('Arbitrary Error')))
    const data = await espnAPI.getTeams()

    expect(data).toStrictEqual([])
    expect(mocked(Logger).mock.instances[0].log).toBeCalledWith('Arbitrary Error')
  })

  it('should parse a currently valid response from espn', async () => {
    axios.get = jest.fn().mockImplementationOnce(() => Promise.resolve({ data: mockData }))
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
    axios.get = jest.fn().mockImplementationOnce(() => Promise.resolve({ data: mockData }))

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
