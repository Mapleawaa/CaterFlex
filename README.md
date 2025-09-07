# CaterFlex

餐饮行业灵活用工小程序平台 - Flexible employment mini program platform for the catering industry

<div align="center">

![License](https://img.shields.io/badge/License-GPL%20v3-blue.svg)
![Platform](https://img.shields.io/badge/Platform-WeChat%20MiniProgram-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)
![Redis](https://img.shields.io/badge/Redis-7%2B-red.svg)

</div>

!!! ERROR 该项目目前处于开发阶段
      程序目前处于仅前端实现交互，后端服务器还未开始开发。
      详细信息请查看[更新日志](#更新日志)章节

一个基于微信小程序开发的综合性应用，提供用户管理、工作管理、考勤管理等功能。

## 项目简介

本项目是一个功能完整的微信小程序，包含以下主要功能模块：

- 🔐 用户认证与授权
- 👤 个人信息管理
- 💼 工作岗位管理
- 📊 考勤记录管理
- 🏢 企业信息管理
- 📋 订单管理系统
- 💰 薪资管理
- 🎓 证书管理
- ⚙️ 系统设置

## 技术栈

- **前端框架**: 微信小程序原生开发
- **UI组件库**: TDesign Mini Program
- **开发语言**: TypeScript
- **构建工具**: 微信开发者工具
- **代码规范**: ESLint + TypeScript

## 项目结构

```
Work/
├── components/          # 公共组件
├── pages/              # 页面文件
│   ├── index/          # 首页
│   ├── login/          # 登录页
│   ├── profile/        # 个人中心
│   ├── jobs/           # 工作管理
│   ├── checkin/        # 考勤打卡
│   ├── company/        # 企业管理
│   └── ...            # 其他页面
├── utils/              # 工具函数
├── assets/             # 静态资源
│   ├── icons/          # 图标文件
│   └── images/         # 图片资源
├── Documents/          # 项目文档
└── mock/              # 模拟数据
```

## 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd Work
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发环境运行**
   - 使用微信开发者工具打开项目根目录
   - 配置小程序AppID
   - 点击编译运行

### Docker 预览环境

我们提供了Docker Compose配置，方便快速搭建预览环境：

1. **启动预览环境**
   ```bash
   docker-compose -f docker-compose.preview.yml up -d
   ```

2. **服务说明**
   - `miniprogram-preview`: 小程序预览服务 (端口: 3000, 9090)
   - `mock-api`: 模拟API服务 (端口: 8080)
   - `database`: MySQL数据库 (端口: 3306)
   - `redis`: Redis缓存 (端口: 6379)
   - `minio`: 文件存储服务 (端口: 9000, 9001)

3. **访问服务**
   - API文档: http://localhost:8080
   - 文件管理: http://localhost:9001 (用户名: minioadmin, 密码: minioadmin123)

4. **停止服务**
   ```bash
   docker-compose -f docker-compose.preview.yml down
   ```

## 开发指南

### 代码规范

项目使用ESLint和TypeScript进行代码规范检查：

```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix
```

### 目录规范

- `pages/`: 页面文件，每个页面包含 `.wxml`, `.wxss`, `.ts`, `.json` 文件
- `components/`: 自定义组件，结构与页面类似
- `utils/`: 工具函数和公共方法
- `assets/`: 静态资源文件

### 开发流程

1. 创建功能分支
2. 开发新功能或修复bug
3. 运行代码检查
4. 提交代码并创建Pull Request
5. 代码审查通过后合并

## 部署说明

### 小程序发布

1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 登录微信公众平台提交审核
4. 审核通过后发布上线

### 环境配置

不同环境需要配置相应的API地址和小程序配置：

- **开发环境**: 本地开发服务器
- **测试环境**: 测试服务器API
- **生产环境**: 正式服务器API

## 贡献指南

欢迎提交Issue和Pull Request来改进项目。

### 提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 许可证

本项目采用 [GNU General Public License v3.0](LICENSE) 开源协议。

## 联系我们

- **公司**: 上海溯维科技有限公司 (Shanghai Sovitx Co., Ltd)
- **作者**: Cyrenes
- **邮箱**: contact@sovitx.com
- **官网**: https://www.sovitx.com

## 更新日志

> ⚠️ **注意**: 请查看[更新日志](#更新日志)章节获取最新版本信息
> 
> 🔔 **提示**: 详细的版本变更记录请跳转到[更新日志](#更新日志)查看

### v1.0.0 (2025-09-07)
- 初始版本发布
- 基础功能模块完成
- 用户认证和个人信息管理
- 工作和考勤管理功能

---

© 2024 上海溯维科技有限公司 (Shanghai Sovitx Co., Ltd). All rights reserved.