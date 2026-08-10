import { SvgIcon } from '@/ui/icons'
import { NavBackButton } from '@/ui/NavBackButton'

type Props = {
  menuLabel: string
  helpLabel: string
  badge: string
  /** 可选：徽章旁 info tip（如自由练习规则摘要） */
  badgeHint?: string
  onMenu: () => void
  onHelp: () => void
}

export function GameTopbar({
  menuLabel,
  helpLabel,
  badge,
  badgeHint,
  onMenu,
  onHelp,
}: Props) {
  return (
    <header className="game-topbar">
      <NavBackButton label={menuLabel} onClick={onMenu} />
      <span className="badge">
        <span className="badge-text">{badge}</span>
        {badgeHint ? (
          <button
            type="button"
            className="menu-setting-info badge-info"
            aria-label={badgeHint.replace(/\s*\n\s*/g, ' ')}
          >
            <SvgIcon name="info-circle" size={14} />
            <span className="menu-setting-tooltip" role="tooltip">
              {badgeHint}
            </span>
          </button>
        ) : null}
      </span>
      <button
        type="button"
        className="btn btn-sm game-topbar-help"
        onClick={onHelp}
        aria-label={helpLabel}
      >
        <SvgIcon name="help-circle" className="game-topbar-help-icon" />
        <span className="game-topbar-help-label">{helpLabel}</span>
      </button>
    </header>
  )
}
