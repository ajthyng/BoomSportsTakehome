import { memoize, sleep, timeValue } from './Helpers'
import { InMemoryCache } from './InMemoryCache'

describe('helper tests', () => {
  describe('time conversion tests', () => {
    it('should convert sec to ms', () => {
      expect(timeValue(5.33, 'sec').to('ms')).toEqual(5330)
    })

    it('should convert ms to days', () => {
      expect(timeValue(50000, 'ms').to('days').toFixed(9)).toEqual('0.000578704')
    })

    it('should convert minutes to ms', () => {
      expect(timeValue(5, 'min').to('ms')).toEqual(300000)
    })

    it('should convert days to ms', () => {
      expect(timeValue(15, 'days').to('ms')).toEqual(1_296_000_000)
    })

    it('should convert one day to ms', () => {
      expect(timeValue(1, 'day').to('ms')).toEqual(86_400_000)
    })

    it('should convert hours to ms', () => {
      expect(timeValue(2, 'hours').to('ms')).toEqual(7_200_000)
    })

    it('should return an object with a to key containing a function', () => {
      const convert = timeValue(1, 'sec')
      expect(convert).toHaveProperty('to')
      expect(typeof convert.to).toBe('function')
    })

    it('should treat default unit as ms', () => {
      expect(timeValue(1000).to('sec')).toBe(1)
    })
  })

  describe('sleep tests', () => {
    it('should wait for at least 100 ms', async () => {
      const start = new Date()
      await sleep(100)
      const end = new Date()
      expect(end.valueOf() - start.valueOf()).toBeGreaterThanOrEqual(100)
    })
  })

  describe('memoize tests', () => {
    it('should memoize the results of a function with multiple arguments', async () => {
      const add = jest.fn((a: number, b: number) => a + b)
      const memoizedAdd = memoize(add, new InMemoryCache())

      const result = await memoizedAdd(3, 4)
      const nextResult = await memoizedAdd(3, 4)

      expect(result).toBe(7)
      expect(nextResult).toBe(7)
      expect(add).toHaveBeenCalledTimes(1)
    })

    it('should memoize results of a function with complex arguments', async () => {
      type Auth = { username: string, password: string }
      const dependencyInjection = jest.fn(async <T extends (...args: any[]) => any> (api: T, auth: Auth, filterValues: string[]) => {
        const result = await api(auth)

        return result.filter((item: any) => filterValues.indexOf(item) >= 0)
      })

      const api = async (auth: Auth) => [auth.password, auth.username]
      const auth = { username: 'fake12345', password: 'password1!' }
      const filterValeus = ['password1!', 'password', 'llama47']
      const memoizedDI = memoize(dependencyInjection, new InMemoryCache())

      const result = await memoizedDI(api, auth, filterValeus)
      const nextResult = await memoizedDI(api, auth, filterValeus)

      expect(result).toEqual(['password1!'])
      expect(nextResult).toEqual(['password1!'])
      expect(dependencyInjection).toHaveBeenCalledTimes(1)
    })
  })
})
