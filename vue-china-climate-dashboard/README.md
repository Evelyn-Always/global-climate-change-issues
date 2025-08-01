# 中国气候变化舆情分析平台

## 项目概述

本项目是一个基于 Vue3 + Vite + TailwindCSS + ECharts 构建的中国气候变化舆情分析平台。该平台将原有的全球视角转为专注于中国全国和各省份粒度的气候变化舆情监控与分析。

## 主要特性

- 🗺️ **中国地图可视化** - 展示全国各省份气候舆情热度分布
- 📊 **实时数据概览** - 舆情总量、情感分布、热点话题统计
- 📈 **趋势分析** - 时间序列趋势图表和情感倾向分布
- 🔥 **热点追踪** - 实时热点话题和新闻聚合
- 🎯 **省份聚焦** - 所有数据和分析聚焦中国各省市地区
- 📱 **响应式设计** - 支持桌面端和移动端访问
- 🌙 **深色主题** - 现代化的深色界面设计

## 技术栈

- **前端框架**: Vue 3.x
- **构建工具**: Vite 7.x
- **样式框架**: TailwindCSS 3.x
- **图表库**: ECharts 5.x
- **字体图标**: Font Awesome 4.x

## 项目结构

```
vue-china-climate-dashboard/
├── public/                 # 静态资源
├── src/
│   ├── components/         # Vue 组件
│   │   ├── SidebarComponent.vue      # 侧边栏导航
│   │   ├── HeaderComponent.vue       # 顶部标题栏
│   │   ├── DashboardOverview.vue     # 数据概览主页
│   │   ├── ChinaMapComponent.vue     # 中国地图组件
│   │   ├── StatsCard.vue            # 统计卡片
│   │   ├── SentimentCard.vue        # 情感分布卡片
│   │   ├── HotTopicsCard.vue        # 热点话题卡片
│   │   ├── RegionsCard.vue          # 热点地区卡片
│   │   ├── TrendChartComponent.vue   # 趋势图表
│   │   ├── SentimentDistributionComponent.vue # 情感分布图
│   │   └── HotNewsComponent.vue     # 热点新闻组件
│   ├── data/
│   │   └── chinaData.js            # 中国省份数据和模拟数据
│   ├── assets/
│   │   └── style.css               # 全局样式
│   ├── App.vue                     # 主应用组件
│   └── main.js                     # 应用入口
├── index.html                      # HTML 模板
├── vite.config.js                  # Vite 配置
├── tailwind.config.js              # TailwindCSS 配置
├── postcss.config.js               # PostCSS 配置
└── package.json                    # 项目依赖
```

## 主要功能模块

### 1. 数据概览 (DashboardOverview)
- 实时舆情总量统计
- 情感倾向分布（积极/中立/消极）
- 当日热点话题展示
- 全国热点地区排行
- 中国地图热力图
- 舆情趋势图表
- 最新热点文本列表

### 2. 导航功能
- 数据概览
- 时间趋势分析
- 主题分析
- 预警中心
- 气候时间线
- 新闻政策
- 用户讨论
- 数据分享
- AI预测

### 3. 数据过滤
- 地区筛选：全国/华北/华东/华南/华中/西北/西南/东北
- 时间范围：近7天/30天/90天/1年/全部
- 高级筛选和数据刷新功能

## 安装与运行

### 环境要求
- Node.js >= 16.x
- npm >= 8.x

### 安装依赖
```bash
cd vue-china-climate-dashboard
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3000

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 数据说明

### 省份数据结构
```javascript
{
  name: '北京',        // 省份名称
  value: 189,          // 舆情热度值
  trend: 12.5          // 增长趋势百分比
}
```

### 热点话题数据
```javascript
{
  name: '碳中和',                    // 话题名称
  heat: 92,                         // 热度值
  discussions: '32.4k',             // 讨论数量
  sentiment: {                      // 情感分布
    positive: 32, 
    neutral: 38, 
    negative: 30
  },
  trend: 12.5,                      // 增长趋势
  category: 'policy'                // 分类
}
```

## 与原版对比

### 主要改进
1. **地理范围**: 从全球视角改为中国国内视角
2. **数据粒度**: 从国家/大洲级别改为省份级别
3. **技术栈**: 从传统HTML改为现代Vue3组件化架构
4. **地图可视化**: 从世界地图改为中国地图
5. **数据内容**: 所有示例数据聚焦中国国内气候事件

### 保持特性
- 深色主题设计风格
- 响应式布局
- 丰富的图表可视化
- 完整的功能模块划分

## 开发指南

### 添加新组件
1. 在 `src/components/` 目录下创建 `.vue` 文件
2. 在需要的父组件中导入并注册
3. 更新相关数据文件

### 修改数据
- 编辑 `src/data/chinaData.js` 文件
- 按照现有数据结构添加或修改省份数据

### 样式定制
- 修改 `tailwind.config.js` 中的主题配置
- 在 `src/assets/style.css` 中添加自定义样式

## 后续开发计划

- [ ] 集成真实数据API
- [ ] 完善其他功能模块页面
- [ ] 添加用户权限管理
- [ ] 优化移动端体验
- [ ] 添加数据导出功能
- [ ] 实现实时数据推送

## 许可证

ISC License

## 联系方式

如有问题或建议，请联系项目维护者。