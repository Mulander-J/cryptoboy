# CryptoBoy

四色密码破译益智游戏 · React + Vite + TypeScript · 无后端单机 Web。  
界面语言：简体中文 / English。

## 开发

```bash
npm install
npm run dev          # http://127.0.0.1:5173
npm test
npm run build
```

本地服务仅绑定 `127.0.0.1`。

## 试玩

1. `npm run dev` 打开浏览器访问 `http://127.0.0.1:5173`
2. 主菜单 **帮助与设置** 可改语言 / 音效 / 查看教程；右上角 **?**｜主题
3. 主菜单选 **闯关 Solo**（Easy / Advanced / Challenge）或 **自由练习**
4. 点灯格循环换色，或用底部色盘 / 旋钮（拖转换色、短按移格、长按提交）
5. 填满 4 格后点「提交」；最多 7 次；胜负后可重试 / 下一关

## 目录

- `src/domain` — 规则内核（可单测）
- `src/data` — 关卡曲线与 localStorage 进度
- `src/i18n` — 简中 / 英文（`locales/*.json`）
- `src/features` — 菜单 / 游戏页
- `src/ui` — 机身组件与主题

- 产品规格：[`docs/PRODUCT.md`](./docs/PRODUCT.md)  
- 任务计划：[`docs/PLAN.md`](./docs/PLAN.md)  
- 代码规范：[`docs/CODE_STANDARDS.md`](./docs/CODE_STANDARDS.md)
