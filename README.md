# AEGIS — AI-Driven Compromise Detection

> An AI/ML-based cybersecurity prototype for network intrusion detection and system behavior monitoring, designed as a foundation for detecting compromise beyond traditional Indicators of Compromise (IoCs).

---

## 📌 Problem Statement

**Develop an AI/ML tool to detect whether a system/firewall/router/network is compromised beyond Indicators of Compromise (IoCs).**

Traditional security mechanisms often depend on known Indicators of Compromise such as malicious IP addresses, hashes, signatures, and predefined rules.

However, an attacker may operate without immediately producing a known IoC. This creates a need for security systems that can also analyze behavioral and statistical patterns in network and system activity.

AEGIS is being developed as a prototype toward this goal by combining:

- Machine-learning-based network traffic classification
- Network flow feature extraction
- Host/system telemetry monitoring
- Real-time prediction APIs
- Alert logging
- System-status storage
- A React-based monitoring dashboard

---

# 🎯 Objective

The objective of AEGIS is to provide a centralized security-monitoring platform that can observe network and host activity and assist in identifying potentially malicious behavior.

The current implementation focuses on two practical capabilities:

1. **Network traffic analysis using machine learning**
2. **Host-level system telemetry monitoring**

These components provide the foundation for the broader behavioral compromise-detection architecture described in the project proposal.

---

# 🧠 Current Detection Approach

The currently implemented network-detection pipeline works as follows:

Network Packet / Flow Data  
↓  
Feature Extraction  
↓  
12 Timing-Based Features  
↓  
Trained ML Model  
↓  
Prediction Probability  
↓  
Attack / Normal Classification  
↓  
Alert Log  
↓  
React Monitoring UI

The Flask API receives a sequence of network packets and extracts timing-based flow features from their timestamps and communication direction.

The trained model then produces class probabilities, which are compared against a configurable prediction threshold to determine whether the flow is classified as an attack.
# 🔍 Network Features

The current prediction pipeline uses the following 12 features:

1. Forward IAT Standard Deviation
2. Backward IAT Standard Deviation
3. Flow IAT Standard Deviation
4. Forward IAT Maximum
5. Flow IAT Mean
6. Flow IAT Maximum
7. Forward IAT Mean
8. Forward IAT Total
9. Flow Duration
10. Backward IAT Maximum
11. Idle Time Maximum
12. Idle Time Mean

### What is IAT?

**Inter-Arrival Time (IAT)** represents the time difference between consecutive packets.

AEGIS calculates these timing statistics from packet timestamps and uses them as inputs to the trained machine-learning model.

The feature-extraction module calculates packet timing differences in microseconds and also identifies idle periods using a configurable idle threshold.

---

# 🤖 Machine Learning Prediction

The Flask prediction service loads the trained model from:

`src/flask-api/models/model.pkl`

The model is loaded when the prediction route is initialized.

For each prediction request, the API:

1. Validates the incoming packet data.
2. Checks the required packet fields.
3. Extracts the required timing-based features.
4. Creates a feature dataframe.
5. Sends the features to the trained model.
6. Obtains prediction probabilities.
7. Compares the attack probability with the configured threshold.
8. Generates an attack/normal result.
9. Stores the event in the in-memory alert buffer.

---

# 📦 Required Packet Format

The `/predict` endpoint expects an array of packet objects.

Each packet must contain:

```json
{
  "timestamp": "2025-03-19T15:43:22.123456",
  "src_ip": "192.168.1.100",
  "dst_ip": "172.16.0.5",
  "src_port": 54321,
  "dst_port": 80
}
```

# 🚨 Prediction & Alert System

The Flask API exposes the following prediction endpoint:

`POST /predict`

It accepts a sequence of packet objects and performs ML-based classification.

The prediction response contains:

- `prediction`
- `is_attack`

Example:

```json
{
  "prediction": 1,
  "is_attack": true
}
```

The prediction is based on the attack-class probability and the configured prediction threshold.

---

# 📋 Recent Alerts

The API provides:

`GET /alerts`

This endpoint returns recent prediction events maintained by the detection service.

The alert information can include:

- Timestamp
- Source IP
- Destination IP
- Source port
- Destination port
- Attack status
- Attack confidence

The API maintains a maximum of 100 recent prediction events in memory.

---

# ❤️ API Health Check

The API provides:

`GET /health`

This endpoint is used to check whether the detection service is running and whether the machine-learning model has been loaded successfully.

Example response:

```json
{
  "status": "ok",
  "model_loaded": true
}
```

# 🖥️ Host/System Monitoring

AEGIS also contains a host monitoring agent located at:

`src/flask-api/agent/system_monitor.py`

The monitoring agent uses `psutil` to collect host telemetry.

The following information is collected:

