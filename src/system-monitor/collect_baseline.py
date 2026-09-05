"""
Collects system telemetry (CPU, memory, processes, connections) every few
seconds and appends it to a CSV file. Run this during NORMAL system usage
to build a baseline dataset for the Isolation Forest model.
"""
import psutil
import csv
import time
import os
from datetime import datetime

OUTPUT_FILE = os.path.expanduser('~/Intrusion-Detection-System/src/system-monitor/baseline_data.csv')
COLLECTION_INTERVAL = 3  # seconds

FIELDNAMES = [
    'timestamp', 'cpu_percent', 'memory_percent', 'process_count',
    'network_connections', 'established_connections',
    'disk_read_mb', 'disk_write_mb', 'unique_process_names'
]

def collect_sample(prev_disk_io):
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
        conn_count = -1
        established = -1

    disk_io = psutil.disk_io_counters()
    if prev_disk_io:
        read_mb = (disk_io.read_bytes - prev_disk_io.read_bytes) / (1024 * 1024)
        write_mb = (disk_io.write_bytes - prev_disk_io.write_bytes) / (1024 * 1024)
    else:
        read_mb = 0
        write_mb = 0

    sample = {
        'timestamp': datetime.now().isoformat(),
        'cpu_percent': cpu,
        'memory_percent': mem,
        'process_count': process_count,
        'network_connections': conn_count,
        'established_connections': established,
        'disk_read_mb': round(read_mb, 3),
        'disk_write_mb': round(write_mb, 3),
        'unique_process_names': unique_names
    }
    return sample, disk_io

def main():
    file_exists = os.path.exists(OUTPUT_FILE)
    prev_disk_io = None

    print(f"Collecting system telemetry every {COLLECTION_INTERVAL}s -> {OUTPUT_FILE}")
    print("Let this run for 5-10 minutes during NORMAL usage. Ctrl+C to stop.\n")

    with open(OUTPUT_FILE, 'a', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        if not file_exists:
            writer.writeheader()

        count = 0
        while True:
            sample, prev_disk_io = collect_sample(prev_disk_io)
            writer.writerow(sample)
            f.flush()
            count += 1
            print(f"[{count}] CPU: {sample['cpu_percent']:>5.1f}% | "
                  f"Mem: {sample['memory_percent']:>5.1f}% | "
                  f"Processes: {sample['process_count']:>4} | "
                  f"Connections: {sample['network_connections']:>4}")
            time.sleep(COLLECTION_INTERVAL)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nStopped. Data saved.")
