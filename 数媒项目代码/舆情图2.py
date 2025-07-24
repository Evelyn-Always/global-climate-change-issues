from pyecharts import options as opts
from pyecharts.charts import Map
from pyecharts.globals import ChartType, SymbolType

# 模拟舆情数据
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
    ["Turkey", 72],
    ["South Korea", 88],
    ["Indonesia", 63],
    ["Saudi Arabia", 45],
    ["Argentina", 38],
]

# 创建世界地图
world_map = (
    Map(init_opts=opts.InitOpts(
        width="100%",
        height="800px",
        bg_color="#1E1E1E"  # 深色背景提升现代感
    ))
    .add(
        series_name="舆情热度",
        data_pair=data,
        maptype="world",
        is_map_symbol_show=False,
        label_opts=opts.LabelOpts(
            is_show=False,  # 默认不显示标签
            font_size=10,
            color="rgba(255,255,255,0.7)",
            formatter="{b}"  # 只显示国家名
        ),
        itemstyle_opts=opts.ItemStyleOpts(
            border_width=0.5,
            border_color="rgba(100,149,237,1)",  # 边界线颜色
            opacity=1,
            area_color="rgba(50,50,50,0.3)",  # 无数据区域颜色
        ),
        emphasis_label_opts=opts.LabelOpts(
            is_show=True,  # 鼠标悬停时显示标签
            color="#FFFFFF"
        ),
        emphasis_itemstyle_opts=opts.ItemStyleOpts(
            area_color="rgba(255,165,0,0.8)",  # 悬停时高亮色
            border_width=1
        )
    )
    .set_global_opts(
        title_opts=opts.TitleOpts(
            title="全球舆情热力图",
            subtitle="数据为模拟舆情热度(评论量/报道数)",
            title_textstyle_opts=opts.TextStyleOpts(
                color="#FFFFFF",
                font_size=20,
                font_weight="bold"
            ),
            subtitle_textstyle_opts=opts.TextStyleOpts(
                color="rgba(255,255,255,0.7)",
                font_size=14
            )
        ),
        visualmap_opts=opts.VisualMapOpts(
            min_=0,
            max_=250,
            is_piecewise=False,  # 改为连续渐变
            range_color=["#4FC3F7", "#4A148C"],  # 现代渐变色
            range_opacity=0.8,  # 颜色透明度
            textstyle_opts=opts.TextStyleOpts(color="#FFFFFF"),
            # 添加控制组件
            pos_left="5%",
            pos_bottom="10%",
            orient="vertical"
        ),
        tooltip_opts=opts.TooltipOpts(
            trigger="item",
            formatter="{b}<br/>舆情热度: {c}",
            background_color="rgba(0,0,0,0.7)",
            border_color="#333",
            textstyle_opts=opts.TextStyleOpts(color="#FFFFFF")
        ),
        # 添加缩放控制
        toolbox_opts=opts.ToolboxOpts(
            is_show=True,
            pos_left="right",
            feature=opts.ToolBoxFeatureOpts(
                data_zoom=opts.ToolBoxFeatureDataZoomOpts(is_show=False),
                restore=opts.ToolBoxFeatureRestoreOpts(is_show=True),
                save_as_image=opts.ToolBoxFeatureSaveAsImageOpts(is_show=True)
            )
        )
    )
)

# 渲染图表
world_map.render("optimized_global_heatmap.html")