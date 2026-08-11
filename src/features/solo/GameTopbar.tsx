import { InfoTipButton } from '@/ui/InfoTipButton'
import { SvgIcon } from '@/ui/icons'
import { NavBackButton } from '@/ui/NavBackButton'

type Props = {
  menuLabel: string
  helpLabel: string
  badge: string
  /** 可选：徽章旁 info tip（如自定义试炼规则摘要） */
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
        {badgeHint ? <InfoTipButton hint={badgeHint} className="badge-info" /> : null}
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
