# domain

> 规则内核：颜色、评估、生成、会话与时钟。**零 UI、零 i18n**，可单测。

## 约束

- 不依赖 `features` / `ui` / `i18n` / React
- 对外优先经 `index.ts` 导出
- 业务规则变更应有对应 `*.test.ts`

## 主要文件

| 文件 | 说明 |
| ------ | ------ |
| `types.ts` | 难度、密码、提示、关卡配置等类型与常量 |
| `colors.ts` | 颜色元数据、`colorsForCount` / `nextColor` |
| `evaluate.ts` | Advanced 槽位提示 / Easy 汇总提示、`isWin` |
| `generate.ts` | 确定性密码生成、`levelSeed` |
| `session.ts` | `GameSession` 状态机（输入 / 提交 / 胜负） |
| `passwordInput.ts` | 预设答案等密码输入校验 |
| `clock.ts` | 正计时 / 倒计时、`formatMmSs` |

## 相关

- [根 README](../../README.md)
- [代码规范 · 目录分层](../../docs/CODE_STANDARDS.md)
