# CryptoBoy · 代码规范

> 配套：[PRODUCT.md](./PRODUCT.md) · [PLAN.md](./PLAN.md)  
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

### 1.1 页面与路由（现状 → 目标）

**现状（过渡）**

- `App` 内 `Screen` 联合类型 + `useState` 切换页面（`menu` / `custom-setup` / `solo` / `practice`）。
- 无 URL、无浏览器历史；全局层（i18n、Help、Theme chrome）与页面同挂在 `App`。
- 新增屏时继续扩 `Screen` 会让 `App.tsx` 变厚，后续应迁出。

**目标（待落地，见 PLAN P4.9）**

- 引入页面路由体系（优先 React Router 或同等轻量方案），**一页一路由**。
- 建议路径（落地时以实现为准，表需同步本文）：

| 路径（草案） | 页面 | 特性目录 |
| ------ | ------ | ------ |
| `/` | 主菜单 | `features/menu` |
| `/practice/setup` | 自由练习配置 | `features/menu` |
| `/solo/:difficulty/:level` | 闯关 | `features/solo` |
| `/practice/play` | 自由练习对局 | `features/solo` |
| `/duo`（预留） | 联机双人（远期） | `features/duo` |
| （现状 Screen）`practice-set-secret` | 练习预设答案 / 本地双人设密 | `features/menu` |
| `/settings`（预留） | 完整设置 | `features/settings` |

- `app`：只装配 `BrowserRouter`（或 HashRouter，若静态托管需要）、根 Layout、全局 Provider。
- 页面组件放在对应 `features/<name>/`（如 `pages/` 或路由文件集中在 `src/routes/`）；**禁止**在深层 UI 里直接改全局 screen 状态。
- 导航：统一 `navigate` / `<Link>`；返回菜单、下一关等走路由参数或 search，而不是隐式 `setScreen`。
- Layout：帮助弹层、主题/语言 chrome、i18n 挂在根 layout，路由切换不卸载。
- 帮助 / 结果弹层仍是页面内或全局 overlay，**不**必占独立 URL（除非产品明确要求可分享说明页）。

落地前可继续用 `Screen`；一旦接路由，删除分散的 `setScreen`，并更新上表与 PLAN RTE-*。

---

## 2. 组件模块化

目标：可复用 UI 与业务块拆清，避免页面内复制粘贴；机身 / 菜单 / 弹层分层稳定。

### 2.1 已抽离

| 组件 | 位置 | 说明 |
| ------ | ------ | ------ |
| `DropdownPanel` | `src/ui/` | 可滚动下拉 + 上下更多箭头 |
| `SegmentedControl` | `src/ui/` | 分段 pill 开关 |
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
| `PRODUCT.md` | 产品规格与实现对照 |
| `PLAN.md` | 任务进度与下一步 |
| `CODE_STANDARDS.md`（本文） | 工程与组件约定 |

改目录 / 抽组件 / 换 i18n 格式 / 落地或调整路由表时，同步更新本文与 PLAN 状态。
