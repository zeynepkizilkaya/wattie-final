# Wattie

Wattie is a real-time IoT energy analytics platform for monitoring household electricity consumption, detecting anomalies, applying dynamic tariff rules, and generating AI-powered energy-saving recommendations.

## Features

- Real-time household energy monitoring
- Home and appliance management
- Energy quota and budget tracking
- Dynamic penalty tariff
- Appliance anomaly detection
- AI-powered energy recommendations
- Interactive 3D Digital Twin
- Device-level telemetry and consumption monitoring

## Tech Stack

### Frontend
React 19 · Vite · React Router · Zustand · Three.js · React Three Fiber · Drei · Recharts · Framer Motion

### Backend
Spring Boot · Apache Kafka · Apache Ignite · PostgreSQL · Redis · Google Gemini

## Architecture

```text
IoT / Simulated Devices
          ↓
        Kafka
          ↓
    Spring Boot
       /    \
   Ignite  PostgreSQL
          ↓
    React Frontend

The frontend currently supports mock telemetry data for standalone demonstration and testing.

Getting Started
git clone https://github.com/zeynepkizilkaya/wattie-final.git
cd wattie-final
npm install
npm run dev

The application runs at:

http://localhost:5173

Production Build
npm run build
npm run preview
Project

Developed as part of the i2i Systems Academy internship program.

Wattie was selected as one of the two projects awarded 2nd place among 16 projects.
