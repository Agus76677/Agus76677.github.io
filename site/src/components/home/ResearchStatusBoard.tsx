import React, { useEffect, useMemo, useRef, useState } from 'react'

type RatingLevel = 0 | 1 | 2 | 3 | 4 | 5
type RatingMap = Record<string, RatingLevel>
type DayCell = { date: Date | null; key: string }
type MonthMarker = { label: string; weekIndex: number }
type ResearchStatusBoardProps = {
  year?: number
  initialRatings?: RatingMap
  saveEndpoint?: string
}

const BOARD_BG = '#313c4a'
const BOARD_BORDER = '#425061'
const EMPTY_BG = '#465364'
const FUTURE_BG = '#5f5a5a'
const WEEKDAY_LABELS = ['', '', '', '', '', '', '']
const CELL_SIZE = 20
const CELL_GAP = 3
const WEEKDAY_WIDTH = 8
const CHART_PADDING_Y = CELL_SIZE

const LEVELS = [
  { level: 1 as const, emoji: '🙄', label: '状态很差', color: '#f4f8fb', border: '#d8e4ef', text: '#5c6c7b' },
  { level: 2 as const, emoji: '', label: '勉强推进', color: '#d5e6f3', border: '#c0d6e6', text: '#45627d' },
  { level: 3 as const, emoji: '', label: '正常工作', color: '#7ea1c7', border: '#7295bb', text: '#f8fbff' },
  { level: 4 as const, emoji: '', label: '进展不错', color: '#1f5f94', border: '#174e7b', text: '#f8fbff' },
  { level: 5 as const, emoji: '🥳', label: '大丰收', color: '#0a3156', border: '#092742', text: '#f8fbff' }
] as const

const pad = (value: number) => String(value).padStart(2, '0')
const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const startOfWeek = (date: Date) => {
  const result = new Date(date)
  result.setDate(result.getDate() - result.getDay())
  result.setHours(0, 0, 0, 0)
  return result
}

const endOfWeek = (date: Date) => {
  const result = startOfWeek(date)
  result.setDate(result.getDate() + 6)
  return result
}

const getStorageKey = (year: number) => `research-status-${year}`

const normalizeRatings = (value: unknown, year: number): RatingMap => {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const result: RatingMap = {}
  for (const [key, rawLevel] of Object.entries(value as Record<string, unknown>)) {
    if (!key.startsWith(`${year}-`)) {
      continue
    }
    if (rawLevel === 1 || rawLevel === 2 || rawLevel === 3 || rawLevel === 4 || rawLevel === 5) {
      result[key] = rawLevel
    }
  }

  return result
}

const areRatingsEqual = (left: RatingMap, right: RatingMap) => {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  for (const key of leftKeys) {
    if (left[key] !== right[key]) {
      return false
    }
  }

  return true
}

const buildYearGrid = (year: number) => {
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31)
  const gridStart = startOfWeek(yearStart)
  const gridEnd = endOfWeek(yearEnd)

  const weeks: DayCell[][] = []
  const monthMarkers: MonthMarker[] = []
  const cursor = new Date(gridStart)

  while (cursor <= gridEnd) {
    const weekIndex = weeks.length
    const column: DayCell[] = []

    for (let day = 0; day < 7; day += 1) {
      const current = new Date(cursor)
      const inYear = current.getFullYear() === year
      if (inYear && current.getDate() === 1) {
        monthMarkers.push({
          label: `${current.getMonth() + 1}月`,
          weekIndex
        })
      }

      column.push({
        date: inYear ? current : null,
        key: inYear ? toDateKey(current) : `empty-${current.toISOString()}`
      })

      cursor.setDate(cursor.getDate() + 1)
    }

    weeks.push(column)
  }

  return { weeks, monthMarkers }
}

