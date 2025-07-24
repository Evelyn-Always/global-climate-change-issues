from pyecharts import options as opts
from pyecharts.charts import Pie
from pyecharts.globals import ThemeType

# 数据
sentiment_data = [
    {"name": "积极", "value": 20},
    {"name": "消极", "value": 50},
    {"name": "中立", "value": 30}
]
# 配色
CYBER_COLORS = ["#0FF2FE", "#FF2D75", "#7238F7"]

# 整体缩小比例为原来的70%，保持各元素比例一致
pie = (
    Pie(
        init_opts=opts.InitOpts(
            bg_color="#050A1E",
            theme=ThemeType.DARK,
            width="630px",  # 900px × 0.7
            height="420px",  # 600px × 0.7
            chart_id="cyber_advanced_donut"
        )
    )
    .add(
        "Sentiment",
        [(d["name"], d["value"]) for d in sentiment_data],
        radius=["48%", "75%"],  # 保持半径比例不变
        center=["50%", "53%"],
        label_opts=opts.LabelOpts(
            is_show=True,
            formatter="{b|{b}}\n{d}%",
            position="outside",
            font_size=10.5,  # 15 × 0.7
            font_family="Consolas",
            color="#00FFFF",
            rich={
                "b": {
                    "color": "#fff",
                    "fontWeight": "bold",
                    "fontSize": 11.2,  # 16 × 0.7
                    "fontFamily": "Consolas",
                    "padding": [2.1, 0]  # 3 × 0.7
                }
            }
        ),
        itemstyle_opts=opts.ItemStyleOpts(
            border_width=3.5,  # 5 × 0.7
            border_color="#151C33",
            opacity=0.98
        ),
        min_angle=7  # 10 × 0.7 (近似值)
    )
    .set_colors(CYBER_COLORS)
    .set_global_opts(
        title_opts=opts.TitleOpts(
            title="情感 雷达",
            subtitle="实时网络情感系统",
            title_textstyle_opts=opts.TextStyleOpts(
                color="#fff",
                font_family="Consolas",
                font_weight="bold",
                font_size=16.8  # 24 × 0.7
            ),
            subtitle_textstyle_opts=opts.TextStyleOpts(
                color="#0FF2FE",
                font_size=9.8,  # 14 × 0.7
                font_family="Consolas"
            ),
            pos_left="center",
            pos_top="3%"  # 位置保持不变
        ),
        legend_opts=opts.LegendOpts(
            orient="vertical",
            pos_right="5%",
            pos_top="center",
            item_width=12.6,  # 18 × 0.7
            item_height=12.6,  # 18 × 0.7
            item_gap=15.4,  # 22 × 0.7
            textstyle_opts=opts.TextStyleOpts(
                color="#0FF2FE",
                font_family="Consolas",
                font_size=9.8  # 14 × 0.7
            )
        ),
        toolbox_opts=opts.ToolboxOpts(
            is_show=True,
            pos_right="4%",
            pos_bottom="4%",
            feature=opts.ToolBoxFeatureOpts(
                save_as_image=opts.ToolBoxFeatureSaveAsImageOpts(
                    background_color="#050A1E"
                )
            )
        )
    )
    .set_series_opts(
        tooltip_opts=opts.TooltipOpts(
            trigger="item",
            formatter="""
            <div style="font-family: Consolas; background: rgba(5,10,30,0.92); border: 1.4px solid #0ff2fe; padding: 8.4px; border-radius: 5.6px;">
                <span style='color: {a}; font-weight:bold;'>{b}</span><br/>
                ▸ Value: <b>{c}%</b><br/>
                ▸ Ratio: <b>{d}%</b>
            </div>
            """,  # 边框和内边距都缩小为原来的70%
            background_color="transparent",
            border_color="#0ff2fe",
            textstyle_opts=opts.TextStyleOpts(
                color="#fff",
                font_size=9.1  # 13 × 0.7
            )
        )
    )
    # 中心光环和动画效果等比例缩小
    .add_js_funcs("""
    var chart = echarts.getInstanceByDom(document.getElementById('cyber_advanced_donut'));
    if(chart){
        chart.setOption({
            graphic: [
                // 中心径向光晕（等比例缩小）
                {
                    type: 'circle',
                    left: 'center',
                    top: 'center',
                    z: -1,
                    shape: { r: 119 },  // 170 × 0.7
                    style: {
                        fill: {
                            type: 'radial',
                            x: 0.5, y: 0.5, r: 0.9,
                            colorStops: [
                                { offset: 0, color: 'rgba(0,255,255,0.20)' },
                                { offset: 1, color: 'rgba(5,10,30,0)' }
                            ]
                        }
                    }
                },
                // 外圈发光（等比例缩小）
                {
                    type: 'circle',
                    left: 'center',
                    top: 'center',
                    z: 10,
                    shape: { r: 150.5 },  // 215 × 0.7
                    style: {
                        stroke: 'rgba(0,242,254,0.20)',
                        lineWidth: 10.5,  // 15 × 0.7
                        shadowBlur: 28,  // 40 × 0.7
                        shadowColor: 'rgba(0,242,254,0.35)'
                    }
                }
            ]
        });
        // 动态流光效果保持不变
        let angle = 0;
        setInterval(function() {
            angle += 3;
            chart.setOption({
                series: [{
                    startAngle: angle
                }]
            });
        }, 120);
    }
    """)
)

pie.render("情感5.html")
