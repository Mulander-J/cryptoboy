import { SvgIcon } from '@/ui/icons'

type Props = {
  menuLabel: string
  helpLabel: string
  badge: string
  onMenu: () => void
  onHelp: () => void
}

export function GameTopbar({ menuLabel, helpLabel, badge, onMenu, onHelp }: Props) {
  return (
    <header className="game-topbar">
      <button type="button" className="btn btn-ghost btn-sm game-topbar-menu" onClick={onMenu}>
        {menuLabel}
      </button>
      <span className="badge">{badge}</span>
      <button type="button" className="btn btn-sm game-topbar-help" onClick={onHelp}>
        <SvgIcon name="help-circle" className="game-topbar-help-icon" />
        <span>{helpLabel}</span>
      </button>
    </header>
  )
}
