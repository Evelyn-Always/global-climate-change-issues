from pyecharts import options as opts
from pyecharts.charts import Map
from pyecharts.globals import ChartType, SymbolType

# 模拟舆情数据 - 格式: [国家名称, 舆情热度值]
# 热度值可以是评论量、报道数等指标
data = [
    ["China", 156],
    ["United States", 210],
    ["Brazil", 89],
    ["United Kingdom", 145],
    ["Russia", 112],
    ["India", 187],
    ["Germany", 98],
    ["France", 76],
    ["Japan", 134],
    ["Australia", 65],
    ["Canada", 82],
    ["South Africa", 54],
    ["Mexico", 43],
    ["Italy", 67],
    ["Spain", 59],
    # 可以继续添加更多国家数据...
]

# 创建世界地图
world_map = (
    Map()
    .add(
        series_name="舆情热度",
        data_pair=data,
        maptype="world",
        is_map_symbol_show=False,  # 不显示标记点
        label_opts=opts.LabelOpts(is_show=True),  # 显示国家名称
    )
    .set_global_opts(
        title_opts=opts.TitleOpts(
            title="全球舆情热力图",
            subtitle="数据为模拟舆情热度(评论量/报道数)",
        ),
        visualmap_opts=opts.VisualMapOpts(
            min_=0,
            max_=250,
            is_piecewise=True,  # 分段显示
            range_color=["#4169E1", "#FF4500"],  # 蓝色到红色的渐变
            pieces=[
                {"min": 0, "max": 50, "label": "低热度", "color": "#4169E1"},
                {"min": 50, "max": 100, "label": "中低热度", "color": "#87CEFA"},
                {"min": 100, "max": 150, "label": "中高热度", "color": "#FFA07A"},
                {"min": 150, "max": 250, "label": "高热度", "color": "#FF4500"},
            ],
        ),
        tooltip_opts=opts.TooltipOpts(
            trigger="item",
            formatter="{b}<br/>舆情热度: {c}",
        ),
    )
)

# 渲染图表
world_map.render("global_public_opinion_heatmap.html")