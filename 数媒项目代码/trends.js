/* 高级版 时间趋势页面逻辑重写
 * 主要模块：
 *  - Utilities
 *  - DataService (可切换真实后端)
 *  - UIState
 *  - KPIAnimator
 *  - ChartManager
 *  - Exporter
 *  - Bootstrap
 * Author: AI Rebuild v2
 */
(function(){

  /* ---------------- Utilities ---------------- */
  const $ = (sel, root=document)=>root.querySelector(sel);
  const $$ = (sel, root=document)=>Array.from(root.querySelectorAll(sel));

  const raf = window.requestAnimationFrame.bind(window);
  const now = ()=> performance.now();

  function formatNumber(num){
    if(num==null || isNaN(num)) return '--';
    if(num >= 10000) return (num/10000).toFixed(2)+'万';
    return num.toLocaleString();
  }

  function signature(obj){
    return Object.keys(obj).sort().map(k=>`${k}:${Array.isArray(obj[k])?obj[k].join('|'):obj[k]}`).join(';');
  }

  function debounce(fn, delay=160){
    let t; return function(...args){
      clearTimeout(t); t=setTimeout(()=>fn.apply(this,args),delay);
    };
  }

  function clamp(v,min,max){ return v<min?min:(v>max?max:v); }

  function toast(msg, type='info'){
    const root = $('#toast-root'); if(!root) return;
    const el = document.createElement('div');
    el.className = `pointer-events-auto px-4 py-2 rounded-md text-sm text-white shadow-lg ${type==='error'?'bg-rose-600/90':type==='success'?'bg-emerald-600/90':'bg-slate-700/90'} fade-in-toast`;
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(-6px)'; }, 2300);
    setTimeout(()=> root.contains(el)&&root.removeChild(el), 3000);
  }

  /* --------------- Data Service --------------- */
  const DataService = (function(){
    let cache = new Map();

    function mockGenerate(filters){
      // 可复现随机：seed 由 rangeDays+province 首字符+topics hash
      const seedBase = filters.rangeDays + (filters.province?filters.province.charCodeAt(0):0) + filters.topics.join('').split('').reduce((a,c)=>a+c.charCodeAt(0),0);
      let seed = (seedBase*9301+49297)%233280;
      const rand = ()=>((seed = (seed*9301+49297)%233280)/233280);

      const end = dayjs().endOf('day');
      const points = [];
      const gran = filters.granularity;
      const rangeDays = filters.rangeDays;
      const stepUnit = gran;
      const start = end.subtract(rangeDays-1,'day');
      function addUnit(dt){
        if(stepUnit==='day') return dt.add(1,'day');
        if(stepUnit==='week') return dt.add(1,'week');
        return dt.add(1,'month');
      }
      function startUnit(dt){
        if(stepUnit==='day') return dt.startOf('day');
        if(stepUnit==='week') return dt.startOf('week');
        return dt.startOf('month');
      }
      let t = startUnit(start);
      while(t.isBefore(end) || t.isSame(end, stepUnit)){
        points.push(t); t = addUnit(t);
      }

      const labels = points.map(p=>
        stepUnit==='day' ? p.format('MM-DD') :
        stepUnit==='week'? `W${Math.ceil(p.date()/7)} ${p.format('MM-DD')}` :
        p.format('YYYY-MM')
      );

      const topicNameMap = {
        policy:'政策文件', risk:'风险应对', energy:'能源电力',
        data:'数据核查', city:'城市建设', eco:'生态与资源'
      };
      const allTopics = Object.keys(topicNameMap);
      const topicSeries = {};
      allTopics.forEach(k=>{
        topicSeries[k] = points.map((_,i)=>{
          const base = 40 + 28*Math.sin(i / points.length * Math.PI * 2 + rand()*1.2);
            const vol = 12*Math.sin(i*0.45 + rand()) + 8*Math.cos(i*0.25 + rand());
          const prov = filters.province ? 10 + rand()*18 : 0;
          const noise = rand()*30;
          return Math.max(0, Math.round(base + vol + prov + noise));
        });
      });

      const totalSeries = points.map((_,i)=> filters.topics.reduce((s,k)=> s + topicSeries[k][i],0));

      // 移动平均（周期 = 7 data points，最少3个）
      const maWindow = Math.min(7, Math.max(3, Math.round(points.length/4)));
      const movingAvg = totalSeries.map((_,i)=>{
        const startIdx = Math.max(0, i-maWindow+1);
        const slice = totalSeries.slice(startIdx,i+1);
        return Math.round(slice.reduce((a,b)=>a+b,0)/slice.length);
      });

      const pos = Math.round(25 + rand()*35);
      const neg = Math.round(18 + rand()*25);
      const neu = Math.max(0,100 - pos - neg);

      // 来源（模拟更丰富 + 长尾裁剪）
      const domainPool = ['people.cn','xinhuanet.com','mnr.gov.cn','nea.gov.cn','news.cn','china.com.cn','ce.cn','gov.cn','paper.cn','ifeng.com','cctv.com','economy.cn','stats.gov.cn'];
      const sourcesRaw = domainPool.map(d=>({
        name:d,
        value: Math.round(60 + rand()*260)
      })).sort((a,b)=>b.value-a.value);
      const sources = sourcesRaw.slice(0,10);
      const sourceTotal = sources.reduce((s,v)=>s+v.value,0);
      sources.forEach(s=> s.percent = +(s.value/sourceTotal*100).toFixed(2));

      // 词云：按权重过滤后再排序
      const baseWords = ['碳中和','极端天气','能源转型','新能源','海平面上升','减排','碳交易','风电','光伏','洪涝','干旱','森林火灾','湿地','低碳城市','绿色金融','污染治理','气候大会','应急预案','生态修复','海洋保护','气候模型','温室气体','碳捕集','自然灾害','甲烷减排','适应策略','生物多样性','碳汇','农田管理','负排放'];
      const wordcloudRaw = baseWords.map(w=>({ name:w, value: 12 + Math.round(rand()*200) }));
      const wordcloud = wordcloudRaw; // 初始不过滤

      // 日历 / 月汇总
      const calendarDataDaily = [];
      for(let i=0;i<rangeDays;i++){
        const d = end.subtract(i,'day');
        const val = 20 + Math.round(rand()*320);
        calendarDataDaily.push([d.format('YYYY-MM-DD'), val]);
      }
      calendarDataDaily.reverse();

      // 如果范围太大 -> 按月聚合
      let calendarMode = 'day';
      let calendarData = calendarDataDaily;
      if(rangeDays > 120){
        calendarMode='month';
        const byMonth = {};
        calendarDataDaily.forEach(([date,v])=>{
          const m = date.slice(0,7);
          byMonth[m] = byMonth[m] || { sum:0, count:0 };
          byMonth[m].sum += v; byMonth[m].count++;
        });
        calendarData = Object.keys(byMonth).sort().map(m=>[m+'-01', Math.round(byMonth[m].sum/byMonth[m].count)]);
      }

      // 峰值
      const peakVal = Math.max(...totalSeries);
      const peakIdx = totalSeries.indexOf(peakVal);
      const peakDate = points[peakIdx].format('YYYY-MM-DD');

      return {
        filters,
        labels,
        points,
        topicNameMap,
        topicSeries,
        totalSeries,
        movingAvg,
        sources,
        wordcloud,
        calendar: { mode:calendarMode, data:calendarData },
        sentiment: { pos, neg, neu },
        kpi: {
          total: totalSeries.reduce((s,v)=>s+v,0),
          daily: Math.round(totalSeries.reduce((s,v)=>s+v,0) / totalSeries.length),
          pos, neg, peakDate, peakVal
        }
      };
    }

    // 占位：真实接口（返回 Promise<同结构>）
    async function fetchRealData(filters, signal){
      // 你可直接在此替换成真实 fetch 调用
      // return fetch('/api/trend', {...})
      // 这里仍用 mock，但加一个最小加载延迟
      await new Promise(r=>setTimeout(r, 250 + Math.random()*200));
      return mockGenerate(filters);
    }

    async function getData(filters){
      const key = signature(filters);
      if(cache.has(key)) return cache.get(key);
      const ac = new AbortController();
      const p = fetchRealData(filters, ac.signal).catch(err=>{
        if(err.name==='AbortError') return Promise.reject(err);
        console.error('[DataService] error:', err);
        throw err;
      });
      cache.set(key,p);
      return p;
    }

    return {
      getData,
      clearCache(){ cache.clear(); }
    };
  })();

  /* --------------- UI State --------------- */
  const UIState = {
    rangeDays: 7,
    granularity: 'day',
    topics: ['policy','risk','energy','data','city','eco'],
    province: '',
    autoRefreshSec: 0,
    wordMin: 0, // 词云最小值过滤
    getFilters(){
      return {
        rangeDays:this.rangeDays,
        granularity:this.granularity,
        topics:[...this.topics],
        province:this.province
      };
    }
  };

  /* --------------- KPI Animator --------------- */
  const KPIAnimator = (function(){
    function animateNumber(el, to){
      if(!el) return;
      const from = parseInt(el.dataset.val||'0',10) || 0;
      const target = to;
      const dur = 520;
      const start = now();
      function frame(){
        const t = (now()-start)/dur;
        if(t>=1){
          el.textContent = formatNumber(target);
          el.dataset.val = target;
          return;
        }
        const cur = Math.round(from + (target - from)*(0.5 - Math.cos(Math.PI*t)/2)); // easeInOut
        el.textContent = formatNumber(cur);
        raf(frame);
      }
      raf(frame);
    }
    return { animateNumber };
  })();

  /* --------------- Charts --------------- */
  const ChartManager = (function(){
    const charts = {};
    let brushSyncLock = false;

    function initAll(){
      initTrend();
      initTopic();
      initSources();
      initWordcloud();
      initCalendar();
      injectDynamicControls();
      window.addEventListener('resize', debounce(resizeAll, 120));
    }

    function resizeAll(){
      Object.values(charts).forEach(c=> c && c.resize());
    }

    function baseColors(){
      return ['#00F2FE','#4FACFE','#16BFFD','#A78BFA','#FF2D75','#00C9A7'];
    }

    function initTrend(){
      const el = $('#chart-trend'); if(!el) return;
      charts.trend = echarts.init(el,'dark');
      charts.trend.setOption({
        backgroundColor:'transparent',
        grid:{ left:48, right:28, top:36, bottom:72 },
        tooltip:{ trigger:'axis', axisPointer:{ type:'cross' } },
        legend:{ top:6, right:16, textStyle:{ color:'#9ADCFB' } },
        dataZoom:[
          { type:'inside', xAxisIndex:0 },
          { type:'slider', bottom:20, height:14 }
        ],
        toolbox:{
          feature:{
            brush:{ type:['rect','clear'] }
          },
          right:90
        },
        brush:{
          xAxisIndex:'all',
          brushLink:'all',
          throttleType:'debounce',
          throttleDelay: 300
        },
        xAxis:{ type:'category', boundaryGap:false, data:[], axisLabel:{ color:'#9ADCFB' }, axisLine:{ lineStyle:{ color:'#26455A' } } },
        yAxis:{ type:'value', axisLabel:{ color:'#9ADCFB' }, splitLine:{ lineStyle:{ color:'rgba(50,90,120,0.2)', type:'dashed' } } },
        series:[
          { name:'总量', type:'line', smooth:true, showSymbol:false,
            lineStyle:{ width:2, color:'#00F2FE' },
            areaStyle:{ color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0,242,254,0.25)'},{offset:1,color:'rgba(0,0,0,0)'}]) },
            data:[] },
          { name:'移动平均', type:'line', smooth:true, showSymbol:false,
            lineStyle:{ width:1.8, color:'#FFD700', type:'dashed' },
            data:[], emphasis:{ focus:'series'} }
        ]
      });

      charts.trend.on('brushSelected', params=>{
        if(brushSyncLock) return;
        const areas = params.areas;
        if(!areas.length){ charts.topic?.dispatchAction({ type:'dataZoom', start:0,end:100 }); return; }
        const area = areas[0];
        if(area.brushType!=='rect') return;
        const range = area.coordRange;
        if(range && charts.topic){
          const [startLabel,endLabel] = range;
          const opt = charts.trend.getOption();
          const labels = opt.xAxis[0].data;
          const startIdx = labels.indexOf(startLabel);
          const endIdx = labels.indexOf(endLabel);
          if(startIdx>-1 && endIdx>-1){
            brushSyncLock = true;
            const percentStart = startIdx/(labels.length-1)*100;
            const percentEnd = endIdx/(labels.length-1)*100;
            charts.topic.dispatchAction({ type:'dataZoom', start:percentStart, end:percentEnd });
            setTimeout(()=> brushSyncLock=false, 200);
          }
        }
      });
    }

    function initTopic(){
      const el = $('#chart-topic'); if(!el) return;
      charts.topic = echarts.init(el,'dark');
      charts.topic.setOption({
        backgroundColor:'transparent',
        grid:{ left:48, right:28, top:50, bottom:52 },
        legend:{ top:6, right:12, textStyle:{ color:'#9ADCFB', fontSize:11 } },
        tooltip:{
          trigger:'axis',
          axisPointer:{ type:'shadow' },
          formatter(params){
            const total = params.reduce((s,p)=> s + (p.value||0),0);
            return params.map(p=>{
              const pct = total? ((p.value/total)*100).toFixed(1):'0.0';
              return `<span style="display:inline-block;margin-right:6px;width:9px;height:9px;border-radius:50%;background:${p.color};"></span>${p.seriesName}: <b>${p.value}</b> (${pct}%)`;
            }).join('<br/>') + `<br/><hr style="border:none;border-top:1px solid #224;"><span>小计：<b>${total}</b></span>`;
          }
        },
        xAxis:{ type:'category', boundaryGap:false, data:[], axisLabel:{ color:'#9ADCFB' }, axisLine:{ lineStyle:{ color:'#26455A' } } },
        yAxis:{ type:'value', axisLabel:{ color:'#9ADCFB' }, splitLine:{ lineStyle:{ color:'rgba(50,90,120,0.2)', type:'dashed' } } },
        dataZoom:[ { type:'inside' }, { type:'slider', bottom:12, height:14 } ],
        series:[]
      });
    }

    function initSources(){
      const el = $('#chart-sources'); if(!el) return;
      charts.sources = echarts.init(el,'dark');
      charts.sources.setOption({
        backgroundColor:'transparent',
        grid:{ left:140, right:24, top:30, bottom:30 },
        xAxis:{ type:'value', axisLabel:{ color:'#9ADCFB' }, splitLine:{ lineStyle:{ color:'rgba(60,100,140,0.15)', type:'dashed' } } },
        yAxis:{ type:'category', data:[], axisLabel:{ color:'#C9F0FF' }, axisLine:{ lineStyle:{ color:'#26455A' } } },
        tooltip:{ trigger:'item', formatter(p){
          const d = p.data;
          return `${p.name}<br/>量: <b>${d.value}</b><br/>占比: <b>${d.percent||0}%</b>`;
        }},
        series:[{
          type:'bar',
          barWidth:16,
          itemStyle:{
            borderRadius:[6,6,6,6],
            color:(params)=>{
              const c = ['#00F2FE','#4FACFE','#16BFFD','#A78BFA','#FF2D75','#00C9A7','#F6C343','#6EE7B7','#F472B6','#60A5FA'];
              return new echarts.graphic.LinearGradient(0,0,1,0,[
                { offset:0, color:c[params.dataIndex%c.length] },
                { offset:1, color:'#0B1D2D' }
              ]);
            },
            shadowBlur:8, shadowColor:'rgba(0,242,254,0.25)'
          },
          label:{ show:true, position:'right', formatter:(p)=>`${p.data.value} (${p.data.percent}%)`, color:'#E7FAFF', fontSize:11 },
          data:[]
        }]
      });
    }

    function initWordcloud(){
      const el = $('#chart-wordcloud'); if(!el) return;
      charts.wordcloud = echarts.init(el,'dark');
      charts.wordcloud.setOption({
        backgroundColor:'transparent',
        tooltip:{},
        series:[{
          type:'wordCloud',
          gridSize: 6,
          sizeRange:[12,48],
          rotationRange:[0,0],
          shape:'circle',
          width:'100%',
          height:'100%',
          drawOutOfBound:false,
          textStyle:{
            color: ()=> {
              const palette = ['#00F2FE','#4FACFE','#16BFFD','#A78BFA','#FF2D75','#00C9A7','#F6C343'];
              return palette[Math.floor(Math.random()*palette.length)];
            },
            shadowBlur:8,
            shadowColor:'rgba(0,0,0,0.35)'
          },
          data:[]
        }]
      });
    }

    function initCalendar(){
      const el = $('#chart-calendar'); if(!el) return;
      charts.calendar = echarts.init(el,'dark');
      charts.calendar.setOption({
        backgroundColor:'transparent',
        tooltip:{ formatter:(p)=> `${p.data[0]}<br/>热度：<b>${p.data[1]}</b>` },
        visualMap:{
          min:0, max:350, orient:'horizontal', left:'center', bottom:6,
          inRange:{ color:['#0b1220','#0F3C63','#00A3C4','#00F2FE'] },
          textStyle:{ color:'#9ADCFB' }
        },
        calendar:{
          top:24, left:20, right:20, bottom:60,
          cellSize:[20,'auto'],
          range: dayjs().format('YYYY'),
          splitLine:{ lineStyle:{ color:'rgba(50,90,120,0.25)' } },
          itemStyle:{ color:'#0b1220', borderColor:'rgba(50,90,120,0.25)' },
          dayLabel:{ color:'#9ADCFB' },
          monthLabel:{ color:'#9ADCFB' },
          yearLabel:{ color:'#9ADCFB' }
        },
        series:[{ type:'heatmap', coordinateSystem:'calendar', data:[] }]
      });
    }

    /* 动态额外控制按钮（用 JS 注入，避免改 HTML） */
    function injectDynamicControls(){
      // 主趋势：移动平均显隐
      const trendPanel = $('#chart-trend')?.closest('.neo-panel')?.querySelector('.panel-head .panel-actions');
      if(trendPanel && !trendPanel.querySelector('[data-toggle-ma]')){
        const btn = document.createElement('button');
        btn.className='icon-btn'; btn.setAttribute('data-toggle-ma','on');
        btn.innerHTML='<i class="fa fa-wave-square"></i>';
        btn.title='切换移动平均';
        trendPanel.insertBefore(btn, trendPanel.firstChild);
      }
      // 主题堆叠：切换面积/柱
      const topicPanel = $('#chart-topic')?.closest('.neo-panel')?.querySelector('.panel-head .panel-actions');
      if(topicPanel && !topicPanel.querySelector('[data-toggle-topic-mode]')){
        const btn = document.createElement('button');
        btn.className='icon-btn'; btn.dataset.toggleTopicMode='area';
        btn.innerHTML='<i class="fa fa-exchange"></i>';
        btn.title='切换堆叠模式(面积/柱状)';
        topicPanel.insertBefore(btn, topicPanel.firstChild);
      }
      // 词云：最小值过滤 slider
      const wcPanel = $('#chart-wordcloud')?.closest('.neo-panel');
      if(wcPanel && !wcPanel.querySelector('.wc-filter')){
        const bar = document.createElement('div');
        bar.className='wc-filter flex items-center gap-2 px-3 py-2 text-[11px] text-cyan-200/80';
        bar.innerHTML = '<span>词频过滤</span><input id="wc-min" type="range" min="0" max="150" value="0" class="flex-1"><span id="wc-min-val">0</span>';
        wcPanel.appendChild(bar);
        $('#wc-min').addEventListener('input', debounce(e=>{
          UIState.wordMin = +e.target.value;
          $('#wc-min-val').textContent = UIState.wordMin;
          refreshWordcloudFilter();
        },60));
      }
      // 来源：排序切换
      const srcPanel = $('#chart-sources')?.closest('.neo-panel')?.querySelector('.panel-head .panel-actions');
      if(srcPanel && !srcPanel.querySelector('[data-source-sort]')){
        const btn = document.createElement('button');
        btn.className='icon-btn'; btn.dataset.sourceSort='value';
        btn.innerHTML='<i class="fa fa-sort-alpha-asc"></i>';
        btn.title='切换排序 (数值/字母)';
        srcPanel.insertBefore(btn, srcPanel.firstChild);
      }
    }

    function refreshTrend(data){
      if(!charts.trend) return;
      const opt = charts.trend.getOption();
      const showMA = opt.series && opt.series[1] && opt.series[1].show !== false;
      charts.trend.setOption({
        xAxis:{ data:data.labels },
        series:[
          { name:'总量', data:data.totalSeries,
            markPoint:{ data:[{ type:'max', name:'峰值' }], symbol:'circle', symbolSize:12,
              itemStyle:{ color:'#FFD700', borderColor:'#fff', borderWidth:1 },
              label:{ formatter:(p)=>`峰值\n${p.value}` } }
          },
          { name:'移动平均', data: data.movingAvg, show: showMA }
        ]
      });
    }

    function refreshTopic(data){
      if(!charts.topic) return;
      const colors = baseColors();
      const mode = charts.topic.__mode || 'area';
      const series = UIState.topics.map((k,i)=>{
        const common = {
          name:data.topicNameMap[k],
          type: mode==='area'?'line':'bar',
          emphasis:{ focus:'series' }
        };
        if(mode==='area'){
            return {
              ...common,
              smooth:true,
              showSymbol:false,
              stack:'T',
              lineStyle:{ width:1.4, color: colors[i%colors.length] },
              areaStyle:{ color:new echarts.graphic.LinearGradient(0,0,0,1,[
                {offset:0,color:colors[i%colors.length]+'55'},
                {offset:1,color:'transparent'}
              ])},
              data:data.topicSeries[k]
            };
        }else{
          return {
            ...common,
            stack:'T',
            barWidth:16,
            itemStyle:{ color:colors[i%colors.length] },
            data:data.topicSeries[k]
          };
        }
      });
      charts.topic.setOption({
        xAxis:{ data:data.labels },
        legend:{ data: UIState.topics.map(k=>data.topicNameMap[k]) },
        series
      });
    }

    function refreshSources(data, sortMode='value'){
      if(!charts.sources) return;
      let arr = [...data.sources];
      if(sortMode==='alpha'){
        arr.sort((a,b)=> a.name.localeCompare(b.name));
      }else{
        arr.sort((a,b)=> a.value-b.value);
      }
      charts.sources.setOption({
        yAxis:{ data: arr.map(s=>s.name) },
        series:[{ data: arr.map(s=>({ value:s.value, percent:s.percent })) }]
      });
    }

    function refreshWordcloud(data){
      if(!charts.wordcloud) return;
      // 初始应用过滤
      const filtered = data.wordcloud.filter(w=> w.value >= UIState.wordMin);
      charts.wordcloud.setOption({ series:[{ data: filtered }] });
    }

    function refreshWordcloudFilter(){
      // 使用现有 option 数据 & 重新过滤
      if(!charts.wordcloud) return;
      const opt = charts.wordcloud.getOption();
      const original = (opt.series?.[0]?.dataRaw) || opt.series?.[0]?.data || [];
      const use = original.filter(w=> w.value >= UIState.wordMin);
      charts.wordcloud.setOption({ series:[{ data: use }] });
    }

    function refreshCalendar(data){
      if(!charts.calendar) return;
      const mode = data.calendar.mode;
      if(mode==='month'){
        charts.calendar.setOption({
          calendar:{ range: dayjs().format('YYYY') },
          series:[{ data: data.calendar.data }]
        });
      }else{
        charts.calendar.setOption({
          calendar:{ range: dayjs().format('YYYY') },
          series:[{ data: data.calendar.data }]
        });
      }
    }

    function updateAll(data){
      refreshTrend(data);
      refreshTopic(data);
      refreshSources(data, charts.sources?.__sortMode || 'value');
      refreshWordcloud(data);
      refreshCalendar(data);
      // 把原始词云数据暂存（用于再次过滤）
      if(charts.wordcloud){
        const opt = charts.wordcloud.getOption();
        if(opt.series && opt.series[0]) opt.series[0].dataRaw = data.wordcloud;
      }
    }

    // 事件交互（动态按钮）
    document.addEventListener('click', e=>{
      const btnMA = e.target.closest('[data-toggle-ma]');
      if(btnMA && charts.trend){
        const opt = charts.trend.getOption();
        const curShow = opt.series[1].show !== false;
        charts.trend.setOption({ series:[{}, { show: !curShow }] });
        btnMA.classList.toggle('active-btn', !curShow);
        btnMA.title = !curShow? '关闭移动平均':'开启移动平均';
      }
      const btnTopic = e.target.closest('[data-toggle-topic-mode]');
      if(btnTopic && charts.topic){
        charts.topic.__mode = charts.topic.__mode==='bar' ? 'area' : 'bar';
        btnTopic.classList.toggle('active-btn', charts.topic.__mode==='bar');
        btnTopic.title = charts.topic.__mode==='bar' ? '切换为面积模式' : '切换为柱状模式';
        // 重新渲染数据（使用最近一次数据）
        const lastData = ChartManager._lastData;
        if(lastData) refreshTopic(lastData);
      }
      const btnSrcSort = e.target.closest('[data-source-sort]');
      if(btnSrcSort && charts.sources){
        charts.sources.__sortMode = charts.sources.__sortMode==='alpha' ? 'value' : 'alpha';
        btnSrcSort.classList.toggle('active-btn', charts.sources.__sortMode==='alpha');
        btnSrcSort.title = charts.sources.__sortMode==='alpha' ? '当前:字母排序(点击切回数值)' : '当前:数值排序(点击切换字母)';
        const lastData = ChartManager._lastData;
        if(lastData) refreshSources(lastData, charts.sources.__sortMode);
      }
    });

    return {
      initAll,
      updateAll,
      resizeAll,
      _lastData:null
    };
  })();

  /* --------------- Exporter --------------- */
  const Exporter = {
    exportCSV(data){
      if(!data) return;
      const rows = [];
      const header = ['时间','总量','移动平均', ...UIState.topics.map(k=>data.topicNameMap[k])];
      rows.push(header.join(','));
      data.labels.forEach((lab,i)=>{
        const line = [
          lab,
          data.totalSeries[i],
          data.movingAvg[i],
          ...UIState.topics.map(k=> data.topicSeries[k][i])
        ];
        rows.push(line.join(','));
      });
      const blob = new Blob(['\ufeff'+rows.join('\n')], { type:'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href=url; a.download=`趋势导出_${dayjs().format('YYYYMMDD_HHmm')}.csv`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }
  };

  /* --------------- Auto Refresh Manager --------------- */
  const AutoRefresh = (function(){
    let timer=null, remainSec=0, startTimestamp=0;

    function start(sec, cb){
      stop();
      if(!sec || sec<=0){ remainSec=0; return; }
      remainSec = sec;
      startTimestamp = Date.now();
      timer = setInterval(()=>{
        const elapsed = (Date.now()-startTimestamp)/1000;
        if(elapsed >= remainSec){
          cb && cb();
          startTimestamp = Date.now();
        }
      }, 1000);
    }
    function stop(){
      if(timer){ clearInterval(timer); timer=null; }
    }
    function pause(){
      if(!timer) return;
      const elapsed = (Date.now()-startTimestamp)/1000;
      remainSec = Math.max(1, remainSec - elapsed);
      stop();
    }
    function resume(cb){
      if(remainSec>0){
        start(remainSec, cb);
      }
    }
    return { start, stop, pause, resume };
  })();

  /* --------------- Main Controller --------------- */
  const Controller = (function(){
    let loading = false;
    let lastData = null;
    let previousPeriodData = null;

    function updateLoading(b){
      loading = b;
      $('#apply-filters')?.classList.toggle('opacity-60', b);
      $('#apply-filters')?.toggleAttribute('disabled', b);
    }

    async function loadAndRender({ reason='manual'}={}){
      if(loading) return;
      updateLoading(true);
      const filters = UIState.getFilters();
      try{
        const data = await DataService.getData(filters);
        // 计算上一期对比（只针对 total）
        const compareFilters = { ...filters, seedOffset:'prev' }; // seedOffset 不参与真实接口逻辑，仅作为示例
        previousPeriodData = await DataService.getData(compareFilters)
          .catch(()=>null); // 忽略错误
        lastData = data;
        ChartManager._lastData = data;
        renderKPI(data, previousPeriodData);
        ChartManager.updateAll(data);
        if(reason!=='auto') toast('数据更新完成', 'success');
      }catch(err){
        if(err.name!=='AbortError'){
          console.error('[loadAndRender]', err);
          toast('数据加载失败','error');
        }
      }finally{
        updateLoading(false);
      }
    }

    function renderKPI(cur, prev){
      KPIAnimator.animateNumber($('#kpi-total'), cur.kpi.total);
      KPIAnimator.animateNumber($('#kpi-daily'), cur.kpi.daily);
      $('#kpi-pos') && ($('#kpi-pos').textContent = cur.kpi.pos + '%');
      $('#kpi-neg') && ($('#kpi-neg').textContent = cur.kpi.neg + '%');
      $('#kpi-peak') && ($('#kpi-peak').textContent = cur.kpi.peakDate);

      // 额外 tooltip
      const peakEl = $('#kpi-peak');
      if(peakEl){
        peakEl.title = `峰值当天总量：${cur.kpi.peakVal}`;
      }

      // 同比 Δ (如果有 prev)
      if(prev && prev.kpi){
        const delta = cur.kpi.total - prev.kpi.total;
        let badge = $('#kpi-delta-badge');
        if(!badge){
          const parent = $('#kpi-total')?.parentElement;
          badge = document.createElement('div');
          badge.id='kpi-delta-badge';
          badge.className='absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded';
          parent && parent.appendChild(badge);
        }
        badge.textContent = (delta>=0?'+':'') + formatNumber(delta);
        badge.className = 'absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded ' +
            (delta>=0?'bg-emerald-600/30 text-emerald-300':'bg-rose-600/30 text-rose-300');
        badge.title = `与上一期（同天数区间）比较：${delta>=0? '增长':'下降'} ${Math.abs(delta)}`;
      }
      $('#last-updated') && ($('#last-updated').textContent = `更新于 ${dayjs().format('YYYY-MM-DD HH:mm')}`);
    }

    function bindUI(){
      // 时间范围
      $('#range-group')?.addEventListener('click', e=>{
        const btn = e.target.closest('button[data-range]'); if(!btn) return;
        $$('#range-group .chip').forEach(b=>{ b.classList.remove('chip-active'); b.removeAttribute('aria-pressed'); });
        btn.classList.add('chip-active'); btn.setAttribute('aria-pressed','true');
        UIState.rangeDays = +btn.dataset.range;
      });

      // 粒度
      $('#granularity')?.addEventListener('change', e=>{
        UIState.granularity = e.target.value;
      });

      // 主题多选
      $('#topic-group')?.addEventListener('change', ()=>{
        const checked = $$('#topic-group input[type="checkbox"]:checked').map(i=>i.value);
        if(checked.length) UIState.topics = checked;
      });

      // 省份
      $('#province')?.addEventListener('change', e=>{
        UIState.province = e.target.value || '';
      });

      // 应用
      $('#apply-filters')?.addEventListener('click', ()=>{
        DataService.clearCache();
        loadAndRender({reason:'manual'});
      });

      // 手动刷新
      $('#manual-refresh')?.addEventListener('click', ()=>{
        DataService.clearCache();
        loadAndRender({reason:'manual'});
      });

      // 自动刷新
      $('#auto-refresh')?.addEventListener('change', e=>{
        UIState.autoRefreshSec = +e.target.value;
        if(UIState.autoRefreshSec>0){
          AutoRefresh.start(UIState.autoRefreshSec, ()=> loadAndRender({reason:'auto'}));
          toast(`已开启自动刷新: 每 ${UIState.autoRefreshSec/60} 分钟`);
        }else{
          AutoRefresh.stop();
          toast('已关闭自动刷新');
        }
      });

      // 导出
      $('#export-csv')?.addEventListener('click', ()=>{
        if(ChartManager._lastData) Exporter.exportCSV(ChartManager._lastData);
        else toast('暂无数据可导出','error');
      });

      // 下载图片 / 全屏
      document.body.addEventListener('click', async e=>{
        const dlBtn = e.target.closest('[data-download]');
        if(dlBtn){
          const sel = dlBtn.getAttribute('data-download');
          const el = $(sel); if(!el){ toast('未找到图表', 'error'); return; }
          const chart = echarts.getInstanceByDom(el);
          if(!chart){ toast('图表尚未初始化', 'error'); return; }
          const url = chart.getDataURL({ pixelRatio:2, backgroundColor:'rgba(0,0,0,0)' });
          const a = document.createElement('a'); a.href=url; a.download=`${sel.slice(1)}.png`; document.body.appendChild(a); a.click(); a.remove();
        }
        const fsBtn = e.target.closest('[data-fullscreen]');
        if(fsBtn){
          const sel = fsBtn.getAttribute('data-fullscreen');
          const el = $(sel); if(!el){ toast('未找到图表', 'error'); return; }
          const panel = el.closest('.neo-panel') || el;
          if(!document.fullscreenElement){
            await panel.requestFullscreen();
          }else{
            await document.exitFullscreen();
          }
          setTimeout(()=> echarts.getInstanceByDom(el)?.resize(), 180);
        }
      });

      // 页面可见性
      document.addEventListener('visibilitychange', ()=>{
        if(document.hidden){
          AutoRefresh.pause();
        }else{
          AutoRefresh.resume(()=> loadAndRender({reason:'auto'}));
        }
      });
    }

    return {
      async bootstrap(){
        ChartManager.initAll();
        bindUI();
        await loadAndRender({reason:'init'});
      }
    };
  })();

  /* --------------- Wait Container Visible --------------- */
  function whenVisible(el, cb){
    if(!el) return;
    const check = ()=> el.offsetParent !== null && getComputedStyle(el).display!=='none';
    if(check()) return cb();
    const mo = new MutationObserver(()=>{
      if(check()){ mo.disconnect(); cb(); }
    });
    mo.observe(document.body,{childList:true,subtree:true,attributes:true});
  }

  /* --------------- Start --------------- */
  whenVisible($('#trends-page'), ()=>{
    // 延迟到浏览器空闲，避免主线程阻塞
    (window.requestIdleCallback || function(fn){ setTimeout(fn,50); })(()=> Controller.bootstrap());
  });

})();