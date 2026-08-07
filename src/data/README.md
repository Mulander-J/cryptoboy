# data

> 关卡曲线、自由练习配置、本地进度与设置。可读写 `localStorage`，不渲染 UI。

## 约束

- 依赖 `domain` 类型；不反向依赖 `features`
- 进度键与版本迁移集中在本层（如 `code-hack-progress-v2`）
- 设置项（主题、语言、音效、自定义练习草稿）经 `progress` 读写

## 主要文件

| 文件 | 说明 |
| ------ | ------ |
| `levels.ts` | 三档难度关卡曲线、`MAX_LEVELS`、限时公式、`practiceConfig` |
| `customPractice.ts` | 自由练习选项、校验、`customOptionsToLevelConfig` |
| `progress.ts` | 闯关解锁 / 最佳用时 / 设置的加载与更新 |

## 相关

- [根 README](../../README.md)
- [`domain`](../domain/README.md)
