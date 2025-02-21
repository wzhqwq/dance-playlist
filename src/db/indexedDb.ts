const dbName = "vrc-dance-diary"
const dbVersion = 1

type StoreName = "songs" | "records"

class DBManager {
  db: IDBDatabase | null = null

  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion)
      request.onerror = () => {
        reject(request.error)
      }
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }
      request.onupgradeneeded = () => {
        this.db = request.result
        const songsStore = this.db.createObjectStore("songs", { keyPath: "id" })
        const recordsStore = this.db.createObjectStore("records", { keyPath: "id" })
        songsStore.createIndex("title", "title", { unique: false })
        songsStore.createIndex("artist", "artist", { unique: false })
        songsStore.createIndex("id", "id", { unique: true })
        recordsStore.createIndex("id", "id", { unique: true })
      }
    })
  }

  async getStore(storeName: string) {
    if (!this.db) {
      await this.open()
    }
    return this.db!.transaction(storeName, "readwrite").objectStore(storeName)
  }

  async add(storeName: StoreName, data: unknown) {
    const store = await this.getStore(storeName)
    return new Promise((resolve, reject) => {
      console.log("store", store, data)
      const request = store.add(data)
      request.onerror = () => {
        reject(request.error)
      }
      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }

  async findById<T>(storeName: StoreName, id: string) {
    const store = await this.getStore(storeName)
    return new Promise<T | undefined>((resolve, reject) => {
      const request = store.get(id)
      request.onerror = () => {
        reject(request.error)
      }
      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }

  async update(storeName: StoreName, data: unknown) {
    const store = await this.getStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.put(data)
      request.onerror = () => {
        reject(request.error)
      }
      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }

  async getAll<T>(storeName: StoreName) {
    const store = await this.getStore(storeName)
    return new Promise<T[]>((resolve, reject) => {
      const request = store.getAll()
      request.onerror = () => {
        reject(request.error)
      }
      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }
}

const dbManager = new DBManager()

export default dbManager