const ResearchStatusBoard = ({
  year = new Date().getFullYear(),
  initialRatings = {},
  saveEndpoint = ''
}: ResearchStatusBoardProps) => {
  const [ratings, setRatings] = useState<RatingMap>(() => normalizeRatings(initialRatings, year))
  const hasLoadedRef = useRef(false)
  const lastSyncedRef = useRef<string>('')
  const today = useMemo(() => new Date(), [])
  const todayKey = useMemo(() => toDateKey(today), [today])
  const [selectedDate, setSelectedDate] = useState(todayKey)

  useEffect(() => {
    const normalizedInitial = normalizeRatings(initialRatings, year)
    try {
      const raw = window.localStorage.getItem(getStorageKey(year))
      if (raw) {
        const localRatings = normalizeRatings(JSON.parse(raw), year)
        const mergedRatings = { ...normalizedInitial, ...localRatings }
        setRatings(mergedRatings)
        lastSyncedRef.current = JSON.stringify(normalizedInitial)
      } else {
        setRatings(normalizedInitial)
        lastSyncedRef.current = JSON.stringify(normalizedInitial)
      }
    } catch {
      setRatings(normalizedInitial)
      lastSyncedRef.current = JSON.stringify(normalizedInitial)
    } finally {
      hasLoadedRef.current = true
    }
  }, [initialRatings, year])

  useEffect(() => {
    if (!hasLoadedRef.current) return
    window.localStorage.setItem(getStorageKey(year), JSON.stringify(ratings))
  }, [ratings, year])

  useEffect(() => {
    if (!hasLoadedRef.current || !saveEndpoint) return

    const payload = JSON.stringify(ratings)
    if (payload === lastSyncedRef.current) {
      return
    }

    const controller = new AbortController()
    const syncRatings = async () => {
      try {
        const response = await fetch(saveEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`Failed to save research status: ${response.status}`)
        }

        lastSyncedRef.current = payload
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }
        console.error(error)
      }
    }

    void syncRatings()
    return () => controller.abort()
  }, [ratings, saveEndpoint])

  const selectedDateText = useMemo(() => {
    const date = parseDateKey(selectedDate)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    })
  }, [selectedDate])

  const { weeks, monthMarkers } = useMemo(() => buildYearGrid(year), [year])
  const totalWeeksWidth = weeks.length * CELL_SIZE + (weeks.length - 1) * CELL_GAP
  const selectedRating = ratings[selectedDate] ?? 0

  const assignRating = (level: RatingLevel) => {
    setRatings((current) => ({ ...current, [selectedDate]: level }))
  }

  const clearSelected = () => {
    setRatings((current) => {
      const next = { ...current }
      delete next[selectedDate]
      return next
    })
  }

  return (
    <section
      className='w-full overflow-hidden rounded-[1.5rem] border px-4 py-4 shadow-sm'
      style={{ backgroundColor: BOARD_BG, borderColor: BOARD_BORDER }}
    >
      <div
        className='overflow-x-visible'
        style={{ paddingTop: CHART_PADDING_Y, paddingBottom: CHART_PADDING_Y }}
      >
        <div className='inline-flex min-w-full justify-center' style={{ gap: 0 }}>
          <div className='pr-2 text-[10px] font-semibold text-slate-200'>
            <div style={{ height: 24 }} />
            <div className='grid' style={{ gap: CELL_GAP }}>
              {WEEKDAY_LABELS.map((label, index) => (
                <div
                  key={`${label}-${index}`}
                  className='flex items-center justify-end'
                  style={{ width: WEEKDAY_WIDTH, height: CELL_SIZE }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className='relative mb-2' style={{ width: totalWeeksWidth, height: 24 }}>
              {monthMarkers.map((marker) => (
                <div
                  key={`${marker.label}-${marker.weekIndex}`}
                  className='absolute top-0 text-xs font-semibold tracking-wide text-slate-100'
                  style={{ left: marker.weekIndex * (CELL_SIZE + CELL_GAP) }}
                >
                  {marker.label}
                </div>
              ))}
            </div>

            <div className='flex' style={{ gap: CELL_GAP }}>
              {weeks.map((column, columnIndex) => (
                <div key={`week-${columnIndex}`} className='grid' style={{ gap: CELL_GAP }}>
                  {column.map((cell, rowIndex) => {
                    if (!cell.date) {
                      return (
                        <div
                          key={`${cell.key}-${rowIndex}`}
                          style={{ width: CELL_SIZE, height: CELL_SIZE }}
                          className='opacity-0'
                        />
                      )
                    }

                    const dateKey = toDateKey(cell.date)
                    const rating = ratings[dateKey] ?? 0
                    const isFuture = cell.date > today
                    const level = LEVELS.find((item) => item.level === rating)
                    const isSelected = selectedDate === dateKey
                    const isToday = dateKey === todayKey

                    return (
                      <button
                        key={dateKey}
                        type='button'
                        onClick={() => setSelectedDate(dateKey)}
                        disabled={isFuture}
                        title={dateKey}
                        className='flex items-center justify-center border text-[13px] transition hover:-translate-y-0.5 disabled:cursor-not-allowed'
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: 3,
                          backgroundColor: isFuture ? FUTURE_BG : level?.color ?? EMPTY_BG,
                          borderColor: isSelected ? '#f8fbff' : level?.border ?? '#526172',
                          color: level?.text ?? '#dbe4ed',
                          boxShadow: isSelected
                            ? '0 0 0 2px rgba(255,255,255,0.18)'
                            : isToday
                              ? 'inset 0 0 0 1px rgba(255,255,255,0.35)'
                              : 'none',
                          opacity: isFuture ? 0.45 : 1
                        }}
                      >
                        {rating === 1 || rating === 5 ? level?.emoji ?? '' : ''}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='border-t pt-3' style={{ borderColor: '#425061' }}>
        <div
          className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-xs text-slate-100 shadow-inner'
          style={{ borderColor: '#536274', backgroundColor: '#2a3441' }}
        >
          <div className='flex items-center gap-3'>
            <div className='text-[10px] uppercase tracking-[0.18em] text-slate-300'>Selected Day</div>
            <div className='text-sm font-semibold'>{selectedDateText}</div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {LEVELS.map((item) => {
              const active = selectedRating === item.level
              return (
                <button
                  key={item.level}
                  type='button'
                  onClick={() => assignRating(item.level)}
                  className='flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 transition-transform hover:-translate-y-0.5'
                  style={{
                    backgroundColor: item.color,
                    borderColor: active ? '#ffffff' : item.border,
                    color: item.text,
                    boxShadow: active ? '0 0 0 2px rgba(255,255,255,0.16)' : 'none'
                  }}
                >
                  {item.emoji ? <span className='text-xs'>{item.emoji}</span> : null}
                  <span className='text-[11px] font-semibold'>{item.level}</span>
                </button>
              )
            })}
            <button
              type='button'
              onClick={clearSelected}
              className='rounded-full border px-2.5 py-1 text-[11px] font-medium text-slate-200 transition-colors hover:bg-slate-700/60'
              style={{ borderColor: '#59687a' }}
            >
              清空
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResearchStatusBoard
