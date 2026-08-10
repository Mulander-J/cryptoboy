# CryptoBoy · 代码规范

> 范围：目录约定、页面路由（规划）、组件模块化、TypeScript/React、i18n、安全默认、测试与本地服务

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
| `/practice/setup` | 自由练习配置 | `features/menu/pages/PracticeSetupPage` |
| `/practice/set-secret` | 预设答案设密 | `features/menu/pages/PracticeSetSecretPage` |
| `/practice/play` | 自由练习对局 | `features/solo/pages/PracticePlayPage` |
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
| 低 | `CustomField` | 自由练习表单项 |
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
- 副作用：`useEffect` 写清依赖；时钟 / 键盘监听务必 cleanup。

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

