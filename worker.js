export default {
  async fetch() {
    const nodes = [
      {
        id: 'node-evos',
        provider: 'EVOS',
        plan: '2025-02-24',
        flag: '🇸🇬',
        status: 'online',
        stats: {
          cpu: 34,
          memory: 29,
          disk: 18,
          uptime: '7天 21小时',
          networkIn: '2.57MB/s',
          networkOut: '1.97GBps',
          ip: '165.68GB',
          bandwidth: '1Gbps',
        },
        hardware: {
          cpu: '4 Core',
          memory: '8GB',
          storage: '120GB SSD',
        },
        datacenter: '新加坡',
        tags: ['主站', '京东监控'],
      },
      {
        id: 'node-mypre',
        provider: 'MYPRE3GBPS',
        plan: '2025-02-18',
        flag: '🇺🇸',
        status: 'warning',
        stats: {
          cpu: 67,
          memory: 53,
          disk: 22,
          uptime: '3天 9小时',
          networkIn: '980KB/s',
          networkOut: '1.6Gbps',
          ip: '44.2GB',
          bandwidth: '1Gbps',
        },
        hardware: {
          cpu: '4 Core',
          memory: '8GB',
          storage: '200GB SSD',
        },
        datacenter: '洛杉矶',
        tags: ['落地页', '备用线路'],
      },
      {
        id: 'node-coloc',
        provider: 'COLOCROSSING',
        plan: '月头',
        flag: '🇯🇵',
        status: 'offline',
        stats: {
          cpu: 12,
          memory: 89,
          disk: 46,
          uptime: '13天 5小时',
          networkIn: '369KB/s',
          networkOut: '446KB/s',
          ip: '36.8GB',
          bandwidth: '1Gbps',
        },
        hardware: {
          cpu: '1 Core',
          memory: '1GB',
          storage: '25GB SSD',
        },
        datacenter: '大阪',
        tags: ['工单', '主节点'],
      },
    ];

    const html = renderDocument(nodes);

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    });
  },
};

