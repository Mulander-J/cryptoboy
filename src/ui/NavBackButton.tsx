type Props = {
  label: string
  onClick: () => void
  className?: string
}

/** 返回 / 菜单：与对局顶栏左侧 ghost 钮同款 */
export function NavBackButton({ label, onClick, className }: Props) {
  return (
    <button
      type="button"
      className={['btn', 'btn-ghost', 'btn-sm', 'nav-back-btn', className]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-label={label}
    >
      <span className="nav-back-btn-label">{label}</span>
    </button>
  )
}
