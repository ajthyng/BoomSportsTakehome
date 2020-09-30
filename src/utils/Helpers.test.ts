import { sleep, timeValue } from './Helpers'

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
  })

  describe('sleep tests', () => {
    it('should wait for at least 100 ms', async () => {
      const start = new Date()
      await sleep(100)
      const end = new Date()
      expect(end.valueOf() - start.valueOf()).toBeGreaterThanOrEqual(100)
    })
  })
})
