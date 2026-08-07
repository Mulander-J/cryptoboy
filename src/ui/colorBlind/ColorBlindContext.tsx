import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react'

const ColorBlindContext = createContext(false)

/** 同步根节点标记，便于 CSS 微调 */
export function applyColorBlind(on: boolean): void {
  if (typeof document === 'undefined') return
  if (on) {
    document.documentElement.dataset.colorBlind = 'on'
  } else {
    delete document.documentElement.dataset.colorBlind
  }
}

type Props = {
  enabled: boolean
  children: ReactNode
}

export function ColorBlindProvider({ enabled, children }: Props) {
  useEffect(() => {
    applyColorBlind(enabled)
  }, [enabled])

  return (
    <ColorBlindContext.Provider value={enabled}>
      {children}
    </ColorBlindContext.Provider>
  )
}

export function useColorBlindPatterns(): boolean {
  return useContext(ColorBlindContext)
}
