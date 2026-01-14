<p align="center">
  <h1 align="center">🖥️ Device Monitor</h1>
  <p align="center">
    Real-time system monitoring dashboard with AI-powered insights
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
</p>

---

## 📖 About

**Device Monitor** is a comprehensive system monitoring solution that tracks real-time metrics of any machine it's deployed on. It features a modern dashboard UI, WebSocket-based live updates, anomaly detection, and an AI-powered chatbot for system analysis.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS, Recharts |
| **Backend** | Node.js 18+, Express.js, TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Real-time** | WebSocket (ws library) |
| **AI/ML** | OpenRouter API (Mistral Devstral model) |
| **System Monitoring** | systeminformation (Node.js native OS metrics) |
| **Process Manager** | PM2 |
| **Containerization** | Docker (optional, for cloud deployment) |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Real-time Metrics** | CPU, Memory, Disk, Network, Swap, Load Average |
| 📈 **Trend Charts** | Historical data visualization |
| 🔔 **Anomaly Detection** | Automatic alerts when thresholds are exceeded |
| 🤖 **AI Insights** | AI-powered root cause analysis and recommendations for anomalies |
| 💬 **AI Chatbot** | Ask questions about your system's health |
| ⚡ **Live Updates** | WebSocket streaming every second |
| 📱 **Responsive UI** | Works on desktop, tablet, and mobile |
| 🔧 **Custom Rules** | Define your own alerting thresholds |
| 📤 **Export Data** | Download metrics as CSV |

---

## 📋 What It Monitors

- **CPU Usage** - Overall processor utilization
- **Memory** - RAM usage and available memory
- **Disk** - Storage space utilization
- **Swap** - Virtual memory usage
- **Network** - Inbound/outbound traffic (Mbps)
- **Load Average** - System load over time
- **Uptime** - How long the system has been running
- **Latency** - P50, P95, P99 response times
- **Error Rate** - System error percentage
- **Processes** - Running processes and top CPU consumers

---

## 🚀 How to Deploy

### Prerequisites

1. **Node.js** v18 or later - [Download here](https://nodejs.org/)
2. **Supabase** account - [Sign up free](https://supabase.com/)
3. **OpenRouter API key** (optional) - For AI chatbot features

### Quick Deployment

**On Windows:**
1. Open PowerShell in the project folder
2. Run: `.\deploy.ps1`
3. Follow the prompts to enter your API keys

**On Linux/Mac:**
1. Open Terminal in the project folder
2. Run: `chmod +x deploy.sh && ./deploy.sh`
3. Follow the prompts to enter your API keys

The script automatically installs dependencies, builds the project, and starts the services.

**First-time deployment:** You'll be prompted to enter your Supabase URL, Supabase Anon Key, and optionally an OpenRouter API key. These are saved to `.env` files for future deployments.

---

## 🌐 Accessing the Dashboard

After deployment:

| Service | URL |
|---------|-----|
| **Dashboard** | http://localhost:3000 |
| **Backend API** | http://localhost:3001 |

To access from other devices on your network, replace `localhost` with your machine's IP address.

---

## � Dashboard Pages

| Page | Description |
|------|-------------|
| **Home** | Main dashboard with all metrics and charts |
| **Processes** | View running processes and resource usage |
| **Anomalies** | Timeline of detected issues and alerts |
| **Rules** | Configure custom alerting thresholds |
| **Chat** | AI assistant for system analysis |
| **Export** | Download metrics data as CSV |

---

## �️ Managing Services

The app runs using PM2 process manager:

| Action | Command |
|--------|---------|
| View status | `pm2 status` |
| View logs | `pm2 logs` |
| Restart | `pm2 restart all` |
| Stop | `pm2 stop all` |
| Auto-start on boot | `pm2 startup` then `pm2 save` |

---

## ⚠️ Important Note

This app monitors **real system metrics** of the machine it runs on. Docker deployment is not recommended as containers only show isolated container metrics, not actual host system data.

**Always deploy natively** using the provided deployment scripts for accurate monitoring.

---

## 📄 License

MIT License - Free for personal and commercial use.

---


