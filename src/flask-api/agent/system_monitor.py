"""
System behavior monitoring agent.

This script gathers host telemetry using psutil and posts it to the Flask
system_status endpoint every 10 seconds.
"""

import socket
import time
from datetime import datetime, timezone

import psutil
import requests


API_URL = "http://127.0.0.1:5000/system-status"
SEND_INTERVAL_SECONDS = 10


def utc_now_isoformat():
    """Return a UTC ISO-8601 timestamp compatible with the Flask API."""
    return datetime.now(timezone.utc).isoformat()


def get_cpu_usage():
    """Return CPU usage percentage."""
    return psutil.cpu_percent(interval=None)


def get_ram_usage():
    """Return memory usage percentage."""
    memory = psutil.virtual_memory()
    return memory.percent


def get_disk_usage():
    """Return disk usage percentage."""
    disk = psutil.disk_usage('/')
    return disk.percent


def get_process_count():
    """Return number of running processes."""
    return len(psutil.pids())


def get_network_connections():
    """Return number of active/internet connections."""
    try:
        connections = psutil.net_connections(kind='inet')
        return len(connections)
    except (psutil.AccessDenied, OSError):
        return 0


def get_suspicious_processes():
    """Find top resource-consuming or suspicious named processes."""
    suspicious = []
    # Known suspicious names for demo purposes
    bad_names = ["powershell.exe", "cmd.exe", "sh", "bash", "nc", "ncat", "python"]
    
    try:
        # Get all processes with required info
        procs = []
        for p in psutil.process_iter(['pid', 'name', 'cpu_percent']):
            try:
                # Need to call cpu_percent twice (or with interval) to get non-zero, 
                # but for speed we just take what's there, or randomly flag some
                procs.append(p.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
                
        # Sort by CPU usage to find heavy processes (optional)
        procs = sorted(procs, key=lambda x: x['cpu_percent'] or 0, reverse=True)
        
        # Pick top 3 for the dashboard
        for p in procs[:3]:
            name = p.get('name', 'Unknown')
            pid = p.get('pid', 0)
            # Create a mock risk score based on name or cpu
            is_bad = any(b in name.lower() for b in bad_names)
            score = 90 if is_bad else min(80, int((p.get('cpu_percent') or 0) * 2) + 10)
            
            suspicious.append({
                "name": name,
                "desc": "High resource usage or suspicious name",
                "pid": f"PID {pid}",
                "score": f"{score} / 100",
                "tone": "critical" if score > 80 else ("warning" if score > 50 else "safe"),
                "action": "Kill and Isolate" if score > 80 else "Review",
                "btnVariant": "danger" if score > 80 else "secondary"
            })
    except Exception as e:
        print(f"Error getting processes: {e}")
        
    return suspicious


def collect_system_status():
    """Collect telemetry into the exact JSON shape required by the API."""
    telemetry = {
        "timestamp": utc_now_isoformat(),
        "hostname": socket.gethostname(),
        "cpu_usage": get_cpu_usage(),
        "memory_usage": get_ram_usage(),
        "disk_usage": get_disk_usage(),
        "process_count": get_process_count(),
        "network_connections": get_network_connections(),
        "suspicious_processes": get_suspicious_processes(),
    }
    return telemetry


def send_telemetry(payload):
    """Send a telemetry payload to the Flask system-status endpoint."""
    try:
        response = requests.post(API_URL, json=payload, timeout=5)
        response.raise_for_status()
        return True, response.json()
    except requests.exceptions.RequestException as exc:
        return False, str(exc)


def main():
    """Continuously send telemetry until the user presses Ctrl+C."""
    print("[INFO] System monitor agent started. Press Ctrl+C to stop.")

    try:
        while True:
            telemetry = collect_system_status()

            success, result = send_telemetry(telemetry)

            if success:
                print(
                    "[OK] Host: {hostname} | CPU: {cpu}% | RAM: {ram}% | "
                    "Processes: {processes} | Connections: {connections}".format(
                        hostname=telemetry["hostname"],
                        cpu=int(round(telemetry["cpu_usage"])),
                        ram=int(round(telemetry["memory_usage"])),
                        processes=telemetry["process_count"],
                        connections=telemetry["network_connections"],
                    )
                )
            else:
                print(
                    "[WARN] Could not reach Flask API at {}. "
                    "Retrying in {}s. Error: {}".format(
                        API_URL,
                        SEND_INTERVAL_SECONDS,
                        result,
                    )
                )

            time.sleep(SEND_INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\n[INFO] System monitor agent stopped cleanly.")


if __name__ == "__main__":
    main()


def run_internal_monitor_loop():
    """Runs inside the Flask app itself (no HTTP call), inserting telemetry directly into the DB."""
    import json as _json
    from app.database import get_db_connection

    while True:
        try:
            telemetry = collect_system_status()
            connection = get_db_connection()
            connection.execute(
                """
                INSERT INTO system_status (
                    timestamp, hostname, cpu_usage, memory_usage,
                    disk_usage, process_count, network_connections, suspicious_processes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    telemetry["timestamp"],
                    telemetry["hostname"],
                    telemetry["cpu_usage"],
                    telemetry["memory_usage"],
                    telemetry["disk_usage"],
                    telemetry["process_count"],
                    telemetry["network_connections"],
                    _json.dumps(telemetry["suspicious_processes"]),
                ),
            )
            connection.commit()
            connection.close()
            print(f"[OK] Internal monitor inserted telemetry for {telemetry['hostname']}")
        except Exception as e:
            print(f"[WARN] Internal monitor error: {e}")

        time.sleep(SEND_INTERVAL_SECONDS)
