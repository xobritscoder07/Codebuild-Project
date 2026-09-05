"""
Evaluates the LightGBM model at different probability thresholds.
Generates synthetic labeled flows (we know ground truth since WE design
the attack-like vs normal patterns), then reports confusion matrix +
precision/recall/F1 at each threshold so we can pick the best one.
"""
import pickle
import random
import sys
import os
from datetime import datetime, timedelta
import pandas as pd

# Import feature extraction from the actual project
sys.path.insert(0, os.path.expanduser('~/Intrusion-Detection-System/src/flask-api'))
from app.utils.feature_extraction import extract_all_features

MODEL_PATH = os.path.expanduser('~/Intrusion-Detection-System/src/flask-api/app/models/model.pkl')

EXPECTED_COLS = ['Fwd IAT Std', 'Bwd IAT Std', 'Flow IAT Std',
                  'Fwd IAT Max', 'Flow IAT Mean', 'Flow IAT Max',
                  'Fwd IAT Mean', 'Fwd IAT Total', 'Flow Duration',
                  'Bwd IAT Max', 'Idle Max', 'Idle Mean']

def random_ip():
    return f"{random.randint(10,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"

def make_flow(attack_like):
    base_time = datetime.now()
    src_ip = random_ip()
    dst_ip = random_ip()
    src_port = random.randint(1024, 65535)
    dst_port = random.choice([80, 443, 22, 3389, 21])
    packets = []
    num_packets = random.randint(5, 15)
    t = base_time
    for i in range(num_packets):
        if attack_like:
            gap_ms = random.uniform(0.1, 3)   # tight, bursty = attack-like
        else:
            gap_ms = random.uniform(20, 400)  # natural spacing = normal-like
        t = t + timedelta(milliseconds=gap_ms)
        packets.append({
            "timestamp": t.isoformat(),
            "src_ip": src_ip if i % 2 == 0 else dst_ip,
            "dst_ip": dst_ip if i % 2 == 0 else src_ip,
            "src_port": src_port if i % 2 == 0 else dst_port,
            "dst_port": dst_port if i % 2 == 0 else src_port
        })
    return packets

def main():
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)

    N = 500
    true_labels = []
    predicted_probs = []

    print(f"Generating {N} synthetic labeled flows...")
    for i in range(N):
        is_attack_ground_truth = random.random() < 0.5  # 50/50 split
        flow = make_flow(is_attack_ground_truth)
        features = extract_all_features(flow)
        feature_df = pd.DataFrame([features])[EXPECTED_COLS]
        prob = model.predict_proba(feature_df)[0][1]  # probability of "attack" class
        true_labels.append(int(is_attack_ground_truth))
        predicted_probs.append(prob)

    print(f"Done. Generated {N} flows ({sum(true_labels)} attack-like, {N - sum(true_labels)} normal-like)\n")

    thresholds = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
    print(f"{'Threshold':>10} | {'TP':>4} {'TN':>4} {'FP':>4} {'FN':>4} | {'Precision':>9} {'Recall':>7} {'F1':>6} {'Accuracy':>8}")
    print("-" * 80)

    results = []
    for thresh in thresholds:
        tp = tn = fp = fn = 0
        for true_label, prob in zip(true_labels, predicted_probs):
            pred = 1 if prob > thresh else 0
            if pred == 1 and true_label == 1: tp += 1
            elif pred == 0 and true_label == 0: tn += 1
            elif pred == 1 and true_label == 0: fp += 1
            elif pred == 0 and true_label == 1: fn += 1

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        accuracy = (tp + tn) / N

        results.append((thresh, tp, tn, fp, fn, precision, recall, f1, accuracy))
        print(f"{thresh:>10.2f} | {tp:>4} {tn:>4} {fp:>4} {fn:>4} | {precision:>9.3f} {recall:>7.3f} {f1:>6.3f} {accuracy:>8.3f}")

    best = max(results, key=lambda r: r[7])  # best F1
    print(f"\n>>> Best threshold by F1-score: {best[0]} (F1={best[7]:.3f}, Accuracy={best[8]:.3f})")

if __name__ == "__main__":
    main()
