import { SportsAPI } from '../api/SportsAPI'
import { aggregateColleges } from './NFLCollege'
import mockRosters from '../mockData/mock-athlete-data.json'
import axios from 'axios'

describe('NFLCollege tests', () => {
  const espnAPI = new SportsAPI('http://site.api.espn.com/apis/site/v2/sports/football/nfl')
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

  it('should return an empty array given an empty array', async () => {
    const results = await aggregateColleges([])

    expect(results).toEqual([])
  })

  it('should return the top colleges for a given team roster', async () => {
    const athletes = await espnAPI.getAthletes(['22'])
    expect(athletes.length).toBe(53)

    const colleges = await aggregateColleges(athletes)
    const areCollegesSorted = colleges.every((college, index, arr) => {
      if (index === 0) return true
      return college.athletes.length <= arr[index - 1].athletes.length
    })

    expect(areCollegesSorted).toBeTruthy()
    expect(colleges.length).toBe(37)
  })
})
