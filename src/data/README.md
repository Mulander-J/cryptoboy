# data

> 关卡曲线、自定义试炼配置、本地进度与设置。可读写 `localStorage`，不渲染 UI。

## 约束

- 依赖 `domain` 类型；不反向依赖 `features`
- 进度键与版本迁移集中在本层（如 `code-hack-progress-v2`）
- 设置项（主题、语言、音效、自定义练习草稿）经 `progress` 读写
- **重置进度**：`resetSoloProgress` 清空 `solo.*` 与 `endless.bestClears`，保留全部 `settings`；并调用 `clearProgressStorageCache` 扫掉废弃键后再回写（UI 入口在数据页）
- **清缓存**：`clearProgressStorageCache` 独立删除进度相关 localStorage（含 v1 等废弃键）；升级废弃键或需要彻底重写存档时可直接调用

## 主要文件

| 文件 | 说明 |
| ------ | ------ |
| `levels.ts` | 三档难度关卡曲线、无尽配置、`MAX_LEVELS`、限时公式、`practiceConfig` |
| `customPractice.ts` | 自定义试炼选项（含厄运时刻开关 / 自动开始 / 收官难度）、校验、`customOptionsToLevelConfig` |
| `progress.ts` | 闯关解锁 / 各关最佳 / 无尽连胜 / 设置加载更新 / 进度重置 / 存档缓存清理 |
| `progress.test.ts` | 重置、清缓存与 `hasSoloProgress` |

## 相关

- [根 README](../../README.md)
- [`domain`](../domain/README.md)
