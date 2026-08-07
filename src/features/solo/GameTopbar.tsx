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
      <button type="button" className="btn btn-ghost btn-sm" onClick={onMenu}>
        {menuLabel}
      </button>
      <span className="badge">{badge}</span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onHelp}>
        {helpLabel}
      </button>
    </header>
  )
}
