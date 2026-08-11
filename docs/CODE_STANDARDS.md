# CryptoBoy · 代码规范

> 范围：目录约定、页面路由、组件模块化、TypeScript/React（hooks / 动效 / 轻量设计模式）、i18n、安全默认、测试与本地服务

---

## 1. 目录与分层

| 目录 | 职责 | 约束 |
| ------ | ------ | ------ |
| `src/domain` | 规则内核（评估 / 生成 / 会话 / 时钟） | **零 UI、零 i18n**；可单测 |
| `src/data` | 关卡曲线、进度、自定义练习配置 | 可读写 `localStorage`；不渲染 |
| `src/i18n` | 语言类型、Context、文案加载 | 文案在 `locales/*.json` |
| `src/features` | 按功能的页面 / 流程（menu、solo、help） | 可组合 `ui` + `domain` |
| `src/ui` | 可复用展示组件（机身、弹层、下拉） | 尽量无业务状态机 |
| `src/app` | 根装配、全局样式、（规划中）路由入口 | 薄：Provider + 路由/Outlet，少业务分支 |
| `src/lib` | 与框架/部署相关的薄工具（如 `assetUrl`） | 无业务规则、无 UI |

跨目录引用可用别名 `@/` → `src/`（如 `@/lib/assetUrl`）；同目录 / 近邻仍可用相对路径。

依赖方向：`app` → `features` → `ui` / `data` / `i18n` → `domain`（domain 不依赖上层）。

### 1.1 页面与路由

**实现**：`react-router-dom` + `BrowserRouter`，`basename` 取自 Vite `BASE_URL`（Pages 项目站 `/cryptoboy`）。路径常量见 `src/app/paths.ts`。

| 路径 | 页面 | 特性目录 |
| ------ | ------ | ------ |
| `/` | 主菜单 | `features/menu/pages/MenuPage` |
| `/practice/setup` | 自定义试炼配置 | `features/menu/pages/PracticeSetupPage` |
| `/practice/set-secret` | 预设答案设密 | `features/menu/pages/PracticeSetSecretPage` |
| `/practice/play` | 自定义试炼对局 | `features/solo/pages/PracticePlayPage` |
| `/solo/:difficulty/:level` | 闯关（`easy` / `advanced` / `nightmare`） | `features/solo/pages/SoloPage` |
| `/endless` | 无尽连破 | `features/solo/pages/EndlessPage` |
| `/stats` | 进度数据 | `features/menu/pages/StatsPage` |
| `/404` | 未知路径 | `app/NotFoundPage` |
| `/duo`（预留） | 联机双人（远期） | `features/duo` |
| `/settings`（预留） | 独立设置页（远期） | `features/settings` |

- `app`：`ProgressProvider` + `BrowserRouter` + `AppLayout`（i18n / 色盲 / 练习会话 / Help / Outlet）。
- 导航：页面内用 `navigate` / `<Link>`；**禁止**再引入全局 `Screen` / `setScreen`。
- 闯关难度与关卡在 path；未解锁关会重定向到当前解锁关。练习预设密仅存内存，刷新后需重设。
- 帮助 / 结果 / 确认提交弹层仍为 overlay，不占独立 URL。
- **GitHub Pages SPA 回退**：`npm run build` 末尾 `scripts/copy-404.mjs` 将 `dist/index.html` 复制为 `dist/404.html`，深链刷新由前端路由接管。

---

## 2. 组件模块化

目标：可复用 UI 与业务块拆清，避免页面内复制粘贴；机身 / 菜单 / 弹层分层稳定。

### 2.1 已抽离

