from pyecharts import options as opts
from pyecharts.charts import Pie
from pyecharts.globals import ThemeType

# 情感分布数据
sentiment_data = [
    ("积极", 20),
    ("消极", 50),
    ("中立", 30)
]

# 科技感配色
CYBER_COLORS = ["#00F2FE", "#FF2D75", "#7238F7"]  # 蓝、粉、紫

pie = (
    Pie(
        init_opts=opts.InitOpts(
            bg_color="#0f1c3c",
            theme=ThemeType.DARK,
            width="800px",
            height="500px",
            chart_id="cyber_pie"
        )
    )
    .add(
        series_name="SENTIMENT",
        data_pair=sentiment_data,
        radius=["45%", "68%"],
        center=["50%", "54%"],
        rosetype=None,
        label_opts=opts.LabelOpts(
            is_show=True,
            position="outside",
            formatter="{b|{b}}\n{d}%",
            font_size=15,
            rich={
                "b": {
                    "color": "#00f2fe",
                    "fontWeight": "bold",
                    "fontSize": 16,
                    "textBorderColor": "#0ff",
                    "textBorderWidth": 1,
                }
            },
        ),
        itemstyle_opts=opts.ItemStyleOpts(
            border_width=3,
            border_color="#1f335c",
            opacity=0.96
        )
    )
    .set_colors(CYBER_COLORS)
    .set_global_opts(
        title_opts=opts.TitleOpts(
            title="SENTIMENT DISTRIBUTION",
            subtitle="AI-POWERED EMOTION RADAR",
            title_textstyle_opts=opts.TextStyleOpts(
                color="#fff",
                font_size=22,
                font_family="Agency FB",
                font_weight="bold"
            ),
            subtitle_textstyle_opts=opts.TextStyleOpts(
                color="#00f2fe",
                font_size=13,
                font_family="Consolas"
            ),
            pos_left="center",
            pos_top="5%",
        ),
        legend_opts=opts.LegendOpts(
            orient="vertical",
            pos_right="5%",
            pos_top="center",
            item_width=16,
            item_height=16,
            item_gap=20,
            textstyle_opts=opts.TextStyleOpts(
                color="#fff",
                font_family="Consolas",
                font_size=13
            )
        ),
        toolbox_opts=opts.ToolboxOpts(
            is_show=True,
            pos_right="5%",
            pos_bottom="5%",
            feature=opts.ToolBoxFeatureOpts(
                save_as_image=opts.ToolBoxFeatureSaveAsImageOpts(
                    background_color="#0f1c3c"
                )
            )
        )
    )
    .set_series_opts(
        tooltip_opts=opts.TooltipOpts(
            trigger="item",
            formatter="""
            <div style="font-family: Consolas; background: rgba(5,20,40,0.95); border: 1.5px solid #00f2fe; padding: 12px; border-radius: 7px;">
                <span style='color: {a}; font-weight:bold;'>{b}</span><br/>
                ▸ Value: <b>{c}%</b><br/>
                ▸ Ratio: <b>{d}%</b>
            </div>
            """,
            background_color="transparent",
            border_color="#00f2fe",
            textstyle_opts=opts.TextStyleOpts(
                color="#fff",
                font_size=13
            )
        ),
    )
    # 中心光效和发光边框通过 JS 注入
    .add_js_funcs("""
    var chart = echarts.getInstanceByDom(document.getElementById('cyber_pie'));
    if(chart){
        chart.setOption({
            graphic: [{
                type: 'circle',
                left: 'center',
                top: 'center',
                z: -1,
                shape: { r: 130 },
                style: {
                    fill: {
                        type: 'radial',
                        x: 0.5,
                        y: 0.5,
                        r: 0.5,
                        colorStops: [
                            { offset: 0, color: 'rgba(0,242,254,0.18)' },
                            { offset: 1, color: 'rgba(15,28,60,0)' }
                        ]
                    },
                    shadowColor: 'rgba(0,242,254,0.35)',
                    shadowBlur: 60
                }
            }]
        });
    }
    """)
)

pie.render("情感图2.html")