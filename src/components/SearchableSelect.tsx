import { useState, useRef, useEffect } from 'react'

interface Option {
  id: number
  label: string
}

interface SearchableSelectProps {
  id?: string
  options: Option[]
  value: string
  onChange: (id: string) => void
  placeholder: string
}

export function SearchableSelect({ id, options, value, onChange, placeholder }: SearchableSelectProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => String(o.id) === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  return (
    <div ref={containerRef} className="relative w-64">
      <input
        id={id}
        placeholder={placeholder}
        value={isOpen ? query : (selected?.label ?? '')}
        onFocus={() => { setIsOpen(true); setQuery('') }}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />
      {value && !isOpen && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear"
        >
          ×
        </button>
      )}
      {isOpen && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded border border-gray-200 bg-white text-sm shadow">
          <li
            onClick={() => { onChange(''); setIsOpen(false); setQuery('') }}
            className="cursor-pointer px-3 py-2 text-gray-500 hover:bg-gray-50"
          >
            All
          </li>
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-gray-400">No matches</li>
          ) : (
            filtered.map((o) => (
              <li
                key={o.id}
                onClick={() => { onChange(String(o.id)); setIsOpen(false); setQuery('') }}
                className="cursor-pointer px-3 py-2 hover:bg-gray-50"
              >
                {o.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}