- CPU utilization
- Memory utilization
- Disk utilization
- Running process count
- Active network connection count
- Hostname
- Timestamp

The monitoring agent periodically sends this telemetry to the Flask API.

---

# 📡 System Monitoring Flow

```text
Monitored Host
      │
      ├── CPU Usage
      ├── Memory Usage
      ├── Disk Usage
      ├── Process Count
      └── Network Connections
              │
              ▼
      System Monitor Agent
              │
              ▼
          Flask API
              │
              ▼
       SQLite Database
# 🗄️ SQLite Data Storage

The Flask application uses SQLite for storing system telemetry.

Database file:

`aegis_system.db`

The database contains a `system_status` table with the following information:

- ID
- Timestamp
- Hostname
- CPU usage
- Memory usage
- Disk usage
- Process count
- Network connections
- Record creation time

```

# 📊 System Status APIs

## Store Telemetry

`POST /system-status`

Receives telemetry from the monitoring agent and stores it in SQLite.

---

## Get Telemetry History

`GET /system-status`

Returns stored system-status records.

The API supports a `limit` query parameter and restricts the returned number of records to a maximum of 500.

Example:

`GET /system-status?limit=50`

---

## Get Latest System Status

`GET /system-status/latest`

Returns the most recent system telemetry record.

This endpoint provides the latest host status for monitoring interfaces.

---

# 🖥️ Monitoring Dashboard

The project contains a React frontend located at:

`src/frontend/my-app/`

The frontend communicates with the Flask API to display monitoring information.

The current dashboard provides:

- API connection status
- Flow statistics
- Attack count
- Normal flow count
- Attack percentage
- Attack-confidence trend
- Recent flow log
- Attack/normal verdict display
---

# 🧪 Traffic Simulator

A synthetic traffic simulator is provided at:

`src/traffic-simulator/simulate.py`

The simulator generates artificial network flows for testing the prediction API.

It generates two types of traffic patterns:

### Normal-looking traffic

Uses relatively larger and more varied packet gaps.

### Attack-looking traffic

Uses very small and bursty packet gaps to simulate suspicious traffic timing patterns.

The simulator alternates between these generated patterns and sends the resulting packet flows to:

`POST /predict`

Approximately 30% of generated flows are configured as attack-like test flows.

> The simulator is intended for testing the detection pipeline and does not represent real malicious traffic.

---

# 🏗️ Project Architecture

The currently implemented architecture can be represented as:

```text
                 AEGIS
                   │
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
 Network Traffic          Host Telemetry
       │                       │
       ▼                       ▼
Feature Extraction       System Monitor
       │                       │
       ▼                       ▼
 ML Prediction            Flask API
       │                       │
       ▼                       ▼
 Attack/Normal             SQLite
 Classification           Storage
       │                       │
       └───────────┬───────────┘
                   │
                   ▼
              Flask APIs
                   │
                   ▼
             React Dashboard
AEGIS-AI-Compromise-Detection/
│
├── Colab-Work/
│   └── Data science and ML development work
│
├── architecture/
│   └── Architecture diagrams and project visuals
│
├── src/
│   │
│   ├── backend/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── constants.js
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── package.json
│   │
│   ├── flask-api/
│   │   │
│   │   ├── agent/
│   │   │   └── system_monitor.py
│   │   │
│   │   ├── app/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   │   ├── prediction_routes.py
│   │   │   │   └── system_status_routes.py
│   │   │   ├── utils/
│   │   │   │   └── feature_extraction.py
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   └── model.pkl
│   │   │
│   │   ├── config.py
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── run.py
│   │
│   ├── frontend/
│   │   └── my-app/
│   │       ├── public/
│   │       ├── src/
│   │       ├── package.json
│   │       └── README.md
│   │
│   └── traffic-simulator/
│       └── simulate.py
│
└── README.md
```

# 🛠️ Technology Stack

## Backend / API

- Python
- Flask
- REST API

## Machine Learning

- Python
- NumPy
- Pandas
- Pickle-based model loading
- Trained machine-learning model

## System Monitoring

- Python
- psutil
- Requests

## Database

- SQLite

## Frontend

- React
- JavaScript
- HTML
- CSS
- Create React App

## Testing

- Python-based synthetic traffic simulator

## Containerization

- Docker
- Docker Compose

---

# ⚙️ Configuration

The Flask API configuration is controlled through `config.py` and environment variables.

Important parameters include:

### MODEL_PATH

Location of the trained model file.

`models/model.pkl`

### IDLE_THRESHOLD

Time gap in microseconds used to identify an idle period in packet timing.

### PREDICTION_THRESHOLD

Probability threshold used to classify traffic as an attack.

Default prediction threshold:

`0.5`

---

