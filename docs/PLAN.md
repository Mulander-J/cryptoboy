# React 版 · 任务计划

> 技术栈：**React + Vite + TypeScript**  
> 形态：Web 优先（PWA / Capacitor 后续再说）  
> 范围：先做出可玩的 Solo MVP，再还原机身与进阶模式  
> 不做：联网多人、Wasm、账号体系

关联文档：[PRODUCT.md](./PRODUCT.md) · [CODE_STANDARDS.md](./CODE_STANDARDS.md) · [DUO.md](./DUO.md)（联机与中段道具，搁置）

---

## 总览

```markdown
P0 工程骨架
 → P1 规则内核（可单测）
 → P2 最小可玩 UI
 → P3 机身视觉还原
 → P4 闯关 / 难度 / 持久化
 → P4.5 计时 / 限时挑战
 → P4.6 主题体系 / 自定义试炼（可配置）
 → P4.7 i18n（简中 / EN）+ CryptoBoy 品牌
 → P4.8 工程规范深化（组件模块化 / i18n JSON / hooks·模式条文）
 → P4.9 页面路由体系
 → P4.10 GitHub Pages 404 / SPA 回退
 → P5 设置 / 抛光 / 本地双人（练习预设答案）
 → P6 噩梦 · 无尽
 → P7 厄运时刻（收官定色）
 → P7.1 主题玩法（默认 beat / 美式左轮）
 → P8 周目轮回（NG+）
 → （延后）联机 Duo 等
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
| 自定义试炼（可配置） | ✅ | 系数 / 颜色数 / 重复 / 提示 / 限时 + 三档快捷 |
| 玩法说明 + 键盘 | ✅ | HelpPanel、快捷键 |
| i18n 简中 / EN + CryptoBoy | ✅ | 设置区语言；文案 `locales/*.json` |
| 代码规范文档 | ✅ | [CODE_STANDARDS.md](./CODE_STANDARDS.md)；含 hooks / rAF / 轻量设计模式（§3.1–3.4） |
| P4.8 工程规范深化 | ⏳ | 组件高/中优已落地；STD hooks/模式条文 ✅；低优组件见 §2 |
| P4.9 页面路由体系 | ✅ | React Router；见 CODE_STANDARDS §1.1 / `src/app/paths.ts` |
| GitHub Pages 自动部署 | ✅ | `main` → Actions → Pages；见 `.github/workflows/deploy-pages.yml` |
| P4.10 Pages 404 / SPA 回退 | ✅ | `scripts/copy-404.mjs` → `dist/404.html`；客户端 `/404` |
| P5-1 本地双人（练习预设答案） | ✅ | 自定义试炼 `presetSecret` + 设密/换手 |
| P5-2 完整设置 | ✅ | 音效 / 主题 / 语言 / 进度重置 / 色盲图案 / 确认提交 |
| 像素字体自托管 | ✅ | Press Start 2P → `public/fonts` + `injectPixelFont`（兼容 Pages base） |
| P5-4/5 响应式与 a11y | ✅ | 安全区 / 小屏顶栏 / 矮屏缩放；焦点陷阱 + focus-visible；色盲见 PRODUCT §3.6 |
| P6 噩梦 · 无尽 | ✅ | 改名 / 迁移 / 无尽连破；见 PRODUCT.md |
| P7 厄运时刻 | ✅ | 三锁一悬 · 定色；见 PRODUCT.md；玩法映射见 P7.1 |
| P7.1 主题玩法映射 | ✅ | 默认 beat；americana→revolver；见 PRODUCT.md |
| P8 周目轮回（NG+） | ✅ | 首周目固定种子；整档通关开新周目，周目入 levelSeed；菜单/数据页展示；见 PRODUCT.md §7.4 |
| 联网 Duo / Wasm / 上架 | ❌ | 延后；见 DUO.md |

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
| P4-5 | 自定义试炼（可配置规则） | ✅ |

---

## P4.5 · 计时与限时挑战

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| T-1 ~ T-4 | 时钟状态机、正计时、挑战倒计时、文档 | ✅ |

---

## P4.6 · 主题与自定义试炼

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| TH-1 | 多主题 token + 右上角 ThemePicker | ✅ |
| TH-2 | 三色点 / 对比打磨 / 节庆皮 | ✅ |
| CP-1 | 自定义试炼可配置 + 难度系数 + 三档快捷 | ✅ |
| CP-2 | 选项持久化 `settings.customPractice` | ✅ |

---

## P4.8 · 工程规范深化

详细约定与组件候选见 **[CODE_STANDARDS.md](./CODE_STANDARDS.md)**（组件模块化已迁入该文档）。

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| STD-1 | 新增 `docs/CODE_STANDARDS.md` | ✅ |
| STD-2 | 条文：hooks / 副作用 / rAF（CODE_STANDARDS §3.1–3.2）；对照落地 `useGameClock` / `useFateNightPlay` | ✅ |
| STD-3 | 条文：hooks 用量归仓（§3.3）+ 轻量设计模式（§3.4 Reducer / Strategy / Facade 等） | ✅ |
| STD-4 | （可选）按 §3.3 收敛页面平行 `useState`（如 GameBoard 结算字段） | ⏳ |
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

## P5 · 设置、抛光、本地双人

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| P5-1 | 自定义试炼「预设答案」：出题 → 换手 → 破译 | ✅ |
| P5-2a | 设置：进度重置（确认框；保留 settings） | ✅ |
| P5-2b | 设置：色盲图案（灯阵 / 色盘 / 结算叠加符号） | ✅ |
| P5-2c | 设置：确认提交（UI 弹窗，非 window.confirm） | ✅ |
| P5-3 | 玩法说明页 | ✅ |
| P5-4 | 桌面/移动响应式与安全区 | ✅ |
| P5-5 | 基础无障碍 | ✅ |

---

## P6 · 噩梦 · 无尽

规格见 **[PRODUCT.md](./PRODUCT.md)**（计时档 / 无尽）。**已完成**。

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| I0a | 文案「限时挑战」→「噩梦」 | ✅ |
| I4 | 无尽：连破；局败整盘结束；最高连胜 `endless.bestClears` | ✅ |
| I5 | `challenge` → `nightmare` 进度迁移；菜单单人区（闯关 + 无尽） | ✅ |

---

## P7 · 厄运时刻（收官定色）

规格见 **[PRODUCT.md](./PRODUCT.md)** §厄运时刻。总称 Fate Night；玩法子集见 P7.1（首版落地为左轮 UI，现已拆为 `playMode`）。

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| I0b | `FATE_CASE_*` 常量与空弹规则（候选项唯一则加空弹）单测 | ✅ |
| I2 | 厄运时刻状态机 + UI；噩梦 / 无尽启用 + 试炼开关 | ✅ |
| I3 | 收官动效 + 定色 / 连开 + 5s 窗口 + 空弹表现 | ✅ |

---

## P7.1 · 主题玩法（默认 beat / 美式左轮）

规格见 **[PRODUCT.md](./PRODUCT.md)** §3.7。默认节拍玩法；`americana`（自由美式）挂左轮。

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| FC-1 | `FateCasePlayMode` 含 `beat`；默认 beat；`americana = revolver` | ✅ |
| FC-2 | 节拍 UI：加宽均匀音符 + 判定线步长脉冲；共用 5s / 一次机会 / 五档难度 | ✅ |
| FC-3 | 设置与结算文案通用化；局内 slogan 按 playMode 分支 | ✅ |

---

## P8 · 周目轮回（NG+）

规格见 **[PRODUCT.md](./PRODUCT.md)** §7.4。首周目固定种子（与旧版逐位兼容）；整档通关后菜单开「第 N+1 周目」，答案按周目重排，记忆刷记录失效。

| ID | 任务 | 状态 |
| ---- | ------ | ------ |
| NG-1 | `levelSeed` 加 `cycle` 参；周目 1 兼容旧答案 + 单测 | ✅ |
| NG-2 | 进度 `cycle` 字段 + 旧档迁移 + `startNextCycle`（归位进度、重置最佳用时） | ✅ |
| NG-3 | SoloPage/GameBoard 按周目生成答案；重试保持同周目同密 | ✅ |
| NG-4 | 菜单 NG+ 按钮（确认框）+ 周目徽章、数据页周目行、双语 i18n | ✅ |

---

## 刻意延后

- 联机 Duo（含中段改色/改位等道具赛；草案见 [DUO.md](./DUO.md)）
- 一键截图分享（结算 / 数据页 → 生成卡片图，分享到社交；后续做）
- **其他主题的厄运时刻玩法**（左轮 / 默认节拍之外；见下节）
- Wasm
- Capacitor 上架
- 与任何厂商关卡表 / 官方数据对齐
- 复杂动画库（先 CSS）
- 密码长度从 4 扩到 6（见下节）

---

## 远期设想（非本期）

### 一键截图分享

结算或数据页一键生成分享卡片（成绩 / 最佳 / 连胜等），导出或调起系统分享到社交。规格另定；不挡当前主路径。

### 厄运时刻 · 主题玩法扩展

现状（P7 + P7.1）：

- **体验核心**：不确定的趣味短时玩法 → 确定的悬格色球；左轮 / 节拍是子集；限时加压（见 [PRODUCT.md](./PRODUCT.md) §3.7）。
- 总称 `fateCase*`（Fate Night）；玩法子集 `playMode`：`revolver` | `beat`。
- 映射表 `THEME_FATE_CASE_PLAY_MODE`：**americana → revolver**；其余主题 → beat。
- 设置三项通用：自动开始 / 一次机会 / 收官难度（五档，`fateCaseDifficulty`）；各玩法自行解释。
- **彩蛋**：Help 不设厄运专章；收官 UI 不堆规则说明，玩家自行探索。

后续（延后做）：

- 按其他主题挂不同玩法，共用触发（三锁一悬）与胜负契约；UI / 动效分玩法实现。
- 改 `THEME_FATE_CASE_PLAY_MODE` + 扩展 `FateCasePlayMode`；规格 / 文案按 `playMode` 分支（仍可不进 Help）。
- 候选方向可随主题气质定（如战车 / 三星堆 / 新春等）。

### 联机 Duo · WebRTC

完整草案与**中段道具规格**见 **[DUO.md](./DUO.md)**（搁置）。

### 密码 4 位 → 6 位：为何难（不是改一个常量）

当前规格对齐实体机：**4 槽 × 最多 7 次**；`PASSWORD_LENGTH = 4` 贯穿 domain、灯阵列、旋钮槽、Easy 列示提示、i18n 与帮助文案。

拉长到 6 位，难点不只在「循环多两格」：

1. **组合爆炸，难度曲线要整盘重做**  
   - 例：6 色无重复时，4 位约 \(P(6,4)=360\) 种；6 位同色板无重复约 \(P(6,6)=720\)，可重复则 \(6^6=46656\)。  
   - 信息量更大，**原「7 次」往往不够玩也不够过关**；须重定 `MAX_ATTEMPTS`、颜色递进、限时、关卡种子曲线，否则要么过难劝退，要么提示过强失去推理味。

2. **机身 UI 是为 4×7 定的**  
   - 灯阵、列下 Easy 提示、色盘/旋钮编辑态都按 4 列构图；改 6 列会挤竖屏主视觉，横屏/平板也要重排，不能只改 `PASSWORD_LENGTH`。

3. **规则与类型契约写死长度**  
   - `Password` / `Guess` 为四元组、`evaluate` / `generate` / `resolvePassword` / session 光标取模均假定 4；扩长度要改类型、单测与校验，回归面大。

4. **和「动态验证器 / 6 位 OTP」不是同一需求**  
   - 游戏加长是益智规格；登录用动态码应走标准 TOTP 等。勿与扩槽捆成一个任务。

**结论**：4→6 标为远期；与主路径解耦，另开规格再做。

---

## 下一步建议

1. （延后）一键截图分享社交  
2. （延后）其他主题的厄运时刻玩法（默认 beat / 美式左轮已落地）  
3. （延后）[DUO.md](./DUO.md) 联机与中段道具  
4. （更远）密码 4→6  
