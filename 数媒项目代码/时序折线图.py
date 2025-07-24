from pyecharts import options as opts
from pyecharts.charts import Line
from pyecharts.commons.utils import JsCode
import random
from datetime import datetime, timedelta


# 生成模拟数据
def generate_time_series_data():
    start_date = datetime(2025, 1, 1)
    date_list = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(180)]

    # 基础热度数据
    base_values = [random.randint(100, 300) for _ in range(180)]

    # 添加事件影响
    events = {
        "2025-03-15": ("IPCC报告发布", 600),
        "2025-04-22": ("地球日", 450),
        "2025-05-12": ("飓风登陆", 800),
        "2025-06-05": ("环境日", 500),
    }

    values = base_values.copy()
    for date, (_, impact) in events.items():
        if date in date_list:
            idx = date_list.index(date)
            # 事件前后几天也有影响
            for i in range(max(0, idx - 2), min(len(values), idx + 5)):
                values[i] = min(1000, values[i] + int(impact * 0.8 * (1 - abs(i - idx) / 5)))
            values[idx] = impact

    return date_list, values, events


dates, values, events = generate_time_series_data()

# 创建折线图
line = (
    Line(init_opts=opts.InitOpts(
        width="100%",
        height="600px",
        theme="dark",  # 使用暗色主题更显科技感
        chart_id="tech_trend_chart",  # 指定图表ID便于自定义
    ))
    .add_xaxis(xaxis_data=dates)
    .add_yaxis(
        series_name="舆情热度",
        y_axis=values,
        is_smooth=True,
        symbol="circle",
        symbol_size=6,
        linestyle_opts=opts.LineStyleOpts(width=3),
        label_opts=opts.LabelOpts(is_show=False),
        itemstyle_opts=opts.ItemStyleOpts(
            color=JsCode("""
                new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(0, 244, 255, 1)'
                }, {
                    offset: 1,
                    color: 'rgba(0, 77, 167, 1)'
                }])
            """)
        ),
        areastyle_opts=opts.AreaStyleOpts(
            color=JsCode("""
                new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(0, 244, 255, 0.3)'
                }, {
                    offset: 1,
                    color: 'rgba(0, 77, 167, 0.3)'
                }])
            """)
        ),
    )
    .set_global_opts(
        title_opts=opts.TitleOpts(
            title="舆情热度时间趋势分析",
            subtitle="2025年1月-6月",
            pos_left="center",
            title_textstyle_opts=opts.TextStyleOpts(
                color="#fff",
                font_size=24,
                font_family="Microsoft YaHei",
                font_weight="bold"
            ),
            subtitle_textstyle_opts=opts.TextStyleOpts(
                color="#ccc",
                font_size=14
            )
        ),
        tooltip_opts=opts.TooltipOpts(
            trigger="axis",
            axis_pointer_type="cross",
            background_color="rgba(0, 0, 0, 0.7)",
            border_color="rgba(50, 150, 250, 0.7)",
            border_width=1,
            textstyle_opts=opts.TextStyleOpts(color="#fff")
        ),
        legend_opts=opts.LegendOpts(
            is_show=False
        ),
        xaxis_opts=opts.AxisOpts(
            type_="category",
            boundary_gap=False,
            axisline_opts=opts.AxisLineOpts(
                linestyle_opts=opts.LineStyleOpts(color="#4a657a")
            ),
            axislabel_opts=opts.LabelOpts(
                color="#a7a7a7",
                font_size=10,
                interval=30  # 每月显示一个标签
            ),
            axistick_opts=opts.AxisTickOpts(
                is_align_with_label=True,
                length=3,
                linestyle_opts=opts.LineStyleOpts(color="#4a657a")
            ),
            splitline_opts=opts.SplitLineOpts(
                is_show=True,
                linestyle_opts=opts.LineStyleOpts(
                    color="rgba(50, 150, 250, 0.1)",
                    type_="dashed"
                )
            )
        ),
        yaxis_opts=opts.AxisOpts(
            type_="value",
            name="舆情热度",
            name_textstyle_opts=opts.TextStyleOpts(
                color="#a7a7a7",
                padding=[0, 0, 0, 40]
            ),
            min_=0,
            max_=1000,
            split_number=5,
            axisline_opts=opts.AxisLineOpts(
                linestyle_opts=opts.LineStyleOpts(color="#4a657a")
            ),
            axislabel_opts=opts.LabelOpts(
                color="#a7a7a7",
                font_size=10
            ),
            axistick_opts=opts.AxisTickOpts(
                is_show=True,
                length=3,
                linestyle_opts=opts.LineStyleOpts(color="#4a657a")
            ),
            splitline_opts=opts.SplitLineOpts(
                is_show=True,
                linestyle_opts=opts.LineStyleOpts(
                    color="rgba(50, 150, 250, 0.1)",
                    type_="dashed"
                )
            )
        ),
        datazoom_opts=[
            {
                "type": "slider",
                "xaxis_index": [0],
                "range_start": 0,
                "range_end": 100,
                "handleIcon": "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
                "handleSize": "80%",
                "handleStyle": {
                    "color": "rgba(0, 150, 250, 0.7)",
                    "borderColor": "rgba(0, 150, 250, 0.7)",
                    "borderWidth": 1
                }
            },
            {
                "type": "inside",
                "xaxis_index": [0],
                "range_start": 0,
                "range_end": 100
            }
        ],
        toolbox_opts=opts.ToolboxOpts(
            is_show=True,
            feature={
                "dataZoom": {"yAxisIndex": "none"},
                "restore": {},
                "saveAsImage": {
                    "pixelRatio": 2,
                    "title": "保存图片",
                    "name": "舆情热度趋势图"
                }
            },
            pos_right="20px",
            pos_top="10px"
        ),
    )
)

# 添加事件标记
for date, (event_name, _) in events.items():
    if date in dates:
        idx = dates.index(date)
        line.add_js_funcs(f"""
            chart_{line.chart_id}.dispatchAction({{
                type: 'markLine',
                seriesIndex: 0,
                data: [{{
                    xAxis: '{date}',
                    label: {{
                        formatter: '{event_name}',
                        position: 'start',
                        color: '#ff6a00',
                        fontSize: 10
                    }},
                    lineStyle: {{
                        color: '#ff6a00',
                        type: 'solid',
                        width: 1
                    }}
                }}]
            }});
        """)

# 添加悬浮效果
line.set_series_opts(
    markpoint_opts=opts.MarkPointOpts(
        data=[
            opts.MarkPointItem(type_="max", name="最大值"),
            opts.MarkPointItem(type_="min", name="最小值"),
        ],
        symbol="pin",
        symbol_size=50,
        label_opts=opts.LabelOpts(
            color="#fff",
            position="top",
            formatter=JsCode("""
                function(params) {
                    return params.name + ': ' + params.value[1];
                }
            """)
        )
    ),
    markline_opts=opts.MarkLineOpts(
        data=[opts.MarkLineItem(type_="average", name="平均值")],
        symbol=["none", "none"],
        label_opts=opts.LabelOpts(
            position="middle",
            color="#fff",
            formatter=JsCode("""
                function(params) {
                    return '均值: ' + Math.round(params.value * 100) / 100;
                }
            """)
        ),
        linestyle_opts=opts.LineStyleOpts(
            color="#ffcc00",
            type_="dashed",
            width=1
        )
    )
)

# 渲染图表
line.render("舆情热度时间趋势图.html")