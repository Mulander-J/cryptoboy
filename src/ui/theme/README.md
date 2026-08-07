# 主题体系

## 文件

| 文件 | 作用 |
|------|------|
| `theme.css` | 共享结构变量 + **经典原皮**默认 |
| `themes.css` | 其它主题的 token 覆盖 |
| `themes.ts` | 主题 id / 中文名 / 三色点 / `applyTheme` |
| `buttons.css` | `.btn-*` 体系 |

## 主题列表（菜单顺序）

经典原皮置顶；其余按色点相似邻近。菜单色点为 **外壳 · 旋钮 · 主按钮** 三色；仅色球带黑+白描边。

| 值 | 中文名 |
|----|--------|
| `classic` | 经典原皮 |
| `sanxingdui` | 三星堆目 |
| `xmas` | 欢乐圣诞（绿朱红金） |
| `cyber` | 赛博霓虹 |
| `cappuccino` | 卡布奇诺 |
| `plum-snow` | 踏雪寻梅 |
| `cny` | 祥瑞新春（中国红鎏金） |
| `panzer` | 德国战车（黑红金） |
| `americana` | 自由美国 |

已下线：`macintosh` / `glass` → 经典；`aurora` → 赛博。

## 约定

- **当前格闪烁** / 色盘选中：`--cursor-ring` / `--palette-selected` → `var(--knob)`
- **机身描边**：`--shell-rim`（壳色贴近页面时拉开层次）
- **切换入口**：右上角 `ThemePicker`（菜单与对局均可随时切换）
- 写入 `settings.theme`（`data-theme`）

## 对比打磨要点

- 深壳（赛博 / 美国 / 战车）：壳略亮于页底 + 彩色 rim
- 浅皮（寻梅）：页底压暗、边框加硬、字色加深
- 提示点：absent 提亮；present/exact 加暗描边防糊进面板
