/** 轻量 Web Audio 音效；受 settings.sound 控制 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

/** 须在用户手势后调用；先 resume 再发声，避免静音启动 */
async function ensureCtx(): Promise<AudioContext | null> {
  const ac = getCtx()
  if (!ac) return null
  if (ac.state === 'suspended') {
    try {
      await ac.resume()
    } catch {
      return null
    }
  }
  return ac
}

function beep(
  ac: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  gain = 0.06,
): void {
  const osc = ac.createOscillator()
  const g = ac.createGain()
  const t0 = ac.currentTime
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration)
}

export type SoundEvent = 'tick' | 'move' | 'submit' | 'win' | 'lose' | 'urgent'

export function playSound(event: SoundEvent, enabled: boolean): void {
  if (!enabled) return
  void (async () => {
    const ac = await ensureCtx()
    if (!ac) return
    switch (event) {
      case 'tick':
        beep(ac, 880, 0.05, 'square', 0.05)
        break
      case 'move':
        beep(ac, 660, 0.06, 'triangle', 0.05)
        break
      case 'submit':
        beep(ac, 440, 0.12, 'square', 0.06)
        break
      case 'urgent':
        beep(ac, 920, 0.07, 'square', 0.055)
        window.setTimeout(() => {
          void ensureCtx().then((a) => {
            if (a) beep(a, 720, 0.09, 'square', 0.05)
          })
        }, 90)
        break
      case 'win':
        beep(ac, 523, 0.1)
        window.setTimeout(() => {
          void ensureCtx().then((a) => {
            if (a) beep(a, 659, 0.1)
          })
        }, 100)
        window.setTimeout(() => {
          void ensureCtx().then((a) => {
            if (a) beep(a, 784, 0.18)
          })
        }, 200)
        break
      case 'lose':
        beep(ac, 220, 0.28, 'sawtooth', 0.07)
        break
    }
  })()
}
