import { useHelp } from '../help/HelpController'
import { ChromeHelpButton } from './ChromeHelpButton'

/** 右上角全局快捷：玩法说明 */
export function AppChrome() {
  const { open, openHelp, closeHelp } = useHelp()

  return (
    <div className="app-chrome">
      <ChromeHelpButton
        onOpen={() => {
          if (open) closeHelp()
          else openHelp()
        }}
      />
    </div>
  )
}
