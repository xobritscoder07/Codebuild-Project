"""
Trains an Isolation Forest model on baseline (normal) system telemetry.
Saves the trained model + a StandardScaler (needed to normalize live data
the same way before prediction).
"""
import pandas as pd
import pickle
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

DATA_PATH = os.path.expanduser('~/Intrusion-Detection-System/src/system-monitor/baseline_data.csv')
MODEL_OUT = os.path.expanduser('~/Intrusion-Detection-System/src/system-monitor/isolation_forest.pkl')
SCALER_OUT = os.path.expanduser('~/Intrusion-Detection-System/src/system-monitor/scaler.pkl')

FEATURE_COLS = [
    'cpu_percent', 'memory_percent', 'process_count',
    'network_connections', 'established_connections',
    'disk_read_mb', 'disk_write_mb', 'unique_process_names'
]

def main():
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} baseline samples.")
    print(f"CPU range in data: {df['cpu_percent'].min()} - {df['cpu_percent'].max()}")
    print(f"Process count range: {df['process_count'].min()} - {df['process_count'].max()}")

    X = df[FEATURE_COLS].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Lowered contamination since we now have more diverse "normal" data
    # and don't want to over-flag natural variation as anomalous.
    model = IsolationForest(
        n_estimators=100,
        contamination=0.02,
        random_state=42
    )
    model.fit(X_scaled)

    predictions = model.predict(X_scaled)
    n_anomalies = (predictions == -1).sum()
    print(f"On training data itself: {n_anomalies}/{len(df)} flagged as anomalies "
          f"(expected ~{int(0.02 * len(df))} due to contamination setting)")

    with open(MODEL_OUT, 'wb') as f:
        pickle.dump(model, f)
    with open(SCALER_OUT, 'wb') as f:
        pickle.dump(scaler, f)

    print(f"\nSaved model -> {MODEL_OUT}")
    print(f"Saved scaler -> {SCALER_OUT}")

if __name__ == "__main__":
    main()
