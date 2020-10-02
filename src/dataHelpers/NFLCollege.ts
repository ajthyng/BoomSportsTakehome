import { Athlete } from '../types/nfl-roster.type'
import { memoize } from '../utils/Helpers'
import { InMemoryCache } from '../utils/InMemoryCache'

interface CollegeAggregate {
  college: Athlete['college']
  athletes: Athlete[]
}

const _aggregateColleges = (athletes: Athlete[]) => {
  const colleges = athletes.reduce<Record<string, CollegeAggregate>>((acc, athlete) => {
    if (!athlete.college || !athlete.college.id) return acc

    if (acc[athlete.college.id]) {
      acc[athlete.college.id].athletes.push(athlete)
    } else {
      acc[athlete.college.id] = {
        college: athlete.college,
        athletes: [athlete]
      }
    }
    return acc
  }, {})
  return Object.values(colleges).sort((a, b) => {
    return b.athletes.length - a.athletes.length
  })
}

export const aggregateColleges = memoize(_aggregateColleges, new InMemoryCache())
