# 📺 YouTube Content Dashboard & Anti-Piracy Monitor

A modern React-based dashboard built to search, track, and analyze YouTube content in real time.  
This project helps monitor newly uploaded videos using custom keywords and filters, making it useful for identifying leaked, pirated, or unauthorized content uploads quickly and efficiently.

---

# 🎯 Project Objective

The main objective of this project is to detect **recently uploaded pirated or leaked content** on YouTube.

By using targeted search keywords and sorting videos by upload date, the system allows users to:

- Monitor suspicious uploads instantly
- Track illegal movie releases or leaked footage
- Identify unauthorized content distribution
- Create reports for monitoring or takedown purposes

---

# 📸 Project Preview

##  Home
<img width="988" height="555" alt="image" src="https://github.com/user-attachments/assets/77f8e6a9-14bc-475c-a7e0-8e243e46610a" />

## Search Section
<img width="940" height="529" alt="image" src="https://github.com/user-attachments/assets/67daa255-7e44-40df-bace-720957275a6c" />

---

# ✨ Features

## 🔍 Real-Time Video Monitoring
- Fetches the latest YouTube uploads instantly
- Optimized for monitoring newly uploaded content
- Uses YouTube Data API v3

## 🛡️ Anti-Piracy Detection
- Search using custom reference keywords
- Detect terms like:
  - Full Movie
  - HDTS
  - CAM Rip
  - Leaked
  - Download
  
  <img width="940" height="529" alt="image" src="https://github.com/user-attachments/assets/7b9c1f80-4d7b-4125-8695-0ea7f35d701c" />


## 💾 Persistent Watchlist
- Save suspicious videos into **My List**
- Data is stored using browser local storage
- Watchlist remains even after refresh

<img width="940" height="529" alt="image" src="https://github.com/user-attachments/assets/e8c37162-84ad-48fb-84ae-096c2ea81c5d" />


## 📊 Analytics Dashboard
- Interactive charts for:
  - Keyword frequency
  - Most active upload channels
- Easy visualization using charts
<img width="997" height="561" alt="image" src="https://github.com/user-attachments/assets/0d283175-c041-42b6-b16c-51c75055d2ca" />


## 📥 Excel Export
- Export flagged videos into `.xlsx` format
- Useful for reports and tracking

## 📲 Quick Sharing
- Share suspicious URLs instantly through:
  - WhatsApp
  - Telegram
  - Email

---

# 🚀 Tech Stack

| Technology | Usage |
|------------|-------|
| React.js | Frontend Framework |
| Tailwind CSS | UI Styling |
| Lucide React | Icons |
| Recharts | Analytics Charts |
| SheetJS (XLSX) | Excel Export |
| YouTube Data API v3 | Video Data Fetching |

---

# 📦 Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
