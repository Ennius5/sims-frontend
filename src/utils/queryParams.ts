export function toSpatieParams<T extends object>(
  params: T,
  filterKeys: (keyof T)[]
): Record<string, unknown> {
  const filter: Record<string, unknown> = {}
  const rest: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(params) as [keyof T, unknown][]) {
    if (value === undefined || value === null || value === '') continue
    if (filterKeys.includes(key)) {
      filter[key as string] = value
    } else {
      rest[key as string] = value
    }
  }

  return Object.keys(filter).length > 0 ? { ...rest, filter } : rest
}