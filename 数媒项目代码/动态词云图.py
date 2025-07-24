from pyecharts import options as opts
from pyecharts.charts import WordCloud
from pyecharts.globals import ThemeType

# 示例高频词及其情感（词, 词频, 情感类别）
words_data = [
    ("碳中和", 128, "positive"),
    ("极端高温", 110, "negative"),
    ("绿色能源", 98, "positive"),
    ("污染", 87, "negative"),
    ("减排", 85, "positive"),
    ("热浪", 77, "negative"),
    ("适应", 73, "neutral"),
    ("气候变化", 70, "neutral"),
    ("应急", 66, "neutral"),
    ("创新", 63, "positive"),
    ("干旱", 59, "negative"),
    ("新能源", 54, "positive"),
    ("低碳", 50, "positive"),
    ("灾害", 48, "negative"),
    ("政策", 45, "neutral"),
    ("环保", 43, "positive"),
    ("生物多样性", 41, "positive"),
    ("洪水", 39, "negative"),
    ("治理", 36, "neutral"),
    ("适应性", 34, "neutral"),
    ("经济转型", 30, "positive"),
    ("公众参与", 27, "positive"),
    ("气象灾害", 25, "negative"),
    ("气温", 22, "neutral"),
    ("温室气体", 18, "neutral"),
    ("应对", 16, "neutral"),
]

# 定义情感对应的配色（调整为与紫色背景协调的色调）
color_map = {
    "positive": ["#4effd2", "#7affd7", "#34eaff", "#8ae7ff"],  # 青绿色系，与紫色形成对比
    "negative": ["#ff6b9b", "#ff8a7a", "#ff5b00", "#f93c7a"],  # 粉红色系，增强科技感
    "neutral":  ["#b388ff", "#c9cfff", "#7aeca6", "#a3a3c2"]   # 淡紫色系，与背景呼应
}

# 生成词云输入，每个词带有自定义颜色
import random

def gen_wordcloud_data(words_data, color_map):
    wc_data = []
    for word, value, emo in words_data:
        color = random.choice(color_map[emo])
        wc_data.append({"name": word, "value": value, "textStyle": {"color": color}})
    return wc_data

wc_data = gen_wordcloud_data(words_data, color_map)

wordcloud = (
    WordCloud(
        init_opts=opts.InitOpts(
            # 初始背景设为深色（后续通过JS设置渐变）
            bg_color="#0f0824",
            theme=ThemeType.DARK,
            width="750px",
            height="420px",
            chart_id="cyber_dynamic_wordcloud"
        )
    )
    .add(
        series_name="高频词",
        data_pair=[(d["name"], d["value"]) for d in wc_data],
        word_size_range=[18, 66],
        shape="circle",
    )
    .set_global_opts(
        title_opts=opts.TitleOpts(
            title="高频关键词与情感映射",
            title_textstyle_opts=opts.TextStyleOpts(
                # 标题文字改为紫色渐变
                color="#d8b4fe",
                font_size=19,
                font_weight="bold",
                font_family="Consolas"
            ),
            pos_left="center",
            pos_top="3%",
        ),
        tooltip_opts=opts.TooltipOpts(
            is_show=True,
            formatter="{b} 词频：{c}",
            # tooltip背景与紫色主题协调
            background_color="rgba(30, 10, 60, 0.97)",
            border_color="#9333ea",  # 紫色边框
            border_width=1.2,
            textstyle_opts=opts.TextStyleOpts(
                color="#fff",
                font_size=13
            )
        ),
    )
    .add_js_funcs(f"""
    // 词云动态旋转&自定义颜色&点击事件
    var chart = echarts.getInstanceByDom(document.getElementById('cyber_dynamic_wordcloud'));
    if(chart){{
        // 设置科技感紫色渐变背景
        chart.setOption({{
            backgroundColor: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                {{ offset: 0, color: '#1a033d' }},  // 深紫黑色
                {{ offset: 0.5, color: '#3b0764' }}, // 深紫色
                {{ offset: 1, color: '#7e22ce' }}   // 亮紫色
            ]),
            series: [{{
                type: 'wordCloud',
                data: {wc_data},
                rotationRange: [-90, 90],
                rotationStep: 45,
                gridSize: 12,
                drawOutOfBound: false,
                textStyle: {{
                    fontFamily: 'Consolas, 微软雅黑, Arial',
                    fontWeight: 'bold',
                    shadowBlur: 10,
                    shadowColor: '#c084fc',  // 紫色阴影
                }},
                emphasis: {{
                    focus: 'self',
                    textStyle: {{
                        shadowBlur: 20,
                        shadowColor: '#f0abfc',  // 高亮时的浅紫色阴影
                        color: '#fff'
                    }}
                }},
                // 动态动画
                animation: true,
                animationDuration: 1800,
                animationEasing: 'elasticOut'
            }}]
        }});

        // 点击单词弹出关联热评
        chart.on('click', function(params){{
            if(params.name){{
                var comments = {{
                    "热浪": "今年热浪频发，气温屡创新高。",
                    "碳中和": "实现碳中和需要全社会共同努力。",
                    "极端高温": "极端高温让人们更加关注气候变化。",
                    "绿色能源": "绿色能源发展势头强劲。",
                    "污染": "部分城市污染问题依然严重。",
                }};
                var txt = comments[params.name] || "暂无相关热评片段";
                alert("【"+ params.name +"】 热门评论：\\n" + txt);
            }}
        }});
    }}
    """)
)

wordcloud.render(".html")