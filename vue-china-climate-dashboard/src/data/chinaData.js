// 中国省份舆情热度数据
export const chinaProvinceData = [
  { name: '北京', value: 189, trend: 12.5 },
  { name: '上海', value: 175, trend: 8.3 },
  { name: '广东', value: 168, trend: 15.2 },
  { name: '江苏', value: 156, trend: 6.7 },
  { name: '浙江', value: 142, trend: 9.8 },
  { name: '山东', value: 138, trend: 4.2 },
  { name: '河南', value: 125, trend: 7.1 },
  { name: '四川', value: 118, trend: 11.3 },
  { name: '湖北', value: 112, trend: 5.9 },
  { name: '河北', value: 108, trend: 3.4 },
  { name: '湖南', value: 105, trend: 8.7 },
  { name: '安徽', value: 98, trend: 6.2 },
  { name: '福建', value: 95, trend: 10.1 },
  { name: '江西', value: 89, trend: 4.8 },
  { name: '陕西', value: 87, trend: 7.5 },
  { name: '重庆', value: 84, trend: 9.2 },
  { name: '山西', value: 78, trend: 2.1 },
  { name: '辽宁', value: 76, trend: 5.6 },
  { name: '吉林', value: 67, trend: 3.8 },
  { name: '黑龙江', value: 65, trend: 4.3 },
  { name: '内蒙古', value: 62, trend: 6.9 },
  { name: '广西', value: 58, trend: 8.1 },
  { name: '贵州', value: 54, trend: 12.7 },
  { name: '云南', value: 52, trend: 9.4 },
  { name: '新疆', value: 48, trend: 5.2 },
  { name: '甘肃', value: 45, trend: 3.6 },
  { name: '海南', value: 42, trend: 14.8 },
  { name: '宁夏', value: 38, trend: 7.3 },
  { name: '青海', value: 35, trend: 4.7 },
  { name: '西藏', value: 32, trend: 6.1 },
  { name: '天津', value: 95, trend: 8.9 },
  { name: '香港', value: 78, trend: 11.2 },
  { name: '澳门', value: 23, trend: 15.6 },
  { name: '台湾', value: 89, trend: 7.8 }
];

// 热点主题数据
export const hotTopics = [
  {
    name: '碳中和',
    heat: 92,
    discussions: '32.4k',
    sentiment: { positive: 32, neutral: 38, negative: 30 },
    trend: 12.5,
    category: 'policy'
  },
  {
    name: '极端高温',
    heat: 87,
    discussions: '28.7k',
    sentiment: { positive: 15, neutral: 25, negative: 60 },
    trend: 23.2,
    category: 'weather'
  },
  {
    name: '碳关税',
    heat: 79,
    discussions: '21.3k',
    sentiment: { positive: 20, neutral: 25, negative: 55 },
    trend: 8.7,
    category: 'trade'
  },
  {
    name: '新能源汽车',
    heat: 76,
    discussions: '19.8k',
    sentiment: { positive: 45, neutral: 35, negative: 20 },
    trend: 18.3,
    category: 'technology'
  },
  {
    name: '环保政策',
    heat: 72,
    discussions: '17.6k',
    sentiment: { positive: 38, neutral: 42, negative: 20 },
    trend: 6.9,
    category: 'policy'
  }
];

// 时间趋势数据
export const timeTrendData = {
  labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
  datasets: [
    {
      label: '全国舆情数量',
      data: [1200, 1900, 1700, 2100, 2500, 2300, 2800],
      borderColor: '#165DFF',
      backgroundColor: 'rgba(22, 93, 255, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: '积极情感',
      data: [320, 450, 380, 520, 625, 575, 700],
      borderColor: '#00B42A',
      backgroundColor: 'rgba(0, 180, 42, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: '消极情感',
      data: [540, 855, 765, 945, 1125, 1035, 1260],
      borderColor: '#F53F3F',
      backgroundColor: 'rgba(245, 63, 63, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
};

// 当前概览统计数据
export const overviewStats = {
  totalSentiment: 128543,
  dailyGrowth: 12.5,
  sentimentDistribution: {
    negative: 45,
    neutral: 30,
    positive: 25
  },
  topRegions: [
    { name: '北京', progress: 85, color: 'danger' },
    { name: '上海', progress: 72, color: 'warning' },
    { name: '广东', progress: 65, color: 'primary' }
  ]
};