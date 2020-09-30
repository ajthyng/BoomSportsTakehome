import { Maybe, Optional } from './Types'

export class InMemoryCache {
  private _cache: Record<string, any> = {}
  private _ttlCache: Record<string, Optional<{ setTime: Date, ttl: number }>> = {}

  async getValue <T> (key: string): Promise<Maybe<T>> {
    const ttlRecord = this._ttlCache[key]
    if (ttlRecord) {
      const timeSinceSet = new Date().valueOf() - ttlRecord.setTime.valueOf()
      if (timeSinceSet >= ttlRecord.ttl) {
        delete this._cache[key]
        return null
      }
    }
    return this._cache[key] ?? null
  }

  async setValue (key: string, value: any, ttl = 500) {
    const setTime = new Date()
    this._cache[key] = value
    this._ttlCache[key] = { setTime, ttl }
  }

  async expire (key: string) {
    delete this._cache[key]
    delete this._ttlCache[key]
  }

  async flush () {
    this._cache = {}
    this._ttlCache = {}
  }
}
