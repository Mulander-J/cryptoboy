import { describe, expect, it } from 'vitest'
import { evaluate, evaluateEasy, isWin } from './evaluate'
import type { Guess, Password } from './types'

const secret = (a: string, b: string, c: string, d: string) =>
  [a, b, c, d] as unknown as Password
const guess = (a: string, b: string, c: string, d: string) =>
  [a, b, c, d] as unknown as Guess

describe('evaluate（标准 Mastermind）', () => {
  it('全对：4 绿 0 白', () => {
    const fb = evaluate(secret('R', 'O', 'Y', 'G'), guess('R', 'O', 'Y', 'G'))
    expect(fb).toEqual({ exactCount: 4, presentCount: 0 })
    expect(isWin(fb)).toBe(true)
  })

  it('全错：0 绿 0 白', () => {
    const fb = evaluate(secret('R', 'O', 'Y', 'G'), guess('B', 'P', 'B', 'P'))
    expect(fb).toEqual({ exactCount: 0, presentCount: 0 })
  })

  it('颜色对位置错：0 绿 4 白', () => {
    const fb = evaluate(secret('R', 'O', 'Y', 'G'), guess('G', 'Y', 'O', 'R'))
    expect(fb).toEqual({ exactCount: 0, presentCount: 4 })
  })

  it('混合：部分绿部分白', () => {
    const fb = evaluate(secret('R', 'O', 'Y', 'G'), guess('R', 'Y', 'B', 'O'))
    // R 绿；Y、O 白；B 无
    expect(fb.exactCount).toBe(1)
    expect(fb.presentCount).toBe(2)
  })

  it('不重复占用：密码一位只匹配一次', () => {
    // secret 只有一个 R，guess 两个 R → 最多 1 绿或 1 白
    const fb = evaluate(secret('R', 'O', 'Y', 'G'), guess('R', 'R', 'B', 'P'))
    expect(fb.exactCount).toBe(1)
    expect(fb.presentCount).toBe(0)
  })

  it('可重复密码：正确计数', () => {
    const fb = evaluate(secret('R', 'R', 'Y', 'G'), guess('R', 'O', 'R', 'B'))
    // 位0 绿；位2 的 R 对应 secret 位1 → 白
    expect(fb.exactCount).toBe(1)
    expect(fb.presentCount).toBe(1)
  })
})

describe('evaluateEasy（按列直示）', () => {
  it('按列给出绿/白/灭', () => {
    const fb = evaluateEasy(secret('R', 'O', 'Y', 'G'), guess('R', 'Y', 'B', 'O'))
    expect(fb.exactCount).toBe(1)
    expect(fb.presentCount).toBe(2)
    expect(fb.perSlot).toEqual(['exact', 'present', 'absent', 'present'])
  })

  it('全对时四列皆绿', () => {
    const fb = evaluateEasy(secret('R', 'O', 'Y', 'G'), guess('R', 'O', 'Y', 'G'))
    expect(fb.perSlot).toEqual(['exact', 'exact', 'exact', 'exact'])
    expect(isWin(fb)).toBe(true)
  })
})
