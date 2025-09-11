(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Toast
  function toast(message, type = "info", duration = 2200) {
    const root = $("#toast-root");
    if (!root) return;
    const color = {
      info: "bg-dark-300 text-white border-dark-200",
      success: "bg-emerald-600 text-white border-emerald-500",
      warning: "bg-amber-600 text-white border-amber-500",
      error: "bg-rose-600 text-white border-rose-500",
    }[type] || "bg-dark-300 text-white border-dark-200";

    const el = document.createElement("div");
    el.className =
      "min-w-[200px] max-w-[70vw] px-3 py-2 rounded border shadow-lg " +
      color +
      " animate-fadein";
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => {
      el.classList.add("animate-fadeout");
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  // Modal
  const modal = {
    root: $("#app-modal-root"),
    overlay: $("#app-modal-overlay"),
    titleEl: $("#app-modal-title"),
    bodyEl: $("#app-modal-body"),
    closeBtn: $("#app-modal-close"),
    open({ title = "预览", body }) {
      this.titleEl.textContent = title;
      this.bodyEl.innerHTML = "";
      if (typeof body === "string") {
        this.bodyEl.innerHTML = body;
      } else if (body instanceof Node) {
        this.bodyEl.appendChild(body);
      }
      this.root.classList.remove("hidden");
      this.root.classList.add("flex");
    },
    close() {
      this.root.classList.add("hidden");
      this.root.classList.remove("flex");
      this.bodyEl.innerHTML = "";
    },
    init() {
      // 直接给关闭按钮绑定（避免点到内部图标无法匹配的问题）
      this.closeBtn?.addEventListener("click", () => this.close());
      // 点击遮罩关闭
      this.overlay?.addEventListener("click", () => this.close());
      // Esc 关闭
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.root?.classList.contains("flex")) {
          this.close();
        }
      });
    },
  };
  modal.init();

  // Helpers
  function withLoading(btn, fn) {
    return async (...args) => {
      if (!btn) return fn(...args);
      const originalHtml = btn.innerHTML;
      const originalDisabled = btn.disabled;
      btn.disabled = true;
      btn.innerHTML = `<i class="fa fa-spinner fa-spin mr-1"></i>处理中`;
      try {
        return await fn(...args);
      } finally {
        btn.disabled = originalDisabled;
        btn.innerHTML = originalHtml;
      }
    };
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Demo data generators (replace with real endpoints if available)
  function generateCSV() {
    const rows = [
      ["日期", "正面", "中性", "负面", "总量"],
      ["2025-07-01", 1234, 2345, 321, 3900],
      ["2025-07-02", 1432, 2210, 412, 4054],
      ["2025-07-03", 1520, 2004, 501, 4025],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    return new Blob([csv], { type: "text/csv;charset=utf-8" });
  }
  // 兼容旧命名
  const generateExcelCSV = generateCSV;

  function generatePDFLike(title) {
    const content =
      `模拟PDF文件：${title}\n\n` +
      "请在后端返回真实 PDF 或用 jsPDF 生成。\n";
    return new Blob([content], { type: "application/pdf" });
  }

  function generateJSON() {
    const data = {
      generatedAt: new Date().toISOString(),
      items: Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        province: ["北京", "上海", "广东", "浙江", "四川"][i % 5],
        sentiment: ["positive", "neutral", "negative"][i % 3],
        count: Math.floor(Math.random() * 1000) + 100,
      })),
    };
    return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  }

  function generatePNG(title) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");

    // Background gradient
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, "#0f172a");
    g.addColorStop(1, "#1f2937");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Accent shape
    ctx.fillStyle = "rgba(59,130,246,0.25)";
    ctx.beginPath();
    ctx.arc(300, 100, 300, 0, Math.PI * 2);
    ctx.fill();

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    ctx.fillText(title, 60, 160);

    // Subtitle
    ctx.fillStyle = "#d1d5db";
    ctx.font = "24px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    ctx.fillText("国家气候变化舆情可视化面板", 60, 210);

    // Timestamp
    ctx.font = "20px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    ctx.fillText(new Date().toLocaleString(), 60, 250);

    // Simple chart lines
    const baseY = 480;
    const leftX = 80;
    const width = 1040;
    const height = 260;

    // Axis
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftX, baseY - height);
    ctx.lineTo(leftX, baseY);
    ctx.lineTo(leftX + width, baseY);
    ctx.stroke();

    // Line series
    function drawSeries(color, amp, phase) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const x = leftX + (i / 40) * width;
        const y = baseY - height / 2 - Math.sin(i / 4 + phase) * amp - (Math.random() * 12 - 6);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    drawSeries("#22c55e", 70, 0);
    drawSeries("#ef4444", 50, 1.2);
    drawSeries("#3b82f6", 40, 2.3);

    const dataUrl = canvas.toDataURL("image/png");
    const byteString = atob(dataUrl.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: "image/png" });
  }

  // Share Card generation
  let lastCardBlob = null;
  let lastCardTitle = "";
  async function generateShareCard(selected) {
    const title = selected || "舆情数据分享";
    lastCardTitle = title;
    lastCardBlob = generatePNG(title);
    toast("分享卡片已生成", "success");
    return lastCardBlob;
  }

  function previewShareCard() {
    if (!lastCardBlob) {
      toast("请先点击“生成卡片”", "warning");
      return;
    }
    const url = URL.createObjectURL(lastCardBlob);
    const img = document.createElement("img");
    img.src = url;
    img.alt = "分享卡片预览";
    img.className = "max-w-full h-auto rounded-lg border border-dark-300";
    const footer = document.createElement("div");
    footer.className = "mt-3 flex items-center gap-2";
    const dl = document.createElement("button");
    dl.className = "bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded text-sm";
    dl.innerHTML = `<i class="fa fa-download mr-1"></i>下载图片`;
    dl.onclick = () => downloadBlob(lastCardBlob, `${lastCardTitle || "share-card"}.png`);
    const useAsShare = document.createElement("button");
    useAsShare.className = "bg-dark-300 hover:bg-dark-200 text-white px-3 py-2 rounded text-sm border border-dark-200";
    useAsShare.innerHTML = `<i class="fa fa-link mr-1"></i>复制分享标题`;
    useAsShare.onclick = async () => {
      try {
        await navigator.clipboard.writeText(lastCardTitle);
        toast("已复制分享标题", "success");
      } catch {
        toast("复制失败，请手动复制", "error");
      }
    };

    const wrap = document.createElement("div");
    wrap.appendChild(img);
    wrap.appendChild(footer);
    footer.appendChild(dl);
    footer.appendChild(useAsShare);
    modal.open({ title: "分享卡片预览", body: wrap });
  }

  // Download handlers
  async function handleDownload(itemEl, btn) {
    const title = itemEl.dataset.title || "下载";
    const format = (itemEl.dataset.format || "").toLowerCase();
    const originalName = itemEl.dataset.filename || "download.dat";
    let fileName = originalName;
    const url = itemEl.dataset.url;

    const run = async () => {
      // 后端直链
      if (url && /^https?:\/\//.test(url)) {
        const res = await fetch(url);
        if (!res.ok) throw new Error("下载失败");
        const blob = await res.blob();
        downloadBlob(blob, fileName);
        toast(`已开始下载：${title}`, "success");
        return;
      }

      // 本地生成
      let blob;
      switch (format) {
        case "csv":
          blob = generateCSV();
          if (!/\.csv$/i.test(fileName)) fileName = fileName.replace(/\.[^/.]+$/, "") + ".csv";
          break;
        case "excel": // 兼容旧数据，导出为 CSV，Excel 可打开
          blob = generateCSV();
          fileName = fileName.replace(/\.[^/.]+$/, "") + ".csv";
          toast("已导出为 CSV（Excel 可直接打开）", "info");
          break;
        case "pdf":
          blob = generatePDFLike(title);
          break;
        case "json":
          blob = generateJSON();
          break;
        case "image":
          blob = generatePNG(title);
          break;
        default:
          blob = new Blob([`${title} 下载示例文件`], { type: "text/plain" });
      }
      downloadBlob(blob, fileName);
      toast(`已开始下载：${title}`, "success");
    };

    return withLoading(btn, run)();
  }

  function wireDownloads() {
    $$(".download-item").forEach((item) => {
      const btn = $(".download-btn", item);
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          handleDownload(item, btn);
        });
      }
      item.addEventListener("click", (e) => {
        if (e.target.closest(".download-btn")) return;
        handleDownload(item, btn);
      });
    });
  }

  // Share link and platforms
  function getShareLink() {
    const input = $("#share-link-input");
    return input?.value?.trim() || location.href;
  }

  function openPopup(url, w = 720, h = 560) {
    const y = window.top.outerHeight / 2 + window.top.screenY - h / 2;
    const x = window.top.outerWidth / 2 + window.top.screenX - w / 2;
    window.open(url, "_blank", `toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=${w}, height=${h}, top=${y}, left=${x}`);
  }

  function wireSharing() {
    const shareButtons = $$(".share-btn");
    shareButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const platform = btn.dataset.platform;
        const url = getShareLink();
        const title = encodeURIComponent("国家气候变化舆情可视化面板");
        const encodedUrl = encodeURIComponent(url);

        if (platform === "weibo") {
          const shareUrl = `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${title}`;
          openPopup(shareUrl);
        } else if (platform === "linkedin") {
          const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
          openPopup(shareUrl);
        } else if (platform === "email") {
          const mailto = `mailto:?subject=${title}&body=${encodedUrl}`;
          window.location.href = mailto;
        } else if (platform === "wechat") {
          const img = document.createElement("img");
          img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodedUrl}`;
          img.alt = "微信扫码分享";
          img.className = "mx-auto rounded border border-dark-300 bg-white p-2";
          const hint = document.createElement("p");
          hint.className = "text-dark-100 text-sm mt-3 text-center";
          hint.textContent = "使用微信扫描二维码分享";
          const wrap = document.createElement("div");
          wrap.className = "flex flex-col items-center";
          wrap.appendChild(img);
          wrap.appendChild(hint);
          modal.open({ title: "微信分享", body: wrap });
        }
      });
    });

    const copyBtn = $("#copy-link-btn");
    copyBtn?.addEventListener(
      "click",
      withLoading(copyBtn, async () => {
        const url = getShareLink();
        try {
          await navigator.clipboard.writeText(url);
          toast("链接已复制", "success");
        } catch {
          const input = $("#share-link-input");
          input?.select();
          document.execCommand("copy");
          toast("链接已复制（兼容模式）", "success");
        }
      })
    );
  }

  // Share card generation
  function wireShareCard() {
    const select = $("#share-content-select");
    const genBtn = $("#generate-card-btn");
    const previewBtn = $("#preview-card-btn");

    genBtn?.addEventListener(
      "click",
      withLoading(genBtn, async () => {
        let selected = select?.value || "";
        if (!selected) {
          toast("请先选择分享内容", "warning");
          return;
        }
        if (selected === "自定义内容") {
          const custom = prompt("请输入自定义分享标题：", "我的舆情分享");
          if (!custom) return;
          selected = custom.trim();
        }
        await generateShareCard(selected);
      })
    );

    previewBtn?.addEventListener("click", () => previewShareCard());
  }

  // Small CSS animations (optional)
  (function injectAnimations() {
    const style = document.createElement("style");
    style.innerHTML = `
@keyframes fadein { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
@keyframes fadeout { from { opacity: 1; transform: translateY(0) } to { opacity: 0; transform: translateY(6px) } }
.animate-fadein { animation: fadein .18s ease-out both; }
.animate-fadeout { animation: fadeout .18s ease-in both; }
`;
    document.head.appendChild(style);
  })();

  // Init
  function init() {
    wireDownloads();
    wireSharing();
    wireShareCard();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();