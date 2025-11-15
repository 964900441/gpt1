const SAMPLE_DATA = {
  updatedAt: '2025-02-20 21:30:00',
  nodes: [
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
        networkOut: '1.97Gbps',
        ip: '165.68.12.43',
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
      provider: 'MYPRE 3Gbps',
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
        ip: '38.48.76.201',
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
      plan: '月初账单',
      flag: '🇯🇵',
      status: 'offline',
      stats: {
        cpu: 12,
        memory: 89,
        disk: 46,
        uptime: '13天 5小时',
        networkIn: '369KB/s',
        networkOut: '446KB/s',
        ip: '103.91.55.6',
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
  ],
  incidents: [
    {
      id: 'incident-1',
      level: 'warning',
      title: 'MYPRE 3Gbps 出口上行持续高负载',
      timestamp: '21:15',
      description: '检测到出口带宽持续 90% 以上，已发送 Telegram 告警。',
    },
    {
      id: 'incident-2',
      level: 'critical',
      title: 'COLOCROSSING 心跳超时',
      timestamp: '20:58',
      description: '连续 5 次探测失败，已自动发起重拨并同步至工单。',
    },
  ],
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/status') {
      return jsonResponse(SAMPLE_DATA);
    }

    if (url.pathname === '/healthz' || url.pathname === '/readyz') {
      return new Response('ok', {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store',
        },
      });
    }

    const html = renderDocument(SAMPLE_DATA);

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  },
};

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function renderDocument(data) {
  const summary = buildSummary(data.nodes, data.updatedAt);
  const incidents = data.incidents ?? [];

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
        background: #f4f7fb;
        color: #0f172a;
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
          #eef3fb;
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
        background: rgba(37, 99, 235, 0.1);
        color: #1d4ed8;
        font-size: 13px;
        font-weight: 600;
      }

      .dashboard-meta {
        display: flex;
        gap: 16px;
        align-items: center;
        color: #64748b;
        font-size: 13px;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 16px;
      }

      .summary-card {
        background: #ffffff;
        border-radius: 18px;
        padding: 18px;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .summary-label {
        font-size: 13px;
        color: #6b7280;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .summary-value {
        font-size: 26px;
        font-weight: 700;
        display: flex;
        align-items: baseline;
        gap: 6px;
      }

      .summary-delta {
        font-size: 12px;
        color: #22c55e;
        background: rgba(34, 197, 94, 0.12);
        padding: 2px 6px;
        border-radius: 999px;
      }

      .summary-card.warning .summary-value {
        color: #f59e0b;
      }

      .summary-card.danger .summary-value {
        color: #ef4444;
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
        background: radial-gradient(circle at top, rgba(129, 140, 248, 0.18), transparent 65%);
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

      .incident-panel {
        background: #ffffff;
        border-radius: 20px;
        padding: 22px;
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
      }

      .incident-panel header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .incident-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .incident-item {
        display: grid;
        grid-template-columns: 80px 1fr;
        gap: 16px;
        align-items: start;
      }

      .incident-time {
        font-size: 12px;
        color: #94a3b8;
      }

      .incident-body {
        background: rgba(248, 250, 252, 0.9);
        padding: 12px 16px;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .incident-title {
        margin: 0;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .incident-title .badge {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 999px;
        text-transform: uppercase;
      }

      .badge.warning {
        background: rgba(250, 204, 21, 0.2);
        color: #b45309;
      }

      .badge.critical {
        background: rgba(248, 113, 113, 0.25);
        color: #b91c1c;
      }

      .incident-description {
        margin: 0;
        font-size: 13px;
        color: #6b7280;
      }

      .empty-state {
        text-align: center;
        color: #94a3b8;
        font-size: 13px;
      }

      @media (max-width: 768px) {
        body {
          padding: 24px 16px;
        }

        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .incident-item {
          grid-template-columns: 1fr;
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
        <div class="dashboard-meta">
          <span>最后更新 <strong data-updated>${escapeHtml(summary.updatedAt)}</strong></span>
          <span>自动刷新 · 每 60 秒</span>
        </div>
      </header>
      <section class="summary-grid" aria-label="总体概览">
        ${renderSummaryCard('总节点', summary.total, '数量包含所有探针')}
        ${renderSummaryCard('在线', summary.online, '在线状态心跳正常')}
        ${renderSummaryCard('预警', summary.warning, 'CPU/内存超阈值', 'warning')}
        ${renderSummaryCard('离线', summary.offline, '连续心跳失败', 'danger')}
      </section>
      <section class="card-grid" data-nodes>
        ${data.nodes.map(renderCard).join('')}
      </section>
      <section class="incident-panel">
        <header>
          <h2 style="margin:0;font-size:18px;">最近事件</h2>
          <small style="color:#94a3b8;">同步 Telegram / 邮件告警记录</small>
        </header>
        <ol class="incident-list" data-incidents>
          ${renderIncidents(incidents)}
        </ol>
      </section>
    </main>
    <script>
      const initialData = ${serializeForInlineScript(data)};

      function esc(str) {
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function createProgressClass(value) {
        if (value >= 80) return 'danger';
        if (value >= 60) return 'warning';
        return '';
      }

      function renderNode(node) {
        return `
    <article class="node-card ${esc(node.status)}" id="${esc(node.id)}">
      <header class="node-header">
        <div class="node-meta">
          <strong>${esc(node.flag)} ${esc(node.provider)}</strong>
          <small>${esc(node.plan)}</small>
        </div>
        <span class="status-tag ${esc(node.status)}">${esc(renderStatusLabel(node.status))}</span>
      </header>
      <section class="metrics">
        <div class="metric">
          <div class="row"><span>CPU</span><span>${esc(node.stats.cpu)}%</span></div>
          <div class="progress"><span class="${createProgressClass(node.stats.cpu)}" style="width:${esc(node.stats.cpu)}%"></span></div>
        </div>
        <div class="metric">
          <div class="row"><span>内存</span><span>${esc(node.stats.memory)}%</span></div>
          <div class="progress"><span class="${createProgressClass(node.stats.memory)}" style="width:${esc(node.stats.memory)}%"></span></div>
        </div>
        <div class="metric">
          <div class="row"><span>磁盘</span><span>${esc(node.stats.disk)}%</span></div>
          <div class="progress"><span class="${createProgressClass(node.stats.disk)}" style="width:${esc(node.stats.disk)}%"></span></div>
        </div>
        <div class="metric">
          <div class="row"><span>连通</span><span>${esc(node.stats.uptime)}</span></div>
          <div class="row"><span>带宽</span><span>${esc(node.stats.bandwidth)}</span></div>
        </div>
        <div class="metric">
          <div class="row"><span>入站</span><span>${esc(node.stats.networkIn)}</span></div>
          <div class="row"><span>出站</span><span>${esc(node.stats.networkOut)}</span></div>
        </div>
        <div class="metric">
          <div class="row"><span>公网 IP</span><span>${esc(node.stats.ip)}</span></div>
          <div class="row"><span>位置</span><span>${esc(node.datacenter)}</span></div>
        </div>
      </section>
      <footer class="row">
        <div>${esc(node.hardware.cpu)} · ${esc(node.hardware.memory)} · ${esc(node.hardware.storage)}</div>
        <div class="tags">
          ${node.tags.map((tag) => `<span class="tag">${esc(tag)}</span>`).join('')}
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

      function renderIncidentItem(incident) {
        return `
    <li class="incident-item">
      <span class="incident-time">${esc(incident.timestamp)}</span>
      <div class="incident-body">
        <p class="incident-title">
          <span class="badge ${esc(incident.level)}">${incident.level === 'critical' ? 'Critical' : 'Warning'}</span>
          ${esc(incident.title)}
        </p>
        <p class="incident-description">${esc(incident.description)}</p>
      </div>
    </li>`;
      }

      function applySnapshot(snapshot) {
        const nodesContainer = document.querySelector('[data-nodes]');
        const incidentsContainer = document.querySelector('[data-incidents]');
        const updatedAt = document.querySelector('[data-updated]');
        if (!nodesContainer || !incidentsContainer || !updatedAt) return;

        nodesContainer.innerHTML = snapshot.nodes.map(renderNode).join('');
        updatedAt.textContent = snapshot.updatedAt;

        if (!snapshot.incidents || snapshot.incidents.length === 0) {
          incidentsContainer.innerHTML = '<li class="empty-state">最近 24 小时没有新的告警事件</li>';
        } else {
          incidentsContainer.innerHTML = snapshot.incidents.map(renderIncidentItem).join('');
        }

        const summary = {
          total: snapshot.nodes.length,
          online: snapshot.nodes.filter((item) => item.status === 'online').length,
          warning: snapshot.nodes.filter((item) => item.status === 'warning').length,
          offline: snapshot.nodes.filter((item) => item.status === 'offline').length,
        };

        document.querySelector('[data-summary="total"]').textContent = summary.total;
        document.querySelector('[data-summary="online"]').textContent = summary.online;
        document.querySelector('[data-summary="warning"]').textContent = summary.warning;
        document.querySelector('[data-summary="offline"]').textContent = summary.offline;
      }

      async function refresh() {
        try {
          const res = await fetch('/api/status', { cache: 'no-store' });
          if (!res.ok) throw new Error('请求失败');
          const payload = await res.json();
          applySnapshot(payload);
        } catch (error) {
          console.warn('刷新监控数据失败', error);
        }
      }

      document.addEventListener('DOMContentLoaded', () => {
        applySnapshot(initialData);
        setInterval(refresh, 60000);
      });
    </script>
  </body>
</html>`;
}

function renderSummaryCard(title, value, helper, tone) {
  const toneClass = tone ? ` ${tone}` : '';
  const summaryKey =
    title === '总节点'
      ? 'total'
      : title === '在线'
      ? 'online'
      : title === '预警'
      ? 'warning'
      : 'offline';

  return `<article class="summary-card${toneClass}">
    <span class="summary-label">${escapeHtml(title)}</span>
    <span class="summary-value" data-summary="${summaryKey}">${escapeHtml(value)}</span>
    <span class="summary-label">${escapeHtml(helper)}</span>
  </article>`;
}

function renderCard(node) {
  const cpuClass = node.stats.cpu >= 80 ? 'danger' : node.stats.cpu >= 60 ? 'warning' : '';
  const memClass = node.stats.memory >= 80 ? 'danger' : node.stats.memory >= 60 ? 'warning' : '';
  const diskClass = node.stats.disk >= 80 ? 'danger' : node.stats.disk >= 60 ? 'warning' : '';

  return `<article class="node-card ${escapeHtml(node.status)}" id="${escapeHtml(node.id)}">
      <header class="node-header">
        <div class="node-meta">
          <strong>${escapeHtml(node.flag)} ${escapeHtml(node.provider)}</strong>
          <small>${escapeHtml(node.plan)}</small>
        </div>
        <span class="status-tag ${escapeHtml(node.status)}">${escapeHtml(renderStatusLabel(node.status))}</span>
      </header>
      <section class="metrics">
        <div class="metric">
          <div class="row"><span>CPU</span><span>${escapeHtml(node.stats.cpu)}%</span></div>
          <div class="progress"><span class="${cpuClass}" style="width:${escapeHtml(node.stats.cpu)}%"></span></div>
        </div>
        <div class="metric">
          <div class="row"><span>内存</span><span>${escapeHtml(node.stats.memory)}%</span></div>
          <div class="progress"><span class="${memClass}" style="width:${escapeHtml(node.stats.memory)}%"></span></div>
        </div>
        <div class="metric">
          <div class="row"><span>磁盘</span><span>${escapeHtml(node.stats.disk)}%</span></div>
          <div class="progress"><span class="${diskClass}" style="width:${escapeHtml(node.stats.disk)}%"></span></div>
        </div>
        <div class="metric">
          <div class="row"><span>连通</span><span>${escapeHtml(node.stats.uptime)}</span></div>
          <div class="row"><span>带宽</span><span>${escapeHtml(node.stats.bandwidth)}</span></div>
        </div>
        <div class="metric">
          <div class="row"><span>入站</span><span>${escapeHtml(node.stats.networkIn)}</span></div>
          <div class="row"><span>出站</span><span>${escapeHtml(node.stats.networkOut)}</span></div>
        </div>
        <div class="metric">
          <div class="row"><span>公网 IP</span><span>${escapeHtml(node.stats.ip)}</span></div>
          <div class="row"><span>位置</span><span>${escapeHtml(node.datacenter)}</span></div>
        </div>
      </section>
      <footer class="row">
        <div>${escapeHtml(node.hardware.cpu)} · ${escapeHtml(node.hardware.memory)} · ${escapeHtml(node.hardware.storage)}</div>
        <div class="tags">
          ${node.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </footer>
    </article>`;
}

function renderIncidents(incidents) {
  if (!incidents.length) {
    return '<li class="empty-state">最近 24 小时没有新的告警事件</li>';
  }

  return incidents
    .map((incident) => {
      return `<li class="incident-item">
      <span class="incident-time">${escapeHtml(incident.timestamp)}</span>
      <div class="incident-body">
        <p class="incident-title">
          <span class="badge ${escapeHtml(incident.level)}">${escapeHtml(
            incident.level === 'critical' ? 'Critical' : 'Warning',
          )}</span>
          ${escapeHtml(incident.title)}
        </p>
        <p class="incident-description">${escapeHtml(incident.description)}</p>
      </div>
    </li>`;
    })
    .join('');
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

function buildSummary(nodes, updatedAt) {
  const total = nodes.length;
  const online = nodes.filter((item) => item.status === 'online').length;
  const warning = nodes.filter((item) => item.status === 'warning').length;
  const offline = nodes.filter((item) => item.status === 'offline').length;

  return {
    updatedAt,
    total,
    online,
    warning,
    offline,
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function serializeForInlineScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
