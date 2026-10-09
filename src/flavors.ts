import data from './data/flavors.json'

export type Flavor = {
  id: string
  name: string
  line: string
  lineKey: LineKey
  image: string
  url: string
}

export type LineKey = 'monster' | 'ultra' | 'coffee' | 'juice' | 'rehab'

export const FLAVORS = data as Flavor[]

export const FLAVOR_BY_ID = new Map(FLAVORS.map((f) => [f.id, f]))

export const LINES: { key: LineKey; name: string }[] = [
  { key: 'monster', name: 'Monster Energy' },
  { key: 'ultra', name: 'Zero Sugar Ultra' },
  { key: 'juice', name: 'Juice Monster' },
  { key: 'coffee', name: 'Java Monster' },
  { key: 'rehab', name: 'Rehab Monster' },
]

export const imageUrl = (f: Flavor) => import.meta.env.BASE_URL + f.image
