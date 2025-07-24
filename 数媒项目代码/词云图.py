from pyecharts import options as opts
from pyecharts.charts import WordCloud
from pyecharts.globals import ThemeType

# 参考你的图像，采用高端赛博紫色系+点缀蓝/粉/青/黄
PURPLE_DREAM_COLORS = [
    "#3726fa", "#4a3aff", "#6e92fa", "#55e8ff", "#ff57c3", "#ffe956", "#9b36ff", "#222a40",
    "#5e5edc", "#0d0d3a", "#6c4cff", "#3c99fa", "#14f1ff", "#ffb86b", "#ff819a", "#a6b6ff"
]

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

import random
def get_color():
    return random.choice(PURPLE_DREAM_COLORS)

wc_js_data = [
    {
        "name": word,
        "value": value,
        "textStyle": {
            "color": get_color()
        }
    } for word, value, _ in words_data
]

wordcloud = (
    WordCloud(
        init_opts=opts.InitOpts(
            bg_color="#141537",  # 赛博深紫底
            theme=ThemeType.DARK,
            width="900px",
            height="480px",
            chart_id="cyber_dream_purple_wordcloud"
        )
    )
    .add(
        series_name="高频词",
        data_pair=[(word, value) for word, value, _ in words_data],
        word_size_range=[23, 74],
        shape="circle",
    )
    .set_global_opts(
        title_opts=opts.TitleOpts(
            title="动态词云 · 赛博紫色系",
            subtitle="高频关键词",
            title_textstyle_opts=opts.TextStyleOpts(
                color="#8a62fa", font_size=21, font_weight="bold", font_family="Consolas"
            ),
            subtitle_textstyle_opts=opts.TextStyleOpts(
                color="#55e8ff", font_size=13, font_family="Consolas"
            ),
            pos_left="center",
            pos_top="4%",
        ),
        tooltip_opts=opts.TooltipOpts(
            is_show=True,
            formatter="{b} 词频：{c}",
            background_color="rgba(30,25,60,0.96)",
            border_color="#4a3aff",
            border_width=1.2,
            textstyle_opts=opts.TextStyleOpts(
                color="#ffe956", font_size=15
            )
        ),
    )
    .add_js_funcs(f"""
    // 词云每个词轻微浮动/呼吸动画
    var chart = echarts.getInstanceByDom(document.getElementById('cyber_dream_purple_wordcloud'));
    if(chart){{
        setTimeout(function(){{
            let texts = document.querySelectorAll('#cyber_dream_purple_wordcloud text');
            texts.forEach((el,idx)=>{{
                el.classList.add('cyber-purple-word-'+idx);
                el.style.transition = "all 1s cubic-bezier(.4,0,.2,1)";
            }});
            setInterval(function(){{
                texts.forEach((el, i) => {{
                    // 让每个词都以不同相位做上下浮动/轻微缩放
                    let t = Date.now()/900 + i*0.7;
                    let dy = Math.sin(t)*6.8; // 上下浮动幅度
                    let scale = 1 + 0.08*Math.sin(t/2.1+i); // 呼吸缩放
                    el.style.transform = `translateY(${{dy}}px) scale(${{scale}})`;
                    el.style.filter = "drop-shadow(0 0 14px #3726fa88)";
                }});
            }}, 70);
        }}, 700);

        // 点击弹窗
        chart.on('click', function(params){{
            if(params.name){{
                var comments = {{
                    "碳中和": "实现碳中和是国家的重要目标。",
                    "极端高温": "极端高温事件频发，需关注气候变化。",
                    "热浪": "今年热浪影响范围广泛。",
                    "绿色能源": "绿色能源产业发展迅速。"
                }};
                var txt = comments[params.name] || "暂无相关热评片段";
                alert("【"+ params.name +"】 热门评论：\\n" + txt);
            }}
        }});
    }}
    """)
)

wordcloud.render("词云图3.html")