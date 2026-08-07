# React 版 · 任务计划

> 技术栈：**React + Vite + TypeScript**  
> 形态：Web 优先（PWA / Capacitor 后续再说）  
> 范围：先做出可玩的 Solo MVP，再还原机身与进阶模式  
> 不做：联网多人、Wasm、账号体系

关联文档：[PRODUCT.md](./PRODUCT.md) · [CODE_STANDARDS.md](./CODE_STANDARDS.md)

---

## 总览

```
P0 工程骨架
 → P1 规则内核（可单测）
 → P2 最小可玩 UI
 → P3 机身视觉还原
 → P4 闯关 / 难度 / 持久化
 → P4.5 计时 / 限时挑战
 → P4.6 主题体系 / 自由练习（可配置）
 → P4.7 i18n（简中 / EN）+ CryptoBoy 品牌
 → P4.8 工程规范深化（组件模块化 / i18n JSON）
 → P4.9 页面路由体系（规范结构，待做）
 → P4.10 GitHub Pages 404 / SPA 回退（待做）
 → P5 Duo + 完整设置 + 抛光
```

---

## 进度总表（对照）

| 范围 | 状态 | 说明 |
| ------ | ------ | ------ |
| P0 工程骨架 | ✅ | Vite React+TS、目录、Vitest |
| P1 规则内核 | ✅ | evaluate / generate / session + 单测 |
| P2 最小可玩 UI | ✅ | 灯阵、提交、胜负、菜单 |
| P3 机身还原 | ✅ | 外壳、数码管、旋钮、色盘、音效 |
| P4 闯关进度 | ✅ | 三档、localStorage、种子关卡 |
| P4.5 计时 | ✅ | 正计时 / 倒计时挑战 / 最佳用时 |
| 多主题 + 右上角切换 | ✅ | 9 套主题、三色点、对比打磨 |
| 自由练习（可配置） | ✅ | 系数 / 颜色数 / 重复 / 提示 / 限时 + 三档快捷 |
| 玩法说明 + 键盘 | ✅ | HelpPanel、快捷键 |
| i18n 简中 / EN + CryptoBoy | ✅ | 设置区语言；文案 `locales/*.json` |
| 代码规范文档 | ✅ | [CODE_STANDARDS.md](./CODE_STANDARDS.md) |
| P4.8 组件模块化（续） | ⏳ | 高/中优已落地；低优见 CODE_STANDARDS §2 |
| P4.9 页面路由体系 | ⏳ | 现状为 App 内 `Screen` 状态切换；见 CODE_STANDARDS §1.1 |
| GitHub Pages 自动部署 | ✅ | `main` → Actions → Pages；见 `.github/workflows/deploy-pages.yml` |
| P4.10 Pages 404 / SPA 回退 | ⏳ | 现状无 URL 路由可不做；上路由后需 `404.html` 回退 |
| P5-1 本地双人（练习预设答案） | ✅ | 自由练习 `presetSecret` + 设密/换手 |
| P5-2 完整设置 | ✅ | 音效 / 主题 / 语言 / 进度重置 / 色盲图案 / 确认提交 |
| 像素字体自托管 | ✅ | Press Start 2P → `public/fonts` + `injectPixelFont`（兼容 Pages base） |
| P5-4/5 响应式与 a11y | ⏳ | 基础居中；色盲图案属 a11y 子集，见 PRODUCT §3.6 |
| 联网 / Wasm / 上架 | ❌ | 暂时不做 |

---

## P0 · 工程骨架

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| P0-1 | Vite React+TS | ✅ |
| P0-2 | 目录约定 | ✅ |
| P0-3 | 主题 CSS 变量 | ✅（已扩展多主题） |
| P0-4 | Vitest | ✅ |

---

## P1 · 规则内核（零 UI）

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| P1-1 ~ P1-5 | 类型 / evaluate / Easy 列示 / generate / session | ✅ |

---

## P2 · 最小可玩 UI

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| P2-1 ~ P2-6 | 灯阵到菜单 Solo | ✅ |

---

## P3 · 机身视觉还原

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| P3-1 ~ P3-6 | 外壳 / LED / 数码管 / 旋钮 / 色盘 / 音效 | ✅ |
| 提交按钮主题适配 | 旋钮色 `btn-submit` | ✅ |

---

## P4 · 闯关、难度、进度

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| P4-1 ~ P4-4 | Easy/Advanced、种子关、进度、重试解锁 | ✅ |
| P4-5 | 自由练习（可配置规则） | ✅ |

---

