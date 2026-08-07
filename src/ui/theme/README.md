# theme

> 主题 token 与切换：`data-theme` + CSS 变量；菜单色点为 **外壳 · 旋钮 · 主按钮** 三色。

## 文件

| 文件 | 作用 |
| ------ | ------ |
| `theme.css` | 共享结构变量 + **经典原皮**默认 |
| `themes.css` | 其它主题的 token 覆盖 |
| `themes.ts` | 主题 id / 标签 / 三色点 / `applyTheme` / `resolveTheme` |
| `buttons.css` | `.btn-*` 体系 |
| `themes.test.ts` | id 解析与目录完整性 |

## 主题列表（菜单顺序）

经典原皮置顶；其余按色点邻近排列。仅色球带黑+白描边。

| 值 | 说明 |
| ---- | ------ |
| `classic` | 经典原皮 |
| `sanxingdui` | 三星堆目 |
| `xmas` | 欢乐圣诞 |
| `cyber` | 赛博霓虹 |
| `cappuccino` | 卡布奇诺 |
| `plum-snow` | 踏雪寻梅 |
| `cny` | 祥瑞新春 |
| `panzer` | 德国战车 |
| `americana` | 自由美国 |

已下线映射：`macintosh` / `glass` → 经典；`aurora` → 赛博。

## 约定

- **当前格闪烁** / 色盘选中：`--cursor-ring` / `--palette-selected` → `var(--knob)`
- **机身描边**：`--shell-rim`（壳色贴近页面时拉开层次）
- **切换入口**：设置区 / 对局可用的 `ThemePicker`；写入 `settings.theme`
- 文案标签走 i18n（`theme.labels`），勿在 CSS 写死中文名

## 对比打磨

- 深壳（赛博 / 美国 / 战车）：壳略亮于页底 + 彩色 rim
- 浅皮（寻梅）：页底压暗、边框加硬、字色加深
- 提示点：absent 提亮；present / exact 加暗描边防糊进面板

## 相关

- [`ui` README](../README.md)
- [`features/menu` ThemePicker](../../features/menu/ThemePicker.tsx)
