import { useI18n } from '@/i18n'
import { SvgIcon } from '@/ui/icons'
import { IconButton } from '@/ui/IconButton'

type Props = {
  onOpen: () => void
}

export function ChromeHelpButton({ onOpen }: Props) {
  const { m } = useI18n()

  return (
    <IconButton label={m.menu.helpChromeTitle} onClick={onOpen} className="chrome-help-btn">
      <SvgIcon name="help-circle" />
    </IconButton>
  )
}