| 组件 | 位置 | 说明 |
| ------ | ------ | ------ |
| `DropdownPanel` | `src/ui/` | 可滚动下拉 + 上下更多箭头 |
| `SegmentedControl` | `src/ui/` | 分段 pill 开关 |
| `OnOffToggle` | `src/ui/` | 开/关（基于 SegmentedControl） |
| `NavBackButton` | `src/ui/` | 返回 / 菜单 ghost 钮 |
| `MenuSettingRow` | `src/ui/` | 设置区标签行 |
| `ModalBackdrop` | `src/ui/` | 弹层遮罩外壳 |
| Icons（`<SvgIcon name="..." />` + `assets/*.svg`） | `src/ui/icons/` | 按 name 引用；需变色用 `currentColor`，多色可写死 |
| `ThemePicker` | `features/menu/` | 触发器 + DropdownPanel |
| `LocaleSwitcher` / `SoundToggle` | `features/menu/` | 基于 SegmentedControl |
| `GameTopbar` Help | `features/solo/` | 对局内打开玩法说明（菜单用「查看教程」） |
| `GameTopbar` | `features/solo/` | 对局顶栏 |
| `HelpController` / `HelpPanel` | `features/help/` | 全局唯一帮助窗 |
| Device 系列 | `ui/device/` | 外壳 / 灯阵 / 旋钮 / 色盘 / 数码管 |

### 2.2 建议继续组件化（候选）

| 优先级 | 候选 | 现状 / 拆法 |
| -------- | ------ | ------------- |
| 低 | `MenuBlock` / `MenuHero` | 主菜单区块与品牌头图 |
| 低 | `CustomField` | 自定义试炼表单项 |
| 低 | `StatusBadge` | 闯关 / 练习顶栏徽章 |

原则：**出现两次以上的 UI 结构再抽**；为拆而拆不计入完成。任务跟踪见 [PLAN.md](./PLAN.md) MOD-*。

### 2.3 组件约定

- 一个文件一个主要导出组件；hooks 可同目录 `useXxx.ts`。
- Props 用显式 `type`，避免 `any`。
- 全局唯一弹层（如帮助）用 Context/Controller，**禁止**各页各挂一份。
- 样式：优先 CSS 变量（主题 token）；组件私有类名带前缀（如 `theme-dock-`、`dropdown-panel-`）。

---

## 3. TypeScript / React

- 严格模式；公共 API 尽量显式类型。
- 领域错误用抛错 / 结果类型；UI 层不吞掉未预期异常（可降级提示）。
- React：函数组件；状态尽量靠近使用处；跨页共享用 Context（i18n、Help）。
- 不默认加 `useMemo` / `useCallback`，除非已有性能问题或依赖引用稳定。
- 副作用：`useEffect` 写清依赖；时钟 / 键盘 / `rAF` / `ResizeObserver` / timer 务必 cleanup（含组件卸载）。

### 3.1 Hooks 与副作用风格

| 要求 | 说明 |
| ------ | ------ |
| 稳定回调进 ref | 父组件常传 inline 的 `onXxx`、或 effect 内只需「最新值」的函数：用 `ref.current = fn`，effect **不要**把不稳定函数塞进 deps 只为「读最新」（防误触发、也防以后去掉 guard 后重入） |
| 派生 UI 节流 | 高频源（时钟 `tick`、收官剩余）若展示精度是秒 / 百毫秒级，**勿**每帧 `setState`；权威值可留在 `ref`，React state 只在 UI 桶变化或状态位变化时更新 |
| 暂停 / 恢复读 ref | 对已节流的时钟等：`pause` / `resume` / `freeze` 必须基于 `ref` 里的权威快照，禁止用可能落后一秒的 React state 去改 |
| `resume` / `pause` 恒等 | 领域更新若无实际变化，返回原对象引用，避免无意义 rerender |
| effect 依赖求精 | `ResizeObserver` / 滚动绑定等：deps 只放真正改变观测目标的输入；不要把「由 effect 自己 `setState` 出来的 UI 开关」再放回 deps（易抖或重复 disconnect） |
| 避免 setState 环 | `setState → effect → setState` 必须有收敛条件（相等则返回旧 state、或 ref 闸门）；审查时应能指出退出点 |

### 3.2 动画 / rAF 风格

