"""
Tests the trained Isolation Forest against hand-crafted scenarios:
some normal-looking, some clearly anomalous (CPU spike, huge process
count, network connection flood) to verify the model can tell them apart.
"""
import pickle
import os
import numpy as np

MODEL_PATH = os.path.expanduser('~/Intrusion-Detection-System/src/system-monitor/isolation_forest.pkl')
SCALER_PATH = os.path.expanduser('~/Intrusion-Detection-System/src/system-monitor/scaler.pkl')

FEATURE_COLS = [
    'cpu_percent', 'memory_percent', 'process_count',
    'network_connections', 'established_connections',
    'disk_read_mb', 'disk_write_mb', 'unique_process_names'
]

# Hand-crafted test scenarios
scenarios = [
    ("Normal — light usage",      [8, 35, 330, 80, 9, 0.1, 0.1, 270]),
    ("Normal — slightly busier",  [15, 42, 340, 90, 12, 0.5, 0.3, 275]),
    ("ANOMALY — CPU spike (mining?)", [97, 88, 335, 82, 10, 0.1, 0.1, 272]),
    ("ANOMALY — connection flood", [20, 40, 335, 850, 400, 0.2, 0.1, 272]),
    ("ANOMALY — new process surge", [25, 45, 600, 85, 11, 0.1, 0.1, 550]),
    ("ANOMALY — heavy disk write (exfil?)", [30, 40, 335, 82, 10, 5, 900, 272]),
]

def main():
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)

    print(f"{'Scenario':<40} | {'Verdict':<10} | {'Anomaly Score':>13}")
    print("-" * 70)

    for name, values in scenarios:
        X = np.array([values])
        X_scaled = scaler.transform(X)
        prediction = model.predict(X_scaled)[0]     # 1 = normal, -1 = anomaly
        score = model.decision_function(X_scaled)[0]  # lower = more anomalous
        verdict = "ANOMALY" if prediction == -1 else "normal"
        print(f"{name:<40} | {verdict:<10} | {score:>13.4f}")

if __name__ == "__main__":
    main()
