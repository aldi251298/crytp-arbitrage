# 🏦 Nexus Terminal - Institutional Arbitrage Dashboard

![Project Status](https://img.shields.io/badge/Status-Production-emerald)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech Stack](https://img.shields.io/badge/Stack-PERN%20Serverless-purple)

**Nexus Terminal** is a professional-grade crypto arbitrage scanner designed to identify and capitalize on price discrepancies between Tier-1 Global Exchanges (e.g., Binance, Coinbase) and Local Markets.

Built with a focus on **Real-time Data Processing**, **Automated Execution Logic**, and **Institutional UI/UX**.

 <img width="1096" height="601" alt="crypto" src="https://github.com/user-attachments/assets/55183aff-ea4a-46ce-b3e8-8ef1a46ef6e0" />


## 🚀 Key Features

### 📡 Real-time Market Scanner
-   Aggregates live price data via **Serverless Polling API**.
-   Calculates **Net Yield** automatically after deducting estimated trading fees (0.2%).
-   Visualizes price trends using sparklines for quick trend analysis.

### 🤖 Auto-Sniper Bot (Algorithmic Trading)
-   **Configurable Threshold:** Users can set specific profit margins (e.g., >2.5%).
-   **Automated Execution:** The bot monitors the feed 24/7 and executes trades instantly when conditions are met.
-   **Concurrency Control:** Uses React Refs to manage bot state without triggering unnecessary re-renders.

### 💾 Persistent Ledger (PostgreSQL)
-   Full transaction history stored in **Supabase (PostgreSQL)**.
-   **ACID Compliant:** Uses Prisma Transactions to ensure wallet balance and trade history are always in sync.
-   **Optimistic UI:** Provides instant feedback to the user while processing data in the background.

### 🎨 Cyberpunk Glassmorphism UI
-   Modern, dark-mode centric design using **Tailwind CSS v4**.
-   Interactive components with backdrop-blur effects.
-   Responsive design for desktop and mobile monitoring.

## 🛠️ Architecture & Tech Stack



[Image of System Architecture Diagram]


**Frontend:**
-   **Framework:** React.js (Vite)
-   **Language:** TypeScript (Strict Mode)
-   **Styling:** Tailwind CSS v4 (Zero Config)
-   **Icons:** Lucide React
-   **State Management:** React Hooks (useState, useEffect, useRef, useCallback)

**Backend (Serverless):**
-   **Runtime:** Node.js (Vercel Serverless Functions)
-   **Database:** PostgreSQL (via Supabase)
-   **ORM:** Prisma (Type-safe database client)
-   **API:** RESTful Architecture

Disclaimer
This project is a Portfolio Demonstration. While the architecture simulates a real-world high-frequency trading environment (Database transactions, API Polling, Bot Logic), the "Arbitrage Opportunities" and "Exchange Routes" are simulated based on real market prices to demonstrate the algorithm's capability without risking real capital.

👨‍💻 Author
Aldi Syahdan Maulana Fullstack Developer | React & Node.js Enthusiast

