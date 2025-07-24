from pyecharts import options as opts
from pyecharts.charts import HeatMap

# 准备数据（示例数据）
data = [
    [i, j, i * j]
    for i in range(10)
    for j in range(10)
]

# 创建热力图（v2.x 语法）
heatmap = (
    HeatMap()
    .add_xaxis([f"x{i}" for i in range(10)])
    .add_yaxis(
        "series0",
        [f"y{j}" for j in range(10)],
        data,
        label_opts=opts.LabelOpts(is_show=True),
    )
    .set_global_opts(
        title_opts=opts.TitleOpts(title="热力图示例"),
        visualmap_opts=opts.VisualMapOpts(min_=0, max_=81),
    )
)

# 渲染图表
heatmap.render("heatmap.html")