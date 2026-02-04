# 兜知道 - AI金牌月嫂小程序 V2.0

## 项目介绍
基于大模型（OpenRouter/Gemini）的智能育婴助手，提供喂养、睡眠、护理等全方位指导。

## 目录结构
```
miniprogram/
  ├── components/    # 组件 (SOP Wizard)
  ├── pages/         # 页面 (Chat/Home)
  ├── utils/         # 工具类 (API, Date)
  ├── app.js         # 全局逻辑
  ├── app.json       # 全局配置
  └── app.wxss       # 全局样式
test/                # 单元测试
```

## 开发环境
- 微信开发者工具 (基础库 2.30.0+)
- Node.js (用于运行测试)

## 部署说明
1. **安装依赖** (仅用于测试):
   ```bash
   npm install
   npm test
   ```
2. **导入项目**:
   打开微信开发者工具 -> 导入项目 -> 选择 `miniprogram` 目录 -> AppID 使用测试号或申请正式号。
3. **配置域名**:
   在微信后台 -> 开发设置 -> 服务器域名，添加 `https://openrouter.ai` (生产环境建议使用自建后端代理，避免Key泄露)。

## 关键配置
- `miniprogram/utils/api.js`: 配置 `API_KEY` 和 `MODEL_NAME`。

## 测试报告
- 覆盖率: 核心工具类与API解析逻辑已覆盖。
- 性能: 首屏无复杂图片，加载速度快；使用 `lazyCodeLoading` 优化分包。

## 隐私合规
- 已在首页添加免责声明。
- 不收集敏感生物特征。
- 仅本地存储用户昵称与生日。
