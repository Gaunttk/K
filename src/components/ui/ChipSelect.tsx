import { useState, useRef, type KeyboardEvent } from 'react'

interface Props {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  allowAdd?: boolean
  placeholder?: string
}

export default function ChipSelect({ options: initialOptions, selected, onChange, allowAdd = false, placeholder = 'Add...' }: Props) {
  const [allOptions, setAllOptions] = useState(initialOptions)
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function toggle(opt: string) {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  function addCustom() {
    const val = inputVal.trim()
    if (!val) return
    if (!allOptions.includes(val)) setAllOptions((prev) => [...prev, val])
    if (!selected.includes(val)) onChange([...selected, val])
    setInputVal('')
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustom()
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allOptions.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              active
                ? 'bg-amber border-amber text-bg'
                : 'bg-surface-2 border-border text-text-muted hover:border-amber hover:text-text'
            }`}
          >
            {opt}
          </button>
        )
      })}
      {allowAdd && (
        <div className="flex gap-1">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            className="input-base w-32 text-sm py-1 px-2"
          />
          <button
            type="button"
            onClick={addCustom}
            className="px-3 py-1 rounded border border-border text-text-muted text-sm hover:border-amber hover:text-text transition-colors"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}
