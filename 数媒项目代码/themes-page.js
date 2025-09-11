(function(){
  const $ = (sel, root=document)=>root.querySelector(sel);

  function whenVisible(el, cb){
    if(!el) return;
    const vis = ()=> el.offsetParent !== null && getComputedStyle(el).display!=='none';
    if(vis()) return cb();
    const mo = new MutationObserver(()=>{ if(vis()){ mo.disconnect(); cb(); } });
    mo.observe(document.body, { attributes:true, childList:true, subtree:true });
  }

  function wireAI(){
    const btn = $('#ai-sentiment-btn');
    const input = $('#ai-sentiment-input');
    const out = $('#ai-result');
    btn?.addEventListener('click', async ()=>{
      const text = input.value.trim();
      if(!text){ out.textContent='请输入要分析的文本'; out.className='mt-2 text-sm text-warning'; return; }
      out.textContent='分析中…'; out.className='mt-2 text-sm text-dark-100';
      try{
        const resp = await fetch('/api/ai_sentiment', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ text })
        });
        const result = await resp.json();
        if(result.success){
          out.textContent=`情感倾向：${result.sentiment}，分值：${result.score}`;
          out.className='mt-2 text-sm text-success';
        }else{
          out.textContent=`分析失败：${result.msg}`;
          out.className='mt-2 text-sm text-danger';
        }
      }catch{
        out.textContent='请求失败，请检查服务器';
        out.className='mt-2 text-sm text-danger';
      }
    });
  }

  const charts = {};
  let modalChart = null;
  let sentimentTimer = null;
  let modalFlowTimer = null;

  /* ============ 公共随机数据（简单模拟） ============ */
  function randRange(min,max){ return Math.round(min + Math.random()*(max-min)); }

  /* ============ 堆叠柱 + 线 ============ */
  function renderStacked(){
    charts.stacked = echarts.init($('#chart-stacked'),'dark');
    charts.stacked.setOption({
      backgroundColor:'transparent',
      grid:{ left:40, right:40, top:40, bottom:36 },
      xAxis:[{ type:'category', data:['02月','03月','04月','05月','06月','07月'],
        axisLine:{ lineStyle:{ color:'#2c445d' } }, axisLabel:{ color:'#A3C7F7', fontSize:13 } }],
      yAxis:[
        { type:'value', splitLine:{ lineStyle:{ color:'rgba(40,80,120,0.10)', type:'dashed' } }, axisLine:{ lineStyle:{ color:'#2c445d' } }, axisLabel:{ color:'#A3C7F7' } },
        { type:'value', position:'right', name:'总量趋势', axisLine:{ lineStyle:{ color:'#FFD700' } }, axisLabel:{ color:'#FFD700' }, splitLine:{ show:false } }
      ],
      legend:{ top:6, right:24, textStyle:{ color:'#6fdcff', fontSize:12 } },
      tooltip:{ trigger:'axis', axisPointer:{ type:'shadow' } },
      dataZoom:[{ type:'slider', bottom:6, height:14 }],
      graphic:[{ type:'rect', bottom:6, left:'8%', right:'8%', z:-10,
        shape:{ width:'84%', height:12 },
        style:{ fill: new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:'rgba(111,220,255,0.20)'},{offset:1,color:'rgba(152,86,255,0.16)'}]),
                shadowBlur:18, shadowColor:'rgba(111,220,255,0.18)' } }],
      series:[
        { type:'bar', name:'政策讨论', stack:'S', barWidth:18,
          itemStyle:{ color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'#00FFE7'},{offset:1,color:'#2471A3'}]}, borderRadius:[4,4,0,0] },
          data:[120,132,161,134,150,180] },
        { type:'bar', name:'影响评估', stack:'S', barWidth:14,
          itemStyle:{ color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'#5B8EFF'},{offset:1,color:'#283C6B'}]}, borderRadius:[4,4,0,0] },
          data:[60,72,81,100,110,140] },
        { type:'bar', name:'应对措施', stack:'S', barWidth:14,
          itemStyle:{ color:{ type:'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'#9856FF'},{offset:1,color:'#32225C'}]}, borderRadius:[4,4,0,0] },
          data:[90,102,120,130,145,170] },
        { type:'line', name:'总量趋势', yAxisIndex:1, smooth:true, symbol:'circle', symbolSize:8,
          lineStyle:{ color:'#FFD700' }, itemStyle:{ color:'#FFD700', borderColor:'#fff', borderWidth:1 },
          data:[['02月',270],['03月',306],['04月',362],['05月',364],['06月',405],['07月',490]] }
      ]
    });
  }

  /* ============ 情感霓虹环（移植自第二页风格，随机数据） ============ */
  function renderSentiment(){
    charts.sentiment = echarts.init($('#chart-sentiment'),'dark');
    // 随机情感
    const pos = randRange(30,55);
    const neg = randRange(15,35);
    const neu = Math.max(0,100 - pos - neg);
    const donutData = [
      { name:'积极', value: pos },
      { name:'消极', value: neg },
      { name:'中立', value: neu }
    ];
    charts.sentiment.setOption({
      backgroundColor:'#050A1E',
      title:[{ text:'情感 雷达', subtext:'实时网络情感系统', left:'center', top:'2%',
        textStyle:{ color:'#fff', fontWeight:'bold', fontFamily:'Consolas', fontSize:14 },
        subtextStyle:{ color:'#0FF2FE', fontSize:10, fontFamily:'Consolas' } }],
      legend:[{ show:true, data:['积极','消极','中立'], right:'5%', top:'center', orient:'vertical',
        textStyle:{ color:'#0FF2FE', fontFamily:'Consolas', fontSize:10 } }],
      color:['#0FF2FE','#FF2D75','#7238F7'],
      series:[{
        type:'pie',
        name:'Sentiment',
        radius:['48%','74%'],
        center:['50%','55%'],
        clockwise:true,
        startAngle: 90,
        minAngle: 7,
        avoidLabelOverlap:true,
        label:{
          show:true, position:'outside', color:'#00FFFF',
          formatter:'{b|{b}}\\n{d}%',
          rich:{ b:{ color:'#fff', fontWeight:'bold', fontSize:12, fontFamily:'Consolas' } }
        },
        labelLine:{ length:15, length2:15, minTurnAngle:90, maxSurfaceAngle:90 },
        itemStyle:{ borderColor:'#151C33', borderWidth:3, opacity:0.98 },
        data: donutData
      }],
      graphic:[
        { type:'circle', left:'center', top:'center', z:-1, shape:{ r:120 },
          style:{ fill:{ type:'radial', x:0.5,y:0.5,r:0.9,
            colorStops:[ { offset:0, color:'rgba(0,255,255,0.20)' },
                         { offset:1, color:'rgba(5,10,30,0)' } ] } } },
        { type:'circle', left:'center', top:'center', z:10, shape:{ r:152 },
          style:{ stroke:'rgba(0,242,254,0.20)', lineWidth:11, shadowBlur:28, shadowColor:'rgba(0,242,254,0.35)' } }
      ]
    });

    // 旋转动画（与第二页一致）
    if(sentimentTimer) clearInterval(sentimentTimer);
    let angle = 90;
    sentimentTimer = setInterval(()=>{
      angle += 3;
      charts.sentiment.setOption({ series:[{ startAngle: angle }] });
    }, 120);
  }

  /* ============ Sankey（移植第二页结构，使用模拟数据） ============ */
  function renderSankey(){
    charts.sankey = echarts.init($('#chart-sankey'),'dark');
    const nodes = [
      { name:'政策文件' },{ name:'风险应对' },{ name:'能源电力' },
      { name:'城市建设' },{ name:'生态与资源' },{ name:'数据核查' }
    ];
    const rawLinks = [
      ['政策文件','风险应对'], ['政策文件','能源电力'],
      ['能源电力','城市建设'], ['生态与资源','风险应对'],
      ['数据核查','政策文件'], ['城市建设','生态与资源'],
      ['数据核查','能源电力']
    ];
    const links = rawLinks.map(([s,t])=>({ source:s, target:t, value: randRange(20,140) }));
    charts.sankey.setOption({
      backgroundColor:'transparent',
      tooltip:{ trigger:'item' },
      series:[{
        type:'sankey',
        emphasis:{ focus:'adjacency' },
        nodeAlign:'justify',
        lineStyle:{ color:'gradient', curveness:0.52, opacity:0.6 },
        label:{ color:'#C9F0FF' },
        data:nodes,
        links
      }]
    });
  }

  /* ============ 玫瑰图（保留原实现） ============ */
  function renderPie(){
    charts.pie = echarts.init($('#chart-pie'),'dark');
    charts.pie.setOption({
      backgroundColor:'transparent',
      title:{ text:'气候变化主题分布', subtext:'CLIMATE CHANGE PUBLIC OPINION ANALYSIS', top:6,
              textStyle:{ color:'#FFF', fontWeight:'bold', fontSize:16 }, subtextStyle:{ color:'#4FACFE', fontSize:10 } },
      legend:{ right:'4%', top:'center', orient:'vertical', textStyle:{ color:'#FFF', fontSize:10 }, itemWidth:12, itemHeight:12,
               data:['极端天气事件','减排政策','可再生能源','海平面上升','碳捕获技术'] },
      tooltip:{ trigger:'item', backgroundColor:'rgba(0,0,0,0.7)', borderColor:'#0078FF', textStyle:{ fontSize:10 },
                formatter:'<b>{b}</b><br/>占比: {d}%<br/>讨论量: {c}k' },
      color:['#00F2FE','#4FACFE','#16BFFD','#0078FF','#0059B2'],
      graphic:[{ type:'rect', left:'center', top:'center', z:-1, shape:{ width:280, height:280 },
        style:{ fill: new echarts.graphic.RadialGradient(0.5,0.5,0.8,[{offset:0,color:'rgba(0,242,254,0.1)'},{offset:1,color:'rgba(0,120,255,0)'}]) }, silent:true }],
      series:[{ type:'pie', roseType:'radius', radius:['40%','75%'], center:['45%','55%'],
        label:{ show:true, formatter:'{b|{b}}\\n{d}%', rich:{ b:{ color:'#FFF', fontSize:10 } } },
        labelLine:{ length:15, length2:15, minTurnAngle:90, maxSurfaceAngle:90 },
        itemStyle:{ borderColor:'#0F1C3C', borderWidth:1.5, opacity:0.9 },
        data:[ { name:'极端天气事件', value:35 }, { name:'减排政策', value:25 }, { name:'可再生能源', value:20 }, { name:'海平面上升', value:10 }, { name:'碳捕获技术', value:10 } ] }]
    });
  }

  /* ============ 模态 & 下载 & 刷新 ============ */
  window.openChartModal = function(id){
    const modal = $('#chart-modal');
    const target = $('#chart-modal-target');
    const title = $('#modal-title');

    if (modalChart) { modalChart.dispose(); modalChart = null; }
    if (modalFlowTimer) { clearInterval(modalFlowTimer); modalFlowTimer = null; }

    modal.classList.remove('hidden');
    title.textContent =
      id === 'chart-stacked' ? '话题分类占比（预览）' :
      id === 'chart-sentiment' ? '情感倾向分布（预览）' :
      id === 'chart-sankey' ? '主题关联（预览）' :
      '气候变化主题分布（预览）';

    modalChart = echarts.init(target,'dark');
    const src = id==='chart-stacked' ? charts.stacked :
                id==='chart-sentiment' ? charts.sentiment :
                id==='chart-sankey' ? charts.sankey :
                charts.pie;
    const opt = src.getOption();
    modalChart.setOption(opt, true);

    if(id==='chart-sentiment'){
      let angle = 90;
      modalFlowTimer = setInterval(()=>{
        angle += 3;
        modalChart.setOption({ series:[{ startAngle: angle }] });
      }, 120);
    }

    $('#modal-download').onclick = ()=>{
      const bg = (id==='chart-sentiment') ? '#050A1E' : 'rgba(0,0,0,0)';
      const url = modalChart.getDataURL({ pixelRatio:2, backgroundColor:bg });
      const a = document.createElement('a'); a.href=url; a.download=`${id}-preview.png`; document.body.appendChild(a); a.click(); a.remove();
    };

    const close = ()=>{
      modal.classList.add('hidden');
      if(modalFlowTimer){ clearInterval(modalFlowTimer); modalFlowTimer=null; }
      if(modalChart){ modalChart.dispose(); modalChart=null; }
      $('#modal-download').onclick = null;
      $('#modal-close').onclick = null;
      modal.onclick = null;
      document.removeEventListener('keydown', onEsc);
    };
    const onEsc = (e)=>{ if(e.key==='Escape') close(); };

    $('#modal-close').onclick = close;
    modal.onclick = e=>{ if(e.target.id==='chart-modal') close(); };
    document.addEventListener('keydown', onEsc);
  };

  window.downloadChart = function(id){
    const inst = id==='chart-stacked' ? charts.stacked :
                 id==='chart-sentiment' ? charts.sentiment :
                 id==='chart-sankey' ? charts.sankey :
                 charts.pie;
    if(!inst) return;
    const bg = id==='chart-sentiment' ? '#050A1E' : 'rgba(0,0,0,0)';
    const url = inst.getDataURL({ pixelRatio:2, backgroundColor:bg });
    const a = document.createElement('a'); a.href=url; a.download=`${id}.png`; document.body.appendChild(a); a.click(); a.remove();
  };

  window.refreshTopicCards = function(){
    const tag = $('#current-selection');
    if(tag && !tag.textContent.trim()) tag.textContent = '当前选择：全部';
  };

  function init(){
    wireAI();
    renderStacked();
    renderSentiment();
    renderSankey();
    renderPie();

    window.addEventListener('resize', ()=>{
      charts.stacked?.resize();
      charts.sentiment?.resize();
      charts.sankey?.resize();
      charts.pie?.resize();
      if(modalChart) modalChart.resize();
    });

    document.addEventListener('visibilitychange', ()=>{
      if(document.hidden){
        if(sentimentTimer){ clearInterval(sentimentTimer); sentimentTimer=null; }
      }else{
        if(!sentimentTimer && charts.sentiment){
          let angle = 90;
            sentimentTimer = setInterval(()=>{
            angle += 3;
            charts.sentiment.setOption({ series:[{ startAngle: angle }] });
          }, 120);
        }
      }
    });
  }

  whenVisible($('#themes-page'), init);
})();