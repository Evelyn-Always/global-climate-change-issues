from pyecharts import options as opts
from pyecharts.charts import Pie

# 数据准备
tech_data = [("政策讨论", 30), ("影响评估", 50), ("技术分析", 15), ("市场反应", 5)]
colors = ["#00F2FE", "#4FACFE", "#16BFFD", "#0078FF"]  # 科技蓝渐变

# 创建科技风图表
cyber_pie = (
    Pie(init_opts=opts.InitOpts(
        bg_color="#0F1C3C",  # 深色背景
        theme="dark",        # 使用dark主题增强科技感
        chart_id="tech_pie"  # 指定ID用于动画
    ))
    .add(
        series_name="",
        data_pair=tech_data,
        radius=["40%", "75%"],
        rosetype="radius",  # 南丁格尔玫瑰图式变形
        label_opts=opts.LabelOpts(
            is_show=True,
            formatter="{b|{b}}\n{d}%",
            rich={"b": {"color": "#FFF", "fontSize": 14}},
            position="outside"
        ),
        itemstyle_opts=opts.ItemStyleOpts(
            border_width=2,
            border_color="#0F1C3C",
            opacity=0.9
        )
    )
    .set_global_opts(
        title_opts=opts.TitleOpts(
            title="舆情主题分析",
            subtitle="TECHNOLOGY SENTIMENT ANALYSIS SYSTEM",
            title_textstyle_opts=opts.TextStyleOpts(
                color="#FFF",
                font_size=20,
                font_family="Arial",
                font_weight="bold"
            ),
            subtitle_textstyle_opts=opts.TextStyleOpts(
                color="#4FACFE",
                font_size=12
            )
        ),
        legend_opts=opts.LegendOpts(
            orient="vertical",
            pos_right="10%",  # 修改点：right -> pos_right
            pos_top="center",
            textstyle_opts=opts.TextStyleOpts(color="#FFF")
        ),
        toolbox_opts=opts.ToolboxOpts(is_show=True)  # 添加工具箱
    )
    .set_series_opts(
        tooltip_opts=opts.TooltipOpts(
            trigger="item",
            formatter="<b>{b}</b><br/>占比: {d}%<br/>数量: {c}",
            background_color="rgba(0,0,0,0.7)",
            border_color="#0078FF"
        ),
        # 关键科技风设置
        effect_opts=opts.EffectOpts(
            is_show=True,
            brush_type="stroke",
            scale=5,
            period=4
        )
    )
)

# 添加自定义JS实现流光效果（高级技巧）
cyber_pie.add_js_funcs("""
function initGlow(chartId) {
    var chart = echarts.getInstanceByDom(document.getElementById(chartId));
    chart.setOption({
        graphic: [{
            type: 'rect',
            left: 'center',
            top: 'center',
            shape: { width: 400, height: 400 },
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
initGlow('tech_pie');
""")

cyber_pie.render("饼图2.html")