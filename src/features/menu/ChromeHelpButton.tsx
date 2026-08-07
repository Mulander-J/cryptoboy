import { useI18n } from '../../i18n'
import { IconButton } from '../../ui/IconButton'

type Props = {
  onOpen: () => void
}

export function ChromeHelpButton({ onOpen }: Props) {
  const { m } = useI18n()

  return (
    <IconButton label={m.menu.helpChromeTitle} onClick={onOpen} className="chrome-help-btn">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        <circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M9.6 9.4a2.4 2.4 0 1 1 3.5 2.15c-.7.4-1.1.85-1.1 1.7v.35"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16.6" r="1" fill="currentColor" />
      </svg>
    </IconButton>
  )
}
