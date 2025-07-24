from pyecharts import options as opts
from pyecharts.charts import Bar
from pyecharts.globals import ThemeType

months = ["02月", "03月", "04月", "05月", "06月", "07月"]
policy_discuss = [120, 132, 161, 134, 150, 180]
impact_eval = [60, 72, 81, 100, 110, 140]
measures = [90, 102, 120, 130, 145, 170]

bar = (
    Bar(
        init_opts=opts.InitOpts(
            bg_color="#121829", # 极深蓝底
            theme=ThemeType.DARK,
            width="700px",
            height="400px",
            chart_id="cyber_minimal_bar"
        )
    )
    .add_xaxis(months)
    .add_yaxis(
        "政策讨论",
        policy_discuss,
        stack="stack1",
        category_gap="20%",  # 控制柱子之间间隔（10~30%都可以再试试）
        bar_width="20",      # 控制每个柱子的宽度
        itemstyle_opts=opts.ItemStyleOpts(
            color={
                "type": "linear", "x": 0, "y": 0, "x2": 0, "y2": 1,
                "colorStops": [
                    {"offset": 0, "color": "#00FFE7"},
                    {"offset": 1, "color": "#2471A3"}
                ]
            },
            border_radius=[4, 4, 0, 0],  # 上圆角
            opacity=0.92,
        )
    )
    .add_yaxis(
        "影响评估",
        impact_eval,
        stack="stack1",
        bar_width="14",
        itemstyle_opts=opts.ItemStyleOpts(
            color={
                "type": "linear", "x": 0, "y": 0, "x2": 0, "y2": 1,
                "colorStops": [
                    {"offset": 0, "color": "#5B8EFF"},
                    {"offset": 1, "color": "#283C6B"}
                ]
            },
            border_radius=[4, 4, 0, 0],
            opacity=0.92,
        )
    )
    .add_yaxis(
        "应对措施",
        measures,
        stack="stack1",
        bar_width="14",
        itemstyle_opts=opts.ItemStyleOpts(
            color={
                "type": "linear", "x": 0, "y": 0, "x2": 0, "y2": 1,
                "colorStops": [
                    {"offset": 0, "color": "#9856FF"},
                    {"offset": 1, "color": "#32225C"}
                ]
            },
            border_radius=[4, 4, 0, 0],
            opacity=0.92,
        )
    )
    .set_global_opts(
        title_opts=opts.TitleOpts(
            title="堆叠柱状图",
            subtitle="半年各类别舆情占比",
            title_textstyle_opts=opts.TextStyleOpts(
                color="#fff",
                font_size=17,
                font_family="Consolas",
                font_weight="bold"
            ),
            subtitle_textstyle_opts=opts.TextStyleOpts(
                color="#6fdcff",
                font_size=13,
                font_family="Consolas"
            ),
            pos_left="3%",
            pos_top="2%"
        ),
        legend_opts=opts.LegendOpts(
            pos_top="6%",
            pos_right="3%",
            textstyle_opts=opts.TextStyleOpts(
                color="#6fdcff",
                font_size=12,
                font_family="Consolas"
            ),
            item_width=16,
            item_height=10,
            item_gap=16,
        ),
        xaxis_opts=opts.AxisOpts(
            axislabel_opts=opts.LabelOpts(
                color="#A3C7F7",
                font_size=13,
                font_family="Consolas"
            ),
            axisline_opts=opts.AxisLineOpts(
                linestyle_opts=opts.LineStyleOpts(color="#2c445d")
            ),
            splitline_opts=opts.SplitLineOpts(is_show=False)
        ),
        yaxis_opts=opts.AxisOpts(
            axislabel_opts=opts.LabelOpts(
                color="#A3C7F7",
                font_size=13,
                font_family="Consolas"
            ),
            axisline_opts=opts.AxisLineOpts(
                linestyle_opts=opts.LineStyleOpts(color="#2c445d")
            ),
            splitline_opts=opts.SplitLineOpts(
                is_show=True,
                linestyle_opts=opts.LineStyleOpts(color="rgba(40,80,120,0.10)", type_="dashed")
            )
        ),
        datazoom_opts=[
            opts.DataZoomOpts(
                is_show=True,
                type_="slider",
                range_start=0,
                range_end=100,
                pos_bottom="1.5%",
            )
        ]
    )
    .set_series_opts(
        label_opts=opts.LabelOpts(
            is_show=False,  # 极简风格，默认隐藏数值
        ),
        tooltip_opts=opts.TooltipOpts(
            trigger="axis",
            axis_pointer_type="shadow",
            background_color="rgba(18,24,41,0.98)",
            border_color="#6fdcff",
            border_width=1,
            textstyle_opts=opts.TextStyleOpts(
                color="#fff",
                font_size=12
            )
        )
    )
    .add_js_funcs("""
    // 增加底部光晕和hover发光
    var chart = echarts.getInstanceByDom(document.getElementById('cyber_minimal_bar'));
    if(chart){
        chart.setOption({
            graphic: [{
                type: 'rect',
                bottom: 0,
                left: '8%',
                right: '8%',
                z: -10,
                shape: { width: '84%', height: 12 },
                style: {
                    fill: {
                        type: 'linear',
                        x: 0, y: 0, x2: 1, y2: 0,
                        colorStops: [
                            { offset: 0, color: 'rgba(111,220,255,0.20)' },
                            { offset: 1, color: 'rgba(152,86,255,0.16)' }
                        ]
                    },
                    shadowBlur: 18,
                    shadowColor: 'rgba(111,220,255,0.18)'
                }
            }]
        });
    }
    """)
)

bar.render("堆叠图3.html")