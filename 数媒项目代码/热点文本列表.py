import feedparser


def get_bbc_climate_rss():
    url = "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml"
    feed = feedparser.parse(url)

    articles = []
    for entry in feed.entries[:10]:  # 只取最新10条
        if any(keyword in entry.title.lower()
               for keyword in ['climate', 'environment', 'warming']):
            articles.append({
                'title': entry.title,
                'url': entry.link,
                'date': entry.published,
                'summary': entry.summary,
                'source': 'BBC RSS'
            })
    return articles