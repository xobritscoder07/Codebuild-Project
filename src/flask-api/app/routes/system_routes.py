"""
System Behavior Monitor routes.
Runs a background thread that samples system telemetry (CPU, memory,
processes, connections) every few seconds, scores it with the trained
Isolation Forest model, and keeps a rolling log for the dashboard.
"""
from flask import Blueprint, jsonify
import psutil
import pickle
import threading
import time
import os
import numpy as np
from datetime import datetime
from collections import deque
from config import Config

system_bp = Blueprint('system_monitor', __name__)

SAMPLE_INTERVAL = 5  # seconds
system_log = deque(maxlen=100)

MODEL_DIR = os.path.dirname(Config.MODEL_PATH)
ISO_MODEL_PATH = os.path.join(MODEL_DIR, 'isolation_forest.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')

FEATURE_COLS = [
    'cpu_percent', 'memory_percent', 'process_count',
    'network_connections', 'established_connections',
    'disk_read_mb', 'disk_write_mb', 'unique_process_names'
]

try:
    with open(ISO_MODEL_PATH, 'rb') as f:
        iso_model = pickle.load(f)
    with open(SCALER_PATH, 'rb') as f:
        iso_scaler = pickle.load(f)
    iso_loaded = True
except Exception as e:
    print(f"Error loading Isolation Forest model: {e}")
    iso_loaded = False


def collect_and_score(prev_disk_io):
    cpu = psutil.cpu_percent(interval=1)
    mem = psutil.virtual_memory().percent
    processes = list(psutil.process_iter(['name']))
    process_count = len(processes)
    unique_names = len(set(p.info['name'] for p in processes if p.info.get('name')))

    try:
        connections = psutil.net_connections()
        conn_count = len(connections)
        established = len([c for c in connections if c.status == 'ESTABLISHED'])
    except (psutil.AccessDenied, PermissionError):
        conn_count = 0
        established = 0

    disk_io = psutil.disk_io_counters()
    if prev_disk_io:
        read_mb = max(0, (disk_io.read_bytes - prev_disk_io.read_bytes) / (1024 * 1024))
        write_mb = max(0, (disk_io.write_bytes - prev_disk_io.write_bytes) / (1024 * 1024))
    else:
        read_mb = 0
        write_mb = 0

    features = [cpu, mem, process_count, conn_count, established, read_mb, write_mb, unique_names]

    verdict = 'unknown'
    score = 0.0
    if iso_loaded:
        X = np.array([features])
        X_scaled = iso_scaler.transform(X)
        prediction = iso_model.predict(X_scaled)[0]
        score = float(iso_model.decision_function(X_scaled)[0])
        verdict = 'compromised' if prediction == -1 else 'normal'

    entry = {
        'time': datetime.utcnow().isoformat(),
        'cpu_percent': cpu,
        'memory_percent': mem,
        'process_count': process_count,
        'network_connections': conn_count,
        'is_anomaly': verdict == 'compromised',
        'anomaly_score': round(score, 4)
    }
    system_log.appendleft(entry)
    return disk_io


def background_monitor():
    prev_disk_io = None
    while True:
        try:
            prev_disk_io = collect_and_score(prev_disk_io)
        except Exception as e:
            print(f"System monitor error: {e}")
        time.sleep(SAMPLE_INTERVAL)


def start_background_monitor():
    thread = threading.Thread(target=background_monitor, daemon=True)
    thread.start()


@system_bp.route('/system-behavior-status', methods=['GET'])
def system_status():
    if not system_log:
        return jsonify({'status': 'no data yet'}), 200
    return jsonify(system_log[0])


@system_bp.route('/system-behavior-alerts', methods=['GET'])
def system_alerts():
    return jsonify(list(system_log))