| 要求 | 说明 |
| ------ | ------ |
| 无工作则停 rAF | 终局、主钟非 `running`、收官未开窗、帮助/确认/hidden 暂停时，**停止** `requestAnimationFrame` 调度；恢复时再拉起（deps 变化或 `bumpLoop` 一类显式唤醒） |
| 平滑运动尽量离 React | 60fps 的 `transform` / 位移动画：优先 rAF **直写 DOM**（或 CSS），React state 只同步离散信息（如当前对准槽位、抖动档） |
| 单所有者 | 同一视觉量不要父子各跑一条 rAF 再双双 `setState`；倒计时与转盘若解耦，子树更新也应避免拖整盘 `GameBoard` |
| 卸载必 cancel | `cancelAnimationFrame` / `clearTimeout` / `removeEventListener` 写在 effect cleanup；长按等 timer 同理 |

参考实现：`features/solo/useGameClock.ts`、`features/solo/fateNight/useFateNightPlay.ts`。

### 3.3 Hooks 用量：能简则简、同模式归仓

组件或 hook 里若同时堆很多 `useState` / `useRef` / `useCallback` / `useMemo`，先问「是否可合并或下沉」，再写新的。

| 信号 | 倾向做法 |
| ------ | ------ |
| 多个 state 总是一起变（开局清零、同一步提交） | 收成 **一个** `useState` 对象，或 `useReducer`；胜负/结算字段尤忌拆成 5+ 个平行 `useState` |
| 一串 `useRef` 只为 effect / rAF 读「最新 props/回调」 | 可接受；命名统一 `xxxRef`，赋值紧贴声明（`xxxRef.current = xxx`），不要再包一层无意义 `useCallback` |
| 页面里既管对局又管计时又管键盘 | **抽自定义 hook**（`useGameClock` / `useGameKeyboard` / `useFateNightPlay`）；页面只编排，不堆实现细节 |
| `useCallback` / `useMemo` 成串但 deps 不稳或消费方不依赖引用相等 | **删掉**；默认内联函数 + 子组件不靠 memo，或子侧用 ref 接回调（见 §3.1） |
| 布尔旗 + 镜像 ref（`armed` + `armedRef`） | 仅当 rAF / 原生监听必须同步读时保留；若只在 React 事件里用，只留 state |
| 仅派生、无独立写入 | 不要 `useState` + sync effect；写成渲染期计算或 `useMemo`（后者仍要克制） |

**标准化约定**

- **自定义 hook 边界**：一块可单测或可复用的行为（计时、收官玩法、焦点陷阱）→ `useXxx.ts`；返回值保持扁平、语义稳定，避免把整个页面 props 捅进 hook。
- **ref 清单**：权威可变数据（时钟快照、rAF 句柄、闸门 flag）用 ref；需要上屏的再用 state。禁止「state 与 ref 双写同一业务真相」却无注释说明谁为准。
- **不要为了好看预加** `useCallback`/`useMemo`/`React.memo`；有测量或明确子树压力再加，并写清原因（注释一行即可）。
- **新增前数一下**：同一文件超过约 5 个 `useState` 或 5 个「镜像 ref」时，优先考虑 reducer / 合并 / 抽 hook，而不是继续追加。

### 3.4 轻量设计模式（按需引入，忌教条）

优先用**本仓库已有形状**表达意图；需要新抽象时，选下面能对上号的模式，并在注释或 README 点一句「这里是 X」，方便后人检索。不引入庞大 OO 框架、不写空接口套娃。

| 模式 | 本项目用法 | 何时用 |
| ------ | ------ | ------ |
| **Reducer / 状态机** | `domain/session`：`reduceSession` + 判别联合 `SessionAction`；UI 侧 `useReducer` | 多步骤、多事件、非法转移要拒绝（对局编辑→收官→胜负） |
| **Strategy（策略）** | Fate Night：`playMode` → Beat / Revolver 舞台与定色文案；共用触发与胜负契约 | 同一契约、多种表现/算法，分支用表或显式映射，避免巨型 `if` 穿透多层 |
| **Facade（门面）** | `resolveFateCaseRuntime`、`sanitizeOptions`：一次给出启用面/默认档 | 调用方不应拼一堆分散规则；入口函数收敛「算完再给」 |
| **Adapter（适配）** | `progress` 加载时 normalize / 主题 `resolveTheme` 旧 id | 外部/持久化形态 → 内部干净模型；**新代码不要再叠兼容分支**（未上线可直接改键） |
| **Controller / 单例窗** | `HelpController`：全局唯一帮助 | 全局 overlay、快捷键、与路由无关的模态 |
| **Pure domain + thin hook** | `clock` / `fateCase` 纯函数；`useGameClock` 只接 rAF 与 React | 规则可单测、UI 可换皮；禁止把胜负规则写进 JSX |
| **Composition（组合）** | `FateNightBase` + `children` 舞台；`DeviceShell` 插槽 | UI 外壳共用、内核可插拔；优于深层继承 |