## P4.5 · 计时与限时挑战

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| T-1 ~ T-4 | 时钟状态机、正计时、挑战倒计时、文档 | ✅ |

---

## P4.6 · 主题与自由练习

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| TH-1 | 多主题 token + 右上角 ThemePicker | ✅ |
| TH-2 | 三色点 / 对比打磨 / 节庆皮 | ✅ |
| CP-1 | 自由练习可配置 + 难度系数 + 三档快捷 | ✅ |
| CP-2 | 选项持久化 `settings.customPractice` | ✅ |

---

## P4.8 · 工程规范深化

详细约定与组件候选见 **[CODE_STANDARDS.md](./CODE_STANDARDS.md)**（组件模块化已迁入该文档）。

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| STD-1 | 新增 `docs/CODE_STANDARDS.md` | ✅ |
| I18N-1 | 文案迁到 `src/i18n/locales/*.json` | ✅ |
| I18N-2 | 两语结构对齐单测（`localeShapeKeys`） | ✅ |
| I18N-3 | （可选）再接入 i18next；当前 Context 可保留 | ⏳ |
| MOD-1 | 高优：SegmentedControl / MenuSettingRow / ModalBackdrop / IconButton | ✅ |
| MOD-2 | 中优：AppChrome / GameTopbar / SoundToggle | ✅ |
| MOD-3 | 低优按需拆（MenuBlock / CustomField / StatusBadge） | ⏳ |

---

## P4.9 · 页面路由体系（待做）

**现状**：`App.tsx` 用 `Screen` 联合类型 + `useState` 切换  
`menu` / `custom-setup` / `solo` / `practice`，无 URL、无历史栈。

**目标**：引入页面路由，规范「一页一路由、特性目录对齐路径」，便于 Duo / 设置等新屏扩展，并支持刷新可恢复、浏览器前进后退（按需）。

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| RTE-1 | 选型：优先 React Router（或同等轻量）；约定路径表写入 CODE_STANDARDS | ⏳ |
| RTE-2 | 将现有 `Screen` 映射为路由；`App` 只做 Provider / Outlet 装配 | ⏳ |
| RTE-3 | 特性页下沉：`features/*/pages` 或 `routes`；导航用 `navigate`，禁散落 `setScreen` | ⏳ |
| RTE-4 | （可选）关卡/难度进 path 或 search；刷新不丢局内入口（不含进行中会话） | ⏳ |
| RTE-5 | 全局层（i18n / Help / Theme chrome）挂在 layout，不随页面卸载 | ⏳ |

约定细节见 [CODE_STANDARDS.md §1.1](./CODE_STANDARDS.md)。可与 P5 并行：先接路由再上 Duo，或 Duo 落地后一并迁入。

---

## P4.10 · GitHub Pages 404 / SPA 回退（待做）

**现状**：无前端 URL 路由，主站入口 ` /cryptoboy/` 即可；错链由 GitHub 默认 404。  
**目标**：上路由或需要友好错页后，提供 SPA 回退，避免深链刷新空白。

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| PG-1 | 构建产物增加 `404.html`：与 `index.html` 同内容（或构建后 `cp dist/index.html dist/404.html`） | ⏳ |
| PG-2 | （可选）品牌化 404 屏：回首页 CTA；仍须能被 Pages 当作回退入口 | ⏳ |
| PG-3 | 与 P4.9 联调：深链 / 刷新不 白屏；文档注明 Pages 项目站 `base` | ⏳ |

建议：**跟 P4.9 路由一并做**；路由未上线前可不阻塞发布。

---

## P5 · Duo、设置、抛光（未完成）

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| P5-1 | 自由练习「预设答案」：出题 → 换手 → 破译 | ✅ |
| P5-2a | 设置：进度重置（确认框；保留 settings） | ✅ |
| P5-2b | 设置：色盲图案（灯阵 / 色盘 / 结算叠加符号） | ✅ |
| P5-2c | 设置：确认提交（UI 弹窗，非 window.confirm） | ✅ |
| P5-3 | 玩法说明页 | ✅ |
| P5-4 | 桌面/移动响应式与安全区 | ⏳ 基础 |
| P5-5 | 基础无障碍 | ⏳ |

---

## 刻意延后

- 联网多人 / 竞速 / 道具 Duo（独立 `/duo`）
- Wasm
- Capacitor 上架
- 与任何厂商关卡表 / 官方数据对齐
- 复杂动画库（先 CSS）

---

## 下一步建议

1. P4.9 页面路由（结构规范化）  
2. P4.10 Pages `404.html` SPA 回退（随路由落地）  
3. a11y 与小屏顶栏避让  
4. （远期）联机 Duo