function renderDocument(nodes) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>监控面板</title>
    <style>
      :root {
        color-scheme: light;
        font-family: 'Inter', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
        background: #f6f7fb;
        color: #1f2937;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 32px;
        min-height: 100vh;
        background: radial-gradient(circle at top left, rgba(74,222,128,0.15), transparent 45%),
          radial-gradient(circle at bottom right, rgba(59,130,246,0.15), transparent 40%),
          #f6f7fb;
      }

      .dashboard {
        max-width: 1100px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .dashboard-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .dashboard-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .dashboard-title h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }

      .dashboard-title span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px 12px;
        border-radius: 999px;
        background: #e8f5ff;
        color: #1d4ed8;
        font-size: 13px;
        font-weight: 600;
      }

      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .pill-group {
        display: inline-flex;
        padding: 4px;
        border-radius: 999px;
        background: #ffffff;
        box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
      }

      .pill {
        border: 0;
        background: transparent;
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pill.is-active {
        background: linear-gradient(135deg, #34d399, #10b981);
        color: white;
        box-shadow: 0 8px 16px rgba(16, 185, 129, 0.25);
      }

      .search-input {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        color: #94a3b8;
        font-size: 14px;
      }

      .search-input input {
        border: none;
        outline: none;
        font-size: 14px;
        color: inherit;
        min-width: 140px;
      }

      .search-input input::placeholder {
        color: #cbd5f5;
      }

      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
      }

      .node-card {
        background: #ffffff;
        border-radius: 22px;
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        position: relative;
        overflow: hidden;
      }

      .node-card::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
        opacity: 0;
        transition: opacity 0.2s ease;
        background: radial-gradient(circle at top, rgba(129, 140, 248, 0.15), transparent 60%);
      }

      .node-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.16);
      }

      .node-card:hover::after {
        opacity: 1;
      }

      .node-card.online {
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      .node-card.warning {
        border: 1px solid rgba(251, 191, 36, 0.25);
      }

      .node-card.offline {
        border: 1px solid rgba(239, 68, 68, 0.25);
      }

      .node-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .node-meta {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .node-meta strong {
        font-size: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .node-meta small {
        color: #94a3b8;
        font-size: 13px;
      }

      .status-tag {
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .status-tag.online {
        background: rgba(16, 185, 129, 0.15);
        color: #047857;
      }

      .status-tag.warning {
        background: rgba(250, 204, 21, 0.16);
        color: #d97706;
      }

      .status-tag.offline {
        background: rgba(248, 113, 113, 0.16);
        color: #b91c1c;
      }

      .metrics {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .metric {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
      }

      .metric strong {
        font-size: 16px;
        display: flex;
        align-items: baseline;
        gap: 6px;
      }

      .progress {
        height: 8px;
        border-radius: 999px;
        background: #f1f5f9;
        overflow: hidden;
      }

      .progress span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(135deg, #38bdf8, #6366f1);
      }

      .progress span.warning {
        background: linear-gradient(135deg, #fb923c, #facc15);
      }

      .progress span.danger {
        background: linear-gradient(135deg, #f87171, #ef4444);
      }

      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #94a3b8;
      }

      .tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .tag {
        padding: 4px 10px;
        border-radius: 999px;
        background: #f1f5f9;
        color: #64748b;
        font-size: 12px;
        font-weight: 600;
      }

      @media (max-width: 600px) {
        body {
          padding: 24px 16px;
        }

        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .metrics {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="dashboard">
      <header class="dashboard-header">
        <div class="dashboard-title">
          <h1>监控面板</h1>
          <span>实时状态</span>
        </div>
        <div class="filters">
          <div class="pill-group">
            <button class="pill is-active">在线</button>
            <button class="pill">离线</button>
          </div>
          <label class="search-input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="search" placeholder="搜索" aria-label="搜索节点" />
          </label>
        </div>
      </header>
      <section class="card-grid">
        ${nodes.map(renderCard).join('')}
      </section>
    </main>
  </body>
</html>`;
}

function renderCard(node) {
  const cpuClass = node.stats.cpu >= 80 ? 'danger' : node.stats.cpu >= 60 ? 'warning' : '';
  const memClass = node.stats.memory >= 80 ? 'danger' : node.stats.memory >= 60 ? 'warning' : '';
  const diskClass = node.stats.disk >= 80 ? 'danger' : node.stats.disk >= 60 ? 'warning' : '';

  return `<article class="node-card ${node.status}" id="${node.id}">
      <header class="node-header">
        <div class="node-meta">
          <strong>${node.flag} ${node.provider}</strong>
          <small>${node.plan}</small>
        </div>
        <span class="status-tag ${node.status}">${renderStatusLabel(node.status)}</span>
      </header>
      <section class="metrics">
        <div class="metric">
          <div class="row"><span>CPU</span><span>${node.stats.cpu}%</span></div>
          <div class="progress"><span class="${cpuClass}" style="width:${node.stats.cpu}%"></span></div>
        </div>
        <div class="metric">
          <div class="row"><span>内存</span><span>${node.stats.memory}%</span></div>
          <div class="progress"><span class="${memClass}" style="width:${node.stats.memory}%"></span></div>
        </div>
        <div class="metric">
          <div class="row"><span>磁盘</span><span>${node.stats.disk}%</span></div>
          <div class="progress"><span class="${diskClass}" style="width:${node.stats.disk}%"></span></div>
        </div>
        <div class="metric">
          <div class="row"><span>连通</span><span>${node.stats.uptime}</span></div>
          <div class="row"><span>带宽</span><span>${node.stats.bandwidth}</span></div>
        </div>
        <div class="metric">
          <div class="row"><span>入站</span><span>${node.stats.networkIn}</span></div>
          <div class="row"><span>出站</span><span>${node.stats.networkOut}</span></div>
        </div>
        <div class="metric">
          <div class="row"><span>公网 IP</span><span>${node.stats.ip}</span></div>
          <div class="row"><span>位置</span><span>${node.datacenter}</span></div>
        </div>
      </section>
      <footer class="row">
        <div>${node.hardware.cpu} · ${node.hardware.memory} · ${node.hardware.storage}</div>
        <div class="tags">
          ${node.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </footer>
    </article>`;
}

function renderStatusLabel(status) {
  switch (status) {
    case 'online':
      return '在线';
    case 'warning':
      return '负载高';
    case 'offline':
      return '离线';
    default:
      return status;
  }
}
