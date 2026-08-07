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

function beep(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  gain = 0.04,
): void {
  const ac = getCtx()
  if (!ac) return
  void ac.resume()
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration)
}

export type SoundEvent = 'tick' | 'move' | 'submit' | 'win' | 'lose' | 'urgent'

export function playSound(event: SoundEvent, enabled: boolean): void {
  if (!enabled) return
  switch (event) {
    case 'tick':
      beep(880, 0.04, 'square', 0.03)
      break
    case 'move':
      beep(660, 0.05, 'triangle', 0.03)
      break
    case 'submit':
      beep(440, 0.1, 'square', 0.04)
      break
    case 'urgent':
      beep(920, 0.06, 'square', 0.035)
      setTimeout(() => beep(720, 0.08, 'square', 0.03), 90)
      break
    case 'win':
      beep(523, 0.1)
      setTimeout(() => beep(659, 0.1), 100)
      setTimeout(() => beep(784, 0.18), 200)
      break
    case 'lose':
      beep(220, 0.25, 'sawtooth', 0.05)
      break
  }
}