# 🚀 Running the Project

## Prerequisites

Install:

- Python 3.8+
- Node.js
- npm

Docker can also be used for the Flask API.

---

## 1. Start the Flask API

Navigate to:

`src/flask-api`

Install Python dependencies:

```bash
pip install -r requirements.txt

```

## 2. Start the System Monitoring Agent

Open another terminal and navigate to `src/flask-api`.

Run `python agent/system_monitor.py`.

The agent continuously collects host telemetry and sends it to the Flask API.

---

## 3. Start the Traffic Simulator

Open another terminal and navigate to `src/traffic-simulator`.

Run `python simulate.py`.

The simulator sends generated flows to `http://localhost:5000/predict`.

---

## 4. Start the React Dashboard

Open another terminal and navigate to `src/frontend/my-app`.

Install the frontend dependencies using `npm install`.

Start the React application using `npm start`.

The application runs at `http://localhost:3000`.

---

# 🐳 Running Flask API with Docker

The Flask API also contains Docker configuration.

Navigate to `src/flask-api`.

Build and start the service using `docker-compose up -d`.

The API is exposed on `http://localhost:5000`.

To stop the service, use `docker-compose down`.

---

# 🔄 End-to-End Testing

For a basic local demonstration, run the components in this order:

1. Flask API
2. System Monitor Agent
3. Traffic Simulator
4. React Dashboard

The traffic simulator generates flows and sends them to the Flask prediction API.

The Flask API performs feature extraction and ML classification.

Prediction events are added to the alert buffer.

The React dashboard periodically requests the alert data and displays:

- Total observed flows
- Attack count
- Normal count
- Attack percentage
- Confidence trend
- Flow-level verdicts

At the same time, the system monitoring agent sends host telemetry to the Flask API, where it is stored in SQLite.

---

# 📈 Current Implementation Status

AEGIS is currently a working prototype with the following components implemented.

### Network Detection

- [x] Flask prediction API
- [x] Packet input validation
- [x] Network packet timing feature extraction
- [x] 12 model input features
- [x] Trained model loading
- [x] Prediction probability calculation
- [x] Configurable attack threshold
- [x] Attack/normal classification
- [x] Recent prediction alert buffer
- [x] API health endpoint

### Host Monitoring

- [x] CPU monitoring
- [x] Memory monitoring
- [x] Disk monitoring
- [x] Process count monitoring
- [x] Network connection count monitoring
- [x] Hostname collection
- [x] Timestamped telemetry
- [x] Periodic telemetry transmission

### Storage

- [x] SQLite database
- [x] System telemetry storage
- [x] Telemetry history API
- [x] Latest telemetry API

### Frontend

- [x] React application
- [x] API connection status
- [x] Flow statistics
- [x] Attack count
- [x] Normal flow count
- [x] Attack percentage
- [x] Attack-confidence trend
- [x] Recent flow log
- [x] Attack/normal verdict display

### Testing

- [x] Synthetic traffic generator
- [x] Normal-looking traffic generation
- [x] Attack-like traffic generation
- [x] Automated requests to prediction API
---

# 🔮 Future Development

The current implementation provides the foundation for the broader AEGIS objective of detecting compromise beyond traditional IoCs.

Planned extensions include:

- Behavioral baselining of normal host and network activity
- Unsupervised anomaly detection
- Correlation of multiple weak security signals
- Network and host behavioral correlation
- Attack-chain reconstruction
- Risk-based compromise scoring
- Explainable security findings
- Predictive threat simulation
- Automated response recommendations
- Broader telemetry sources including firewall and router data
- Production-scale continuous monitoring

These capabilities are part of the planned evolution of the project and are not represented as fully implemented features in the current prototype.

---

# 🎯 Alignment With the Problem Statement

The problem statement focuses on determining whether a system, firewall, router, or network is compromised beyond traditional Indicators of Compromise.

The current AEGIS prototype establishes the foundation for this objective through:

**Network Traffic Analysis + Machine Learning Classification + Host/System Telemetry + Alert Generation + Centralized Monitoring**

The next development stage is to combine these independent signals into a behavioral compromise-detection system capable of identifying suspicious deviations even when a conventional IoC is not available.

---

# ⚠️ Prototype Scope

AEGIS is currently a research and prototype implementation.

The present ML pipeline performs network-flow classification based on timing features. It should not be interpreted as a complete production-grade zero-day detection system.

Similarly, host telemetry is currently collected and stored, but the current code does not yet use host telemetry as an input to the ML prediction model.

The project architecture is designed so that these components can be progressively integrated into a unified behavioral detection and risk-analysis pipeline.

---

# 👥 Team

## CodeBytes

Bhagwan Parshuram Institute of Technology

---

# 📜 License

Apache License 2.0
