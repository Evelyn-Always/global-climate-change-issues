from pyecharts import options as opts
from pyecharts.charts import Pie

# 气候变化相关主题数据（科学合理的分布）
climate_data = [
    ("极端天气事件", 35),   # 占比最高，符合当前关注度
    ("减排政策", 25),       # 政策层面关注度高
    ("可再生能源", 20),     # 解决方案类话题
    ("海平面上升", 10),     # 重要影响类话题
    ("碳捕获技术", 10)      # 新兴技术类话题
]

# 保持科技感的蓝色系配色
colors = ["#00F2FE", "#4FACFE", "#16BFFD", "#0078FF", "#0059B2"]

# 创建缩小版气候变化主题图表（原尺寸的70%）
climate_pie = (
    Pie(init_opts=opts.InitOpts(
        bg_color="#0F1C3C",
        theme="dark",
        width="630px",  # 缩小宽度
        height="420px", # 缩小高度
        chart_id="climate_pie"
    ))
    .add(
        series_name="",
        data_pair=climate_data,
        radius=["40%", "75%"],
        rosetype="radius",
        label_opts=opts.LabelOpts(
            is_show=True,
            formatter="{b|{b}}\n{d}%",
            rich={"b": {"color": "#FFF", "fontSize": 10}},  # 缩小字体
            position="outside"
        ),
        itemstyle_opts=opts.ItemStyleOpts(
            border_width=1.5,  # 缩小边框
            border_color="#0F1C3C",
            opacity=0.9
        )
    )
    .set_colors(colors)
    .set_global_opts(
        title_opts=opts.TitleOpts(
            title="气候变化舆情主题",
            subtitle="CLIMATE CHANGE PUBLIC OPINION ANALYSIS",
            title_textstyle_opts=opts.TextStyleOpts(
                color="#FFF",
                font_size=16,  # 缩小标题字体
                font_family="Arial",
                font_weight="bold"
            ),
            subtitle_textstyle_opts=opts.TextStyleOpts(
                color="#4FACFE",
                font_size=10  # 缩小副标题字体
            ),
            pos_top="5%"
        ),
        legend_opts=opts.LegendOpts(
            orient="vertical",
            pos_right="5%",
            pos_top="center",
            item_width=12,  # 缩小图例
            item_height=12,
            item_gap=10,
            textstyle_opts=opts.TextStyleOpts(
                color="#FFF",
                font_size=10  # 缩小图例文字
            )
        ),
        toolbox_opts=opts.ToolboxOpts(is_show=True)
    )
    .set_series_opts(
        tooltip_opts=opts.TooltipOpts(
            trigger="item",
            formatter="<b>{b}</b><br/>占比: {d}%<br/>讨论量: {c}k",
            background_color="rgba(0,0,0,0.7)",
            border_color="#0078FF",
            textstyle_opts=opts.TextStyleOpts(font_size=10)  # 缩小提示框文字
        ),
        effect_opts=opts.EffectOpts(
            is_show=True,
            brush_type="stroke",
            scale=4,  # 缩小特效范围
            period=4
        )
    )
)

# 调整流光效果尺寸以适应缩小的图表
climate_pie.add_js_funcs("""
function initGlow(chartId) {
    var chart = echarts.getInstanceByDom(document.getElementById(chartId));
    chart.setOption({
        graphic: [{
            type: 'rect',
            left: 'center',
            top: 'center',
            shape: { width: 280, height: 280 },  // 缩小光环
            style: {
                fill: new echarts.graphic.RadialGradient(0.5, 0.5, 0.8, [{
                    offset: 0,
                    color: 'rgba(0, 242, 254, 0.1)'
                }, {
                    offset: 1,
                    color: 'rgba(0, 120, 255, 0)'
                }])
            },
            silent: true
        }]
    });
}
initGlow('climate_pie');
""")

climate_pie.render("饼图3.html")
