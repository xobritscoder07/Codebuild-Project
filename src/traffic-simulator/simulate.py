"""
Simulates network traffic flows and sends them to the Flask NIDS API.
Alternates between "normal-looking" and "attack-looking" flow patterns.
"""
import requests
import random
import time
from datetime import datetime, timedelta

API_URL = "http://localhost:5000/predict"

def random_ip():
    return f"{random.randint(10,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"

def make_flow(attack_like=False):
    """Generate a synthetic sequence of packet timestamps for one flow."""
    base_time = datetime.utcnow()
    src_ip = random_ip()
    dst_ip = random_ip()
    src_port = random.randint(1024, 65535)
    dst_port = random.choice([80, 443, 22, 3389, 21])

    packets = []
    num_packets = random.randint(5, 15)
    t = base_time
    for i in range(num_packets):
        if attack_like:
            # very tight, bursty inter-arrival times (e.g. port scan / flood pattern)
            gap_ms = random.uniform(0.1, 3)
        else:
            # more natural human/browser-like spacing
            gap_ms = random.uniform(20, 400)
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
    print(f"Sending simulated traffic to {API_URL} ... (Ctrl+C to stop)")
    while True:
        attack_like = random.random() < 0.3  # ~30% look like attacks
        flow = make_flow(attack_like)
        try:
            resp = requests.post(API_URL, json=flow, timeout=5)
            data = resp.json()
            label = "ATTACK" if data.get("is_attack") else "normal"
            print(f"[{datetime.utcnow().strftime('%H:%M:%S')}] {flow[0]['src_ip']} -> {flow[0]['dst_ip']} : {label}")
        except Exception as e:
            print(f"Error sending flow: {e}")
        time.sleep(random.uniform(1, 3))

if __name__ == "__main__":
    main()
