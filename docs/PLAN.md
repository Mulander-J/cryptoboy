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
 → P4.9 页面路由体系
 → P4.10 GitHub Pages 404 / SPA 回退
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
| P4.9 页面路由体系 | ✅ | React Router；见 CODE_STANDARDS §1.1 / `src/app/paths.ts` |
| GitHub Pages 自动部署 | ✅ | `main` → Actions → Pages；见 `.github/workflows/deploy-pages.yml` |
| P4.10 Pages 404 / SPA 回退 | ✅ | `scripts/copy-404.mjs` → `dist/404.html`；客户端 `/404` |
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

## P4.9 · 页面路由体系

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| RTE-1 | React Router；路径表写入 CODE_STANDARDS / `paths.ts` | ✅ |
| RTE-2 | `App` = Provider + `BrowserRouter` + `AppLayout` Outlet | ✅ |
| RTE-3 | `features/*/pages`；导航用 `navigate` / `<Link>` | ✅ |
| RTE-4 | 闯关 `/solo/:difficulty/:level`；练习会话内存保留 | ✅ |
| RTE-5 | i18n / Help / 色盲 / 练习会话挂 Layout | ✅ |

---

## P4.10 · GitHub Pages 404 / SPA 回退

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| PG-1 | `scripts/copy-404.mjs`：`dist/404.html` ← `index.html` | ✅ |
| PG-2 | 客户端 `/404` 品牌页 + 回主菜单 | ✅ |
| PG-3 | `basename` = Vite `BASE_URL`（Pages `/cryptoboy/`） | ✅ |

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

1. a11y 与小屏顶栏避让  
2. （远期）联机 Duo / 独立设置路由