**刻意不用或慎用**

- **上帝 Context**：只放真正跨树的偏好（locale、theme、progress）；对局一步一动的状态留在页面 / reducer。
- **过度 Observer / 事件总线**：本项目体量用 props、dispatch、少量 Context 即可；不要为解耦再引入全局 mitt。
- **为模式而模式**：两处以内的重复先复制或抽函数；第三次再升 Strategy / 表驱动。

**命名与落点**

- 领域规则 → `domain/`（纯、可测）；编排与订阅 → `features/**/useXxx`；可复用皮 → `ui/`。
- 表驱动映射（主题→玩法、档位→周期 ms）放 `const` / `Record`，与 STRATEGY 分支同文件或紧邻，避免魔法字符串散落。

---

## 4. i18n

- 文案文件：`src/i18n/locales/zh-CN.json`、`en.json`（**JSON，不用 YAML**）。
- 加载与类型：`src/i18n/messages.ts`（`as Messages` + 单测对齐结构）。
- UI **禁止**硬编码用户可见中英文（品牌名 `CryptoBoy` 可例外写入 JSON）。
- 插值统一 `{name}` + `interpolate` / `t()`。
- 新增语言：加 locale JSON → 挂入 `CATALOG` → 扩展 `LOCALES`。

---

## 5. 数据与持久化

- 进度键：`code-hack-progress-v2`；改结构要做迁移或新版本键。
- 禁止提交密钥 / `.env` / 私钥到仓库。
- 日志不打印 PII、token、密码。

---

## 6. 安全默认（摘要）

完整协议见工作区 Security Protocol；本项目额外强调：

- 本地 Dev / Preview **仅**绑定 `127.0.0.1`，禁止 `0.0.0.0` 与内网穿透暴露。
- 无后端：仍按 default-deny 思维设计未来接口；不引入无鉴权 debug API。
- 用户可控路径 / URL / 命令：不做拼接执行；本项目暂无服务端 SQL。

---

## 7. 测试与质量

- 规则内核与时钟 / 会话：**必须**有 Vitest。
- i18n：两语文案关键结构、主题数、帮助步骤数对齐。
- PR 前：`npm test` && `npm run build`。
- Lint：`npm run lint`（oxlint）。

---

## 8. 本地开发

```bash
npm run dev      # http://127.0.0.1:5173
npm test
npm run build
```

---

## 9. 文档维护

| 文档 | 内容 |
| ------ | ------ |
| `PRODUCT.md` | 产品规格与实现对照（含厄运时刻） |
| `PLAN.md` | 任务进度与下一步 |
| `DUO.md` | 联机 / 中段道具草案 |
| `CODE_STANDARDS.md`（本文） | 工程与组件约定 |

改目录 / 抽组件 / 换 i18n 格式 / 落地或调整路由表时，同步更新本文与 PLAN 状态。

### 9.1 Markdown 写作约定

**不装** markdownlint；写 / 改 `docs/**/*.md`、`README.md` 时由作者与 AI **自行遵守**（对齐常见 MD060 compact）：

- 表格每个 `|` **左右都要有空格**：`| 列 A | 列 B |`；分隔行同理 `| ------ | ------ |`。
- **禁止**挤在一起：`|----|------|`、`|列|列|`。
- 不要求各列竖线对齐；中文行宽不硬卡 80；示意代码块可不写语言标记。

示例：

```md
| 模式 | 说明 |
| ------ | ------ |
| 无尽 | 整盘连破 |
```
