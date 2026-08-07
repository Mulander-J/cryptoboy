import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import { SevenSegment } from './SevenSegment'
import { OrangeKnob } from './OrangeKnob'

type Props = {
  level: number
  statusLight?: 'idle' | 'win' | 'lose' | 'play'
  children: ReactNode
  footerExtra?: ReactNode
  knobDisabled?: boolean
  onKnobRotate: (direction: 1 | -1) => void
  onKnobShortPress: () => void
  onKnobLongPress: () => void
  onSubmitClick: () => void
  submitDisabled?: boolean
}

export function DeviceShell({
  level,
  statusLight = 'play',
  children,
  footerExtra,
  knobDisabled,
  onKnobRotate,
  onKnobShortPress,
  onKnobLongPress,
  onSubmitClick,
  submitDisabled,
}: Props) {
  const { m } = useI18n()

  return (
    <div className={`device-shell on-shell status-${statusLight}`}>
      <div className="device-antenna">
        <span className="status-led" />
      </div>
      <div className="device-panel">{children}</div>
      <div className="device-brand">
        <span>{m.app.name}</span>
      </div>
      <div className="device-controls">
        <SevenSegment value={level} />
        <div className="control-actions">
          <button
            type="button"
            className="btn btn-submit btn-sm"
            onClick={onSubmitClick}
            disabled={submitDisabled}
          >
            {m.device.submit}
          </button>
          <OrangeKnob
            disabled={knobDisabled}
            onRotate={onKnobRotate}
            onShortPress={onKnobShortPress}
            onLongPress={onKnobLongPress}
          />
        </div>
      </div>
      {footerExtra}
    </div>
  )
}
