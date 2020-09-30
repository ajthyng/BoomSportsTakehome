import { InMemoryCache } from './InMemoryCache'
import { sleep, timeValue } from './Helpers'

describe('InMemoryCache Tests', () => {
  const cache = new InMemoryCache()

  beforeEach(() => {
    cache.flush()
  })

  it('should set and retrieve a value in the cache', async () => {
    const data = {
      firstName: 'Phillip',
      lastName: 'Fry'
    }

    await cache.setValue('fullName', data)

    expect(await cache.getValue('fullName')).toStrictEqual(data)
  })

  it('should expire a cached value after a period of time', async () => {
    const data = ['Agriculture', 'Aardvark', 'Asymptotic', 'Achilles']

    await cache.setValue('aWords', data, timeValue(1, 'sec').to('ms'))
    expect(await cache.getValue('aWords')).toEqual(data)

    await sleep(timeValue(1, 'sec').to('ms') + 1)
    const cacheValue = await cache.getValue('aWords')
    expect(cacheValue).toBeNull()
  })

  it('should overwrite a duplicate key with new data', async () => {
    const data = {
      name: {
        first: 'Phillip',
        last: 'Fry'
      }
    }

    await cache.setValue('name', data)
    expect(await cache.getValue('name')).toStrictEqual(data)

    const replacementData = { name: { first: 'Yancy', last: 'Fry' } }
    await cache.setValue('name', replacementData)
    expect(await cache.getValue('name')).toStrictEqual(replacementData)
  })

  it('should expire a cached value on demand', async () => {
    const data = 'Zoidberg'
    await cache.setValue('name', data, timeValue(1, 'day').to('ms'))

    expect(await cache.getValue('name')).toEqual(data)

    await cache.expire('name')

    expect(await cache.getValue('name')).toBeNull()
  })

  it('should flush all cache entries', async () => {
    const name = 'Zoidberg'
    const age = 86
    const height = '5\'9"'

    await cache.setValue('name', name, 2000)
    await cache.setValue('age', age, 2000)
    await cache.setValue('height', height, 2000)

    expect(await cache.getValue('name')).toBe(name)
    expect(await cache.getValue('age')).toBe(age)
    expect(await cache.getValue('height')).toBe(height)

    await cache.flush()

    expect(await cache.getValue('name')).toBeNull()
    expect(await cache.getValue('age')).toBeNull()
    expect(await cache.getValue('height')).toBeNull()
  })
})
