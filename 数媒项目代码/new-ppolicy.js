(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Toast
  function ensureToastRoot() {
    let root = $("#toast-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "toast-root";
      root.className = "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2 pointer-events-none";
      document.body.appendChild(root);
    }
    return root;
  }
  function toast(message, type = "info", duration = 2200) {
    const root = ensureToastRoot();
    const el = document.createElement("div");
    el.className = "toast";
    el.style.borderColor = {
      success: "rgba(16,185,129,0.45)",
      warning: "rgba(245,158,11,0.45)",
      error: "rgba(244,63,94,0.45)",
      info: "rgba(148,163,184,0.45)",
    }[type] || "rgba(148,163,184,0.45)";
    el.style.background = {
      success: "linear-gradient(180deg, rgba(6,95,70,0.85), rgba(6,78,59,0.85))",
      warning: "linear-gradient(180deg, rgba(120,53,15,0.85), rgba(146,64,14,0.85))",
      error: "linear-gradient(180deg, rgba(127,29,29,0.85), rgba(153,27,27,0.85))",
      info: "rgba(2,6,23,0.85)",
    }[type] || "rgba(2,6,23,0.85)";
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => {
      el.classList.add("hide");
      setTimeout(() => el.remove(), 260);
    }, duration);
  }

  // 简易缓存
  const cache = {
    get(k) {
      try {
        const s = localStorage.getItem(k);
        if (!s) return null;
        const obj = JSON.parse(s);
        if (obj.expireAt && Date.now() > obj.expireAt) {
          localStorage.removeItem(k);
          return null;
        }
        return obj.value;
      } catch { return null; }
    },
    set(k, v, ttlMs) {
      try {
        const obj = { value: v, expireAt: ttlMs ? Date.now() + ttlMs : 0 };
        localStorage.setItem(k, JSON.stringify(obj));
      } catch {}
    }
  };

  // 源连接器（权威站点 RSS via Google News），若受限则回退 GDELT
  const Sources = [
    {
      name: "国务院/政府网（政策类）",
      type: "policy",
      rss: "https://news.google.com/rss/search?q=site:gov.cn+(%E6%B0%94%E5%80%99+OR+%E7%A2%B3+OR+%E5%87%8F%E6%8E%92+OR+%E9%80%82%E5%BA%94)+(%E6%94%BF%E7%AD%96+OR+%E9%80%9A%E7%9F%A5+OR+%E6%84%8F%E8%A7%81)&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
    },
    {
      name: "生态环境部（政策类）",
      type: "policy",
      rss: "https://news.google.com/rss/search?q=site:mee.gov.cn+(%E6%B0%94%E5%80%99+OR+%E7%A2%B3+OR+%E6%8E%92%E6%94%BE+OR+%E5%B8%82%E5%9C%BA+OR+%E7%AD%96%E7%95%A5)&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
    },
    {
      name: "国家发展改革委（政策/新闻）",
      type: "policy",
      rss: "https://news.google.com/rss/search?q=site:ndrc.gov.cn+(%E6%B0%94%E5%80%99+OR+%E7%A2%B3+OR+%E8%83%BD%E6%BA%90+OR+%E5%8F%98%E9%9D%A9)&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
    },
    {
      name: "国家能源局（新闻）",
      type: "news",
      rss: "https://news.google.com/rss/search?q=site:nea.gov.cn+(%E7%BB%BF%E7%94%B5+OR+%E6%96%B0%E8%83%BD%E6%BA%90+OR+%E9%A3%8E%E7%94%B5+OR+%E5%85%89%E4%BC%8F)&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
    }
  ];

  // 抓取工具
  async function fetchJSON(url, opts = {}) {
    const res = await fetch(url, { mode: "cors", ...opts });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
  async function fetchText(url) {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }

  // RSS->JSON（优先 rss2json，失败则自己解析XML）
  async function fetchRSS(rssUrl) {
    try {
      const j = await fetchJSON(`https://api.rss2json.com/v1/api.json?count=30&rss_url=${encodeURIComponent(rssUrl)}`);
      if (j && j.items) {
        return j.items.map(it => ({
          title: it.title,
          link: it.link,
          date: it.pubDate || it.pubDate_tz || it.pubDate_iso || it.pubDate_rfc822 || it.pubDate_utc || it.pubDate || "",
          source: (it.author || j.feed?.title || new URL(it.link).hostname),
          summary: stripHtml(it.description || ""),
        }));
      }
      return [];
    } catch {
      // fallback: AllOrigins + 自行解析 RSS XML
      try {
        const raw = await fetchJSON(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`);
        const xml = new DOMParser().parseFromString(raw.contents || "", "application/xml");
        const items = Array.from(xml.querySelectorAll("item"));
        return items.map(node => {
          const title = node.querySelector("title")?.textContent?.trim() || "";
          const link = node.querySelector("link")?.textContent?.trim() || "";
          const date = node.querySelector("pubDate")?.textContent?.trim() || "";
          const source = new URL(link).hostname;
          const summary = stripHtml(node.querySelector("description")?.textContent || "");
          return { title, link, date, source, summary };
        });
      } catch {
        return [];
      }
    }
  }

  // GDELT 兜底（ArtList JSON），限定站点与关键词
  async function fetchGDELT(query, timespan = "12 months", maxrecords = 30) {
    try {
      const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=${maxrecords}&format=json&timespan=${encodeURIComponent(timespan)}`;
      const j = await fetchJSON(url);
      const items = j.articles || [];
      return items.map(a => ({
        title: a.title,
        link: a.url,
        date: a.seendate ? a.seendate.slice(0, 10) : "",
        source: a.sourceCommonName || (a.domain || (a.url ? new URL(a.url).hostname : "")),
        summary: "", // 后续从正文抽取
      }));
    } catch { return []; }
  }

  // 正文抓取：优先 AllOrigins -> 解析常见正文容器；失败再用 Jina Reader（纯文本）
  async function fetchArticleContent(url) {
    const cacheKey = `article:${url}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Step 1: AllOrigins 原文 HTML
    try {
      const raw = await fetchJSON(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const html = raw.contents || "";
      const doc = new DOMParser().parseFromString(html, "text/html");
      const sel = [
        "#UCAP-CONTENT", ".article-content", ".content", "#content", ".article", "#Zoom", ".xlcontent", ".TRS_Editor", ".entry-content", ".page-content"
      ];
      let node = null;
      for (const s of sel) { node = doc.querySelector(s); if (node) break; }
      if (!node) {
        // 如果找不到容器，则取正文最长的 <p> 聚合
        const ps = Array.from(doc.querySelectorAll("p")).filter(p => p.textContent && p.textContent.trim().length > 30);
        const frag = document.createElement("div");
        ps.slice(0, 40).forEach(p => {
          const np = document.createElement("p");
          np.textContent = p.textContent.trim();
          frag.appendChild(np);
        });
        node = frag;
      }
      // 清理链接/脚注等
      node.querySelectorAll("script,style,noscript").forEach(el => el.remove());
      const cleaned = node.innerHTML;
      const text = stripHtml(cleaned);
      const result = { html: cleaned, text };
      cache.set(cacheKey, result, 1000 * 60 * 60 * 6); // 6小时缓存
      return result;
    } catch {
      // Step 2: Jina Reader 文本兜底
      try {
        const txt = await fetchText(`https://r.jina.ai/http://` + url.replace(/^https?:\/\//, ""));
        const keep = txt.split("\n").filter(line => line.trim().length > 0).slice(0, 400).join("\n");
        const html = `<div class="space-y-3">${keep.split("\n").map(t => `<p>${escapeHtml(t)}</p>`).join("")}</div>`;
        const result = { html, text: keep };
        cache.set(cacheKey, result, 1000 * 60 * 60 * 6);
        return result;
      } catch {
        return { html: `<p class="text-gray-400">暂无法抓取正文，请点击上方“查看官方原文”。</p>`, text: "" };
      }
    }
  }

  // 归一化工具
  function classifyTypeByTitle(defaultType, title) {
    if (/通知|意见|办法|规定|标准|指南|方案|通告|公告|条例|决定/.test(title)) return "policy";
    return defaultType || "news";
  }
  function inferTags(text) {
    const T = [];
    const add = (t) => { if (!T.includes(t)) T.push(t); };
    if (/碳市场|配额|交易|CCER|绿证/.test(text)) add("碳市场");
    if (/数据质量|核查|监测|披露|统计/.test(text)) add("数据与核查");
    if (/风电|光伏|新能源|绿电|储能|电网|并网/.test(text)) add("能源电力");
    if (/城市|韧性|海绵|规划|基础设施/.test(text)) add("城市建设");
    if (/风险|极端|预警|应急|灾害/.test(text)) add("风险应对");
    if (/农业|水资源|生态|生物多样性/.test(text)) add("生态与资源");
    if (T.length === 0) add("综合");
    return T;
  }
  function hostOf(url) { try { return new URL(url).hostname; } catch { return ""; } }
  function stripHtml(html) { return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
  function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function hashId(s) {
    let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
    return "n-" + Math.abs(h);
  }

  // 加载权威数据（RSS 优先，GDELT 兜底）
  async function loadAuthoritative() {
    const cacheKey = "news:authoritative";
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    let items = [];
    // RSS 扫描
    for (const src of Sources) {
      try {
        const rssItems = await fetchRSS(src.rss);
        const mapped = rssItems.map(r => {
          const id = hashId(r.link);
          const type = classifyTypeByTitle(src.type, r.title);
          const date = r.date ? (new Date(r.date).toISOString().slice(0, 10)) : "";
          return {
            id, type,
            date, source: hostOf(r.link),
            region: "全国", // 无法可靠判断地区，统一标注为全国（可在详情页原文核实）
            views: null, // 无后端不造数据
            title: r.title,
            summary: r.summary || "",
            url: r.link,
            tags: inferTags(r.title + " " + (r.summary || "")),
            _srcName: src.name,
          };
        });
        items = items.concat(mapped);
      } catch { /* 忽略单源错误 */ }
    }

    // 若 RSS 为空，调用 GDELT 兜底
    if (items.length === 0) {
      const q = '(site:gov.cn OR site:mee.gov.cn OR site:ndrc.gov.cn OR site:nea.gov.cn) (气候 OR 碳 OR 减排 OR 适应 OR 新能源)';
      const gd = await fetchGDELT(q, "12 months", 40);
      items = gd.map(r => {
        const id = hashId(r.link);
        const type = classifyTypeByTitle("news", r.title);
        return {
          id, type,
          date: r.date || "",
          source: hostOf(r.link),
          region: "全国",
          views: null,
          title: r.title,
          summary: r.summary || "",
          url: r.link,
          tags: inferTags(r.title),
          _srcName: "GDELT",
        };
      });
    }

    // 去重、排序（按日期降序）
    const uniq = {};
    items.forEach(x => { uniq[x.url] = x; });
    const list = Object.values(uniq).sort((a, b) => (a.date < b.date ? 1 : -1));

    cache.set(cacheKey, list, 1000 * 60 * 20); // 20 分钟缓存列表
    return list;
  }

  // 全局状态
  let allNews = [];
  let filtered = [];
  let page = 1;
  const pageSize = 6;
  let currentId = null;
  let autoRefreshTimer = null;
  const savedSet = new Set();

  // 渲染
  function renderList(reset = false) {
    const listEl = $("#news-list");
    if (reset) {
      listEl.innerHTML = "";
      page = 1;
    }
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    if (items.length === 0 && page === 1) {
      listEl.innerHTML = `<div class="text-center text-gray-400 py-8">暂无内容</div>`;
    } else {
      items.forEach((n) => listEl.appendChild(renderItem(n)));
    }
    $("#news-count").textContent = `共 ${filtered.length} 条内容`;
    const moreBtn = $("#load-more-news");
    const hasMore = start + pageSize < filtered.length;
    moreBtn.disabled = !hasMore;
    moreBtn.textContent = hasMore ? "加载更多" : "没有更多内容了";
    if (!hasMore) moreBtn.classList.add("opacity-60", "cursor-not-allowed");
    else moreBtn.classList.remove("opacity-60", "cursor-not-allowed");
  }

  function renderItem(n) {
    const el = document.createElement("div");
    el.className = "news-item mb-3";
    el.dataset.id = n.id;
    const isPolicy = n.type === "policy";
    el.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-2 h-2 mt-2 rounded-full ${isPolicy ? "bg-emerald-400" : "bg-cyan-400"}"></div>
        <div class="flex-grow min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="${isPolicy ? "badge-emerald" : "badge-cyan"} text-xs">${isPolicy ? "政策文件" : "最新新闻"}</span>
            <span class="text-xs text-gray-400">${n.date || "-"}</span>
            <span class="text-[10px] text-gray-500 border border-gray-700/60 rounded px-1.5 py-0.5" title="${n._srcName || ""}">${n.source}</span>
          </div>
          <h4 class="font-medium text-white truncate" title="${n.title}">${n.title}</h4>
          <p class="text-gray-300 text-sm mt-1 line-clamp-2">${n.summary || ""}</p>
          <div class="flex items-center justify-between mt-2 text-xs text-gray-400">
            <div class="flex flex-wrap gap-1">
              ${(n.tags || []).slice(0, 3).map((t) => `<span class="tag">${t}</span>`).join("")}
            </div>
            <div class="flex items-center gap-3">
              ${n.views ? `<span><i class="fa fa-eye mr-1"></i>${Number(n.views).toLocaleString()}</span>` : ""}
              <button class="icon-btn mini-save" title="收藏"><i class="fa ${savedSet.has(n.id) ? "fa-star" : "fa-star-o"}"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;
    el.addEventListener("click", (e) => {
      if (e.target.closest(".mini-save")) return;
      openDetail(n.id);
      if (window.innerWidth < 1024) $("#news-detail-container").scrollIntoView({ behavior: "smooth" });
    });
    $(".mini-save", el)?.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSave(n.id, e.currentTarget.querySelector("i"));
    });
    return el;
  }

  function toggleSave(id, iconEl) {
    if (savedSet.has(id)) {
      savedSet.delete(id);
      iconEl.className = "fa fa-star-o";
      toast("已取消收藏", "info");
    } else {
      savedSet.add(id);
      iconEl.className = "fa fa-star";
      toast("已收藏", "success");
    }
  }

  // 筛选/搜索/排序
  function applyFilters() {
    const type = ($("#news-type-filter")?.value || "").trim();
    const time = ($("#news-time-filter")?.value || "").trim();
    const region = ($("#news-region-filter")?.value || "").trim();
    const q = ($("#news-search")?.value || "").trim().toLowerCase();

    const now = new Date();
    filtered = allNews.filter((n) => {
      if (type && n.type !== type) return false;
      if (region && n.region !== region) return false;
      if (time) {
        const d = n.date ? new Date(n.date) : null;
        if (!d) return false;
        const diff = (now - d) / (1000 * 60 * 60 * 24);
        if (diff > Number(time)) return false;
      }
      if (q) {
        const hay = [n.title, n.summary, n.source, (n.tags || []).join(" ")].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => (a.date < b.date ? 1 : -1));
    renderList(true);
  }

  function smartSort() {
    const score = (n) => {
      const freshness = n.date ? (1 / Math.max(1, (Date.now() - new Date(n.date).getTime()) / (1000 * 60 * 60 * 24))) : 0.1;
      const policyBoost = n.type === "policy" ? 0.25 : 0;
      const tagBoost = Math.min((n.tags?.length || 0) * 0.05, 0.3);
      return freshness * 1.2 + tagBoost + policyBoost;
    };
    filtered.sort((a, b) => score(b) - score(a));
    renderList(true);
    toast("已应用智能排序", "success");
  }

  // 详情 + 抽取式 AI
  async function openDetail(id) {
    const n = allNews.find((x) => x.id === id);
    if (!n) return;
    currentId = id;

    $("#detail-title").textContent = n.title;
    $("#detail-date").textContent = n.date || "-";
    $("#detail-source").textContent = n.source || "-";
    $("#detail-region").textContent = n.region || "—";
    if (n.views) {
      $("#detail-views").textContent = `${Number(n.views).toLocaleString()} 次浏览`;
      $("#detail-views-wrap").classList.remove("hidden");
    } else {
      $("#detail-views-wrap").classList.add("hidden");
    }
    $("#detail-link").href = n.url || "#";
    const typeEl = $("#detail-current-type");
    if (n.type === "policy") { typeEl.className = "badge-emerald"; typeEl.textContent = "政策文件"; }
    else { typeEl.className = "badge-cyan"; typeEl.textContent = "最新新闻"; }
    $("#detail-tags").innerHTML = (n.tags || []).map((t) => `<span class="tag">${t}</span>`).join("");

    // 正文抓取
    $("#detail-content").innerHTML = `<p class="text-gray-400"><i class="fa fa-spinner fa-spin mr-2"></i> 正在抓取官方原文...</p>`;
    const article = await fetchArticleContent(n.url);
    $("#detail-content").innerHTML = article.html;

    // 抽取式分析
    runAIExtractive(n, article.text || stripHtml(article.html || ""));
    $("#news-detail-placeholder").classList.add("hidden");
    $("#news-detail-content").classList.remove("hidden");
  }

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function sentenceSplit(text) {
    return (text || "").replace(/([。！？!?])/g, "$1\n").split("\n").map(s => s.trim()).filter(Boolean);
  }
  function runAIExtractive(n, plainText) {
    const sentences = sentenceSplit(plainText);
    const title = n.title || "";
    // 关键词权重
    const keywords = [
      [/通知|意见|办法|规定|标准|指南|方案|条例|决定/, 3.0],
      [/碳市场|配额|交易|核查|数据质量|披露/, 2.4],
      [/风电|光伏|新能源|绿电|储能|并网|电网/, 2.2],
      [/城市|韧性|海绵|基础设施|排涝|热岛/, 2.0],
      [/风险|极端|预警|应急|灾害/, 2.0],
      [/实施|范围|对象|时间|目标|措施|机制|试点/, 1.8],
    ];
    const titleTerms = title.split(/\s+/).filter(Boolean);

    const scored = sentences.map(s => {
      let score = 0.2; // 基础分
      for (const [re, w] of keywords) { if (re.test(s)) score += w; }
      titleTerms.forEach(t => { if (t && s.includes(t)) score += 0.3; });
      score += Math.min(s.length / 40, 1.2); // 偏好信息量较高句子
      return { s, score };
    }).sort((a, b) => b.score - a.score);

    const summary = scored.slice(0, 3).map(x => x.s).join(" ");
    $("#ai-summary").textContent = summary || (n.summary || "暂无摘要");

    const keypoints = scored.filter(x => /将|提出|明确|包括|覆盖|机制|标准|试点|风险|数据|核查|配额|实施|范围|对象|时间|目标|措施/.test(x.s))
                            .slice(0, 6).map(x => x.s);
    const ul = $("#ai-keypoints");
    ul.innerHTML = "";
    (keypoints.length ? keypoints : scored.slice(0, 5).map(x => x.s)).forEach(p => {
      const li = document.createElement("li"); li.textContent = p; ul.appendChild(li);
    });

    const sectors = inferTags(title + " " + plainText).map(t => t.replace(/与/g, "与"));
    $("#ai-sectors").innerHTML = sectors.map(s => `<span class="tag">${s}</span>`).join("");

    // 可视化指标（规则打分，不臆测具体数值含义）
    const impact = clamp01(0.35 + Math.min(plainText.length / 3000, 0.35) + (n.type === "policy" ? 0.2 : 0) + Math.min(sectors.length * 0.05, 0.2));
    const risk = clamp01(sectors.includes("风险应对") ? 0.65 : 0.35 + Math.min((plainText.match(/风险|预警|灾害|极端/g)||[]).length * 0.04, 0.25));
    const sentiment = clamp01(n.type === "policy" ? 0.6 : 0.5 + Math.min((plainText.match(/促进|提升|完善|优化|加强/g)||[]).length * 0.03, 0.2));
    setBar("#ai-impact", "#ai-impact-label", impact, ["低", "中", "高"]);
    setBar("#ai-risk", "#ai-risk-label", risk, ["低", "中", "高"]);
    setBar("#ai-sentiment", "#ai-sentiment-label", sentiment, ["消极", "中性", "积极"]);

    // 复制/导出
    $("#ai-copy-points").onclick = async () => {
      const text = `【${n.title}】要点（来自原文句子）：\n- ${Array.from(ul.querySelectorAll("li")).map(li => li.textContent).join("\n- ")}`;
      try { await navigator.clipboard.writeText(text); toast("关键要点已复制", "success"); }
      catch { toast("复制失败，请重试", "error"); }
    };
    $("#ai-export").onclick = () => {
      const blob = new Blob(
        [[
          `标题: ${n.title}`,
          `日期: ${n.date}`,
          `来源: ${n.source}`,
          `类型: ${n.type === "policy" ? "政策文件" : "最新新闻"}`,
          `标签: ${(n.tags || []).join(", ")}`,
          "",
          `AI 概览:`,
          `- 政策影响(规则评分): ${(impact * 100).toFixed(0)}%`,
          `- 风险水平(规则评分): ${(risk * 100).toFixed(0)}%`,
          `- 公众情绪(规则评分): ${(sentiment * 100).toFixed(0)}%`,
          "",
          `摘要(原文句子抽取): ${$("#ai-summary").textContent}`,
          "",
          `关键要点(原文句子):\n- ${Array.from($("#ai-keypoints").querySelectorAll("li")).map(li => li.textContent).join("\n- ")}`,
          "",
          `原文链接: ${n.url}`
        ].join("\n")],
        { type: "text/plain;charset=utf-8" });
      downloadBlob(blob, `${sanitizeFilename(n.title)}-抽取式分析.txt`);
      toast("分析已导出", "success");
    };

    // QA（检索式回答：返回匹配句子）
    $("#ai-qa-ask").onclick = () => {
      const q = ($("#ai-qa-input")?.value || "").trim();
      if (!q) return;
      const ans = answerByRetrieval(plainText, q);
      $("#ai-qa-answer").innerHTML = ans || `<span class="text-gray-400">未在原文中检索到相关信息，请查看官方原文。</span>`;
    };
  }

  function setBar(selBar, selLabel, v, labels) {
    const bar = $(selBar); const label = $(selLabel);
    if (!bar || !label) return;
    bar.style.width = `${Math.round(v * 100)}%`;
    label.textContent = v < 0.34 ? labels[0] : v < 0.67 ? labels[1] : labels[2];
  }
  function sanitizeFilename(s) { return s.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80); }
  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // 检索式问答：返回匹配度高的原文句子
  function answerByRetrieval(text, q) {
    const sents = sentenceSplit(text);
    const qs = q.toLowerCase();
    const keys = q.split(/[\s,，。；;、]/).filter(Boolean);
    const scored = sents.map(s => {
      const sl = s.toLowerCase();
      let sc = 0;
      keys.forEach(k => { if (k && (sl.includes(k.toLowerCase()))) sc += 2; });
      if (/时间|日期|何时|when|date/.test(qs) && /年|月|日|号|\d{4}/.test(s)) sc += 1.5;
      if (/范围|行业|适用|覆盖|scope/.test(qs) && /范围|覆盖|适用|行业|对象|领域/.test(s)) sc += 1.5;
      if (/措施|机制|目标|标准|要求|实施/.test(qs) && /措施|机制|目标|标准|要求|实施/.test(s)) sc += 1.2;
      return { s, sc };
    }).filter(x => x.sc > 0.5).sort((a, b) => b.sc - a.sc).slice(0, 4);
    if (scored.length === 0) return "";
    return scored.map(x => "• " + escapeHtml(x.s)).join("<br/>");
  }

  // 工具栏
  function wireToolbar() {
    $("#news-type-filter")?.addEventListener("change", applyFilters);
    $("#news-time-filter")?.addEventListener("change", applyFilters);
    $("#news-region-filter")?.addEventListener("change", applyFilters);
    $("#news-search")?.addEventListener("keyup", (e) => { if (e.key === "Enter") applyFilters(); });
    $("#smart-sort")?.addEventListener("click", smartSort);

    $("#refresh-news")?.addEventListener("click", async () => {
      const btn = $("#refresh-news");
      const prev = btn.innerHTML;
      btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
      cache.set("news:authoritative", null, 1); // 清空缓存入口
      try {
        allNews = await loadAuthoritative();
        applyFilters();
        toast("已从权威源更新（RSS/GDELT）", "success");
      } catch {
        toast("刷新失败，请稍后重试", "error");
      } finally {
        btn.innerHTML = prev;
      }
    });

    $("#auto-refresh-interval")?.addEventListener("change", (e) => {
      const val = Number(e.target.value || 0);
      if (autoRefreshTimer) clearInterval(autoRefreshTimer);
      if (val > 0) {
        autoRefreshTimer = setInterval(() => $("#refresh-news")?.click(), val * 1000);
        toast(`已设置自动刷新`, "info");
      } else {
        toast("已关闭自动刷新", "info");
      }
    });

    $("#load-more-news")?.addEventListener("click", () => {
      const btn = $("#load-more-news");
      const prev = btn.innerHTML;
      btn.innerHTML = '<i class="fa fa-spinner fa-spin mr-1"></i>加载中...';
      setTimeout(() => { page += 1; renderList(false); btn.innerHTML = prev; }, 500);
    });
  }

  // 详情区动作
  function wireDetailActions() {
    $("#back-to-list")?.addEventListener("click", () => {
      $("#news-detail-content").classList.add("hidden");
      $("#news-detail-placeholder").classList.remove("hidden");
      if (window.innerWidth < 1024) $("#news-list-container").scrollIntoView({ behavior: "smooth" });
    });

    $("#save-news")?.addEventListener("click", () => {
      if (!currentId) return;
      const icon = $("#save-news i");
      toggleSave(currentId, icon);
    });

    $("#share-news")?.addEventListener("click", async () => {
      if (!currentId) return;
      const n = allNews.find((x) => x.id === currentId);
      const link = location.origin + location.pathname + `#${encodeURIComponent(n.id)}`;
      try {
        await navigator.clipboard.writeText(link);
        toast("分享链接已复制", "success");
      } catch {
        toast("复制失败，请手动复制", "error");
      }
    });
  }

  // 初始化
  async function init() {
    wireToolbar();
    wireDetailActions();
    try {
      allNews = await loadAuthoritative();
      filtered = allNews.slice();
      applyFilters();
      // 支持 hash 直达
      const hashId = decodeURIComponent(location.hash.replace(/^#/, ""));
      if (hashId && allNews.some(n => n.id === hashId)) {
        await openDetail(hashId);
        setTimeout(() => $("#news-detail-container").scrollIntoView({ behavior: "smooth" }), 60);
      }
    } catch {
      toast("初始化失败，请检查网络或稍后再试", "error");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();