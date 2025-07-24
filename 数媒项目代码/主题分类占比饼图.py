from pyecharts import options as opts
from pyecharts.charts import Pie

# 舆情主题分类数据
topic_data = [
    ("政策讨论", 30),
    ("影响评估", 50),
    ("事件报道", 15),
    ("其他", 5)
]

# 创建饼图
pie = (
    Pie()
    .add(
        series_name="舆情主题分布",
        data_pair=topic_data,
        radius=["30%", "70%"],  # 设置为环形图，去掉这部分就是普通饼图
        label_opts=opts.LabelOpts(formatter="{b}: {d}%")  # 显示百分比
    )
    .set_global_opts(
        title_opts=opts.TitleOpts(title="舆情主题分类占比", subtitle="数据来源：舆情监测系统"),
        legend_opts=opts.LegendOpts(orient="vertical", pos_top="15%", pos_left="2%")
    )
    .set_series_opts(
        tooltip_opts=opts.TooltipOpts(
            trigger="item",
            formatter="{a}<br/>{b}: {c}% ({d}%)"
        ),
        label_opts=opts.LabelOpts(color="rgba(0, 0, 0, 0.8)")
    )
)

# 渲染图表（生成HTML文件）
pie.render("主题 分类 占比饼图.html")

