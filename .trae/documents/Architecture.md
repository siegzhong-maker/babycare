# 兜知道 - 技术架构文档

## 1. 技术栈选型

* **前端框架**：**Uni-app** (Vue 3 + TypeScript + Vite)

  * *理由*：基于 Vue 3 生态，性能优异，开发体验好，跨端能力强，符合主流小程序开发趋势。

* **UI 框架**：**Tailwind CSS** (通过 `weapp-tailwindcss` 适配小程序)

  * *理由*：原子化 CSS，开发效率高，包体积小，易于实现暗黑模式/多主题。

* **状态管理**：**Pinia**

  * *理由*：Vue 3 官方推荐状态管理库，轻量且支持 TypeScript。

* **后端/云服务**：

  * **AI 服务**：**OpenRouter API** (兼容 OpenAI 接口规范)。

  * **BaaS (可选)**：Supabase 或 微信云开发 (CloudBase) 用于存储用户数据和支付订单。本项目初期可使用 Mock + 本地存储，后期对接真实后端。

* **构建工具**：**Vite** (Uni-app 内置)。

## 2. 项目结构 (src/)

```
src/
├── App.vue             # 应用入口组件
├── main.ts             # 应用入口文件
├── manifest.json       # 应用配置 (权限、图标等)
├── pages.json          # 页面路由配置
├── static/             # 静态资源 (Images, Icons)
├── components/         # 通用组件
│   ├── ChatBubble.vue  # 聊天气泡
│   ├── InputBar.vue    # 输入栏
│   ├── EmergencyCard.vue # 急救卡片
│   └── ...
├── pages/              # 页面文件
│   ├── index/          # 首页 (聊天)
│       └── index.vue
│   ├── emergency/      # 急救列表页
│       └── index.vue
│   ├── emergency-detail/ # 急救详情页
│       └── index.vue
│   └── profile/        # 个人中心
│       └── index.vue
├── services/           # API 服务
│   ├── ai.ts           # OpenRouter 接口封装
│   └── payment.ts      # 支付逻辑
├── stores/             # 状态管理 (Pinia)
│   ├── chat.ts
│   └── user.ts
├── utils/              # 工具函数
│   ├── request.ts      # 网络请求封装
│   └── date.ts         # 日期处理
└── types/              # TypeScript 类型定义
```

## 3. 核心模块设计

### 3.1 AI 对话模块

* **接口**：`POST https://openrouter.ai/api/v1/chat/completions`

* **Headers**：

  * `Authorization: Bearer <OPEN_ROUTER_API_KEY>`

  * `HTTP-Referer`: `https://douzhidao.app` (示例)

  * `X-Title`: `DouZhidao`

* **Prompt Engineering**：

  * System Prompt 需包含角色设定（金牌月嫂）、回复限制（非医疗诊断）、JSON 格式输出要求（用于控制前端 UI 模式切换）。

* **流式响应**：小程序端使用 `Transfer-Encoding: chunked` 或分段读取实现打字机效果。

### 3.2 数据持久化

* **本地存储**：`uni.setStorageSync` 存储用户的免费次数、部分历史记录、宝宝基础信息。

* **数据同步**：用户登录后，将本地数据同步至服务端。

### 3.3 性能优化

* **分包加载**：将急救视频、大图等资源放入分包或 CDN。

* **虚拟列表**：长对话列表使用虚拟滚动，避免 DOM 节点过多导致卡顿。

* **图片优化**：使用 WebP 格式，CDN 裁剪。

## 4. 开发规范

* **代码规范**：ESLint + Prettier。

* **提交规范**：Conventional Commits。

* **注释**：关键业务逻辑需配合 JSDoc。

## 5. 测试策略

* **单元测试**：Vitest 测试核心 Hooks 和工具函数。

* **E2E 测试**：使用 微信开发者工具 自动化测试插件。

## 6. 部署流程

1. `npm run build:mp-weixin` 构建生产版本。
2. 微信开发者工具 -> 打开 `dist/build/mp-weixin` -> 上传 -> 体验版。
3. 提交审核 -> 正式发布。

