import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n'
import { ModalBackdrop } from '@/ui/ModalBackdrop'

type Props = {
  open: boolean
  onClose: () => void
}

export function HelpPanel({ open, onClose }: Props) {
  const { m } = useI18n()
  const steps = m.help.steps
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!open) return null

  const current = steps[step]!
  const last = step === steps.length - 1
  const isKeys = step === steps.length - 1

  return (
    <ModalBackdrop className="help-backdrop" labelledBy="help-title">
      <div className="help-panel on-shell">
        <div className="help-shell-bar" aria-hidden />
        <header className="help-header">
          <h2 id="help-title">{m.help.title}</h2>
          <span className="help-step">
            {step + 1}/{steps.length}
          </span>
        </header>

        <div className="help-body">
          <h3>{current.title}</h3>
          <ul>
            {current.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {isKeys ? (
            <table className="help-keys">
              <tbody>
                {m.shortcuts.map((row) => (
                  <tr key={row.keys}>
                    <th scope="row">
                      <kbd>{row.keys}</kbd>
                    </th>
                    <td>{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>

        <div className="help-dots" aria-hidden>
          {steps.map((_, i) => (
            <span key={i} className={i === step ? 'on' : ''} />
          ))}
        </div>

        <div className="help-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {m.help.close}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            {m.help.prev}
          </button>
          {last ? (
            <button type="button" className="btn btn-primary" onClick={onClose}>
              {m.help.done}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              {m.help.next}
            </button>
          )}
        </div>
      </div>
    </ModalBackdrop>
  )
}
