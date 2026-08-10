# data

> 关卡曲线、自由练习配置、本地进度与设置。可读写 `localStorage`，不渲染 UI。

## 约束

- 依赖 `domain` 类型；不反向依赖 `features`
- 进度键与版本迁移集中在本层（如 `code-hack-progress-v2`）
- 设置项（主题、语言、音效、自定义练习草稿）经 `progress` 读写
- **重置进度**：`resetSoloProgress` 清空 `solo.*` 与 `endless.bestClears`，保留全部 `settings`（UI 入口在数据页）

## 主要文件

| 文件 | 说明 |
| ------ | ------ |
| `levels.ts` | 三档难度关卡曲线、无尽配置、`MAX_LEVELS`、限时公式、`practiceConfig` |
| `customPractice.ts` | 自由练习选项（含厄运时刻开关 / 自动开始 / 码数）、校验、`customOptionsToLevelConfig` |
| `progress.ts` | 闯关解锁 / 各关最佳 / 无尽连胜 / 设置加载更新 / 进度重置 |
| `progress.test.ts` | 重置与 `hasSoloProgress` |

## 相关

- [根 README](../../README.md)
- [`domain`](../domain/README.md)
