type TimeUnit = 'ms' | 'sec' | 'min' | 'hour' | 'hours' | 'day' | 'days'

const ms = 1
const sec = ms * 1000
const min = sec * 60
const hour = min * 60
const day = hour * 24

const multiplierMap = {
  ms,
  sec,
  min,
  hour,
  hours: hour,
  day,
  days: day
}

const baseTimeConvert = (val: number, fromUnit: TimeUnit, toUnit: TimeUnit) => {
  return val * multiplierMap[fromUnit] / multiplierMap[toUnit]
}

export const timeValue = (time: number, unit: TimeUnit = 'ms') => ({
  to: (convertedUnit: TimeUnit) => baseTimeConvert(time, unit, convertedUnit)
})

export const sleep = async (time: number) => {
  return await new Promise(resolve => setTimeout(resolve, time))
}

export interface MemoCache {
  getValue: (key: string) => Promise<any | null>
  setValue: (key: string, value: any) => Promise<void>
}

export function memoize <T extends (...args: any[]) => any> (func: T, memoCache: MemoCache) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = args.map((arg) => {
      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    }).toString()

    const cachedResult = await memoCache.getValue(key)
    if (cachedResult) return cachedResult

    const newCacheValue = await func(...args)
    await memoCache.setValue(key, newCacheValue)
    return newCacheValue
  }
}
