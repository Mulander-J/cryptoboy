import type { Feedback, Guess, Password, SlotHint } from './types'

/**
 * 标准 Mastermind：先计绿（位+色），再在剩余中计白（色在、位不对）。
 * 同一密码位/猜测位不重复占用。
 */
export function evaluate(secret: Password, guess: Guess): Feedback {
  const secretUsed = [false, false, false, false]
  const guessUsed = [false, false, false, false]
  let exactCount = 0
  let presentCount = 0

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      exactCount++
      secretUsed[i] = true
      guessUsed[i] = true
    }
  }

  for (let i = 0; i < 4; i++) {
    if (guessUsed[i]) continue
    for (let j = 0; j < 4; j++) {
      if (secretUsed[j]) continue
      if (guess[i] === secret[j]) {
        presentCount++
        secretUsed[j] = true
        break
      }
    }
  }

  return { exactCount, presentCount }
}

/**
 * Easy 按列直示：绿=该列全对；白=该色在密码中但位置不对；灭=不在密码中。
 * 与 Advanced 标准计数分开定义（教学语义）。
 */
export function evaluateEasy(secret: Password, guess: Guess): Feedback {
  const base = evaluate(secret, guess)
  const perSlot: SlotHint[] = [0, 1, 2, 3].map((i) => {
    if (guess[i] === secret[i]) return 'exact'
    if (secret.includes(guess[i]!)) return 'present'
    return 'absent'
  })
  return { ...base, perSlot }
}

export function isWin(feedback: Feedback): boolean {
  return feedback.exactCount === 4
}
