"""
API routes for prediction endpoint.
"""
from flask import Blueprint, request, jsonify
import pickle
import pandas as pd
from datetime import datetime
from collections import deque
from config import Config
from app.utils.feature_extraction import extract_all_features

prediction_bp = Blueprint('prediction', __name__)

# In-memory alert log (last 100 predictions), newest first
alert_log = deque(maxlen=100)

try:
    with open(Config.MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    model_loaded = True
except Exception as e:
    print(f"Error loading model: {e}")
    model_loaded = False


@prediction_bp.route('/predict', methods=['POST'])
def predict():
    try:
        if not model_loaded:
            return jsonify({'error': 'Model not loaded. Check server logs.'}), 503

        packet_data = request.json
        if not packet_data or len(packet_data) == 0:
            return jsonify({'error': 'Empty packet data'}), 400

        required_fields = ['timestamp', 'src_ip', 'dst_ip', 'src_port', 'dst_port']
        for packet in packet_data:
            missing_fields = [field for field in required_fields if field not in packet]
            if missing_fields:
                return jsonify({
                    'error': f'Missing required fields in packet: {", ".join(missing_fields)}'
                }), 400

        features = extract_all_features(packet_data)
        feature_df = pd.DataFrame([features])
        expected_cols = ['Fwd IAT Std', 'Bwd IAT Std', 'Flow IAT Std',
                        'Fwd IAT Max', 'Flow IAT Mean', 'Flow IAT Max',
                        'Fwd IAT Mean', 'Fwd IAT Total', 'Flow Duration',
                        'Bwd IAT Max', 'Idle Max', 'Idle Mean']
        feature_df = feature_df[expected_cols]

        probabilities = model.predict_proba(feature_df)[0].tolist()
        is_attack = probabilities[1] > Config.PREDICTION_THRESHOLD

        result = {
            'prediction': int(is_attack),
            'is_attack': bool(is_attack)
        }

        if hasattr(Config, 'DEBUG_MODE') and Config.DEBUG_MODE:
            result['details'] = {
                'probabilities': probabilities,
                'threshold': Config.PREDICTION_THRESHOLD,
                'features': features
            }

        # Log this event for the dashboard
        alert_log.appendleft({
            'time': datetime.utcnow().isoformat(),
            'src_ip': packet_data[0].get('src_ip'),
            'dst_ip': packet_data[0].get('dst_ip'),
            'src_port': packet_data[0].get('src_port'),
            'dst_port': packet_data[0].get('dst_port'),
            'is_attack': bool(is_attack),
            'confidence': round(probabilities[1], 4)
        })

        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': f'Invalid data format: {str(e)}'}), 400
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@prediction_bp.route('/alerts', methods=['GET'])
def get_alerts():
    return jsonify(list(alert_log))


@prediction_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model_loaded})


def run_internal_traffic_simulator():
    """Runs inside the Flask app itself, generating synthetic flows and
    scoring them directly against the loaded model (no HTTP hop)."""
    import random
    import time as _time
    from datetime import timedelta

    def random_ip():
        return f"{random.randint(10,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"

    def make_flow(attack_like=False):
        base_time = datetime.utcnow()
        src_ip = random_ip()
        dst_ip = random_ip()
        src_port = random.randint(1024, 65535)
        dst_port = random.choice([80, 443, 22, 3389, 21])
        packets = []
        num_packets = random.randint(5, 15)
        t = base_time
        for i in range(num_packets):
            gap_ms = random.uniform(0.1, 3) if attack_like else random.uniform(20, 400)
            t = t + timedelta(milliseconds=gap_ms)
            packets.append({
                "timestamp": t.isoformat(),
                "src_ip": src_ip if i % 2 == 0 else dst_ip,
                "dst_ip": dst_ip if i % 2 == 0 else src_ip,
                "src_port": src_port if i % 2 == 0 else dst_port,
                "dst_port": dst_port if i % 2 == 0 else src_port
            })
        return packets

    while True:
        try:
            if not model_loaded:
                _time.sleep(5)
                continue
            attack_like = random.random() < 0.3
            packet_data = make_flow(attack_like)
            features = extract_all_features(packet_data)
            feature_df = pd.DataFrame([features])
            expected_cols = ['Fwd IAT Std', 'Bwd IAT Std', 'Flow IAT Std',
                            'Fwd IAT Max', 'Flow IAT Mean', 'Flow IAT Max',
                            'Fwd IAT Mean', 'Fwd IAT Total', 'Flow Duration',
                            'Bwd IAT Max', 'Idle Max', 'Idle Mean']
            feature_df = feature_df[expected_cols]
            probabilities = model.predict_proba(feature_df)[0].tolist()
            is_attack = probabilities[1] > Config.PREDICTION_THRESHOLD

            alert_log.appendleft({
                'time': datetime.utcnow().isoformat(),
                'src_ip': packet_data[0].get('src_ip'),
                'dst_ip': packet_data[0].get('dst_ip'),
                'src_port': packet_data[0].get('src_port'),
                'dst_port': packet_data[0].get('dst_port'),
                'is_attack': bool(is_attack),
                'confidence': round(probabilities[1], 4)
            })
            print(f"[SIM] {packet_data[0]['src_ip']} -> {packet_data[0]['dst_ip']} : {'ATTACK' if is_attack else 'normal'}")
        except Exception as e:
            print(f"[SIM ERROR] {e}")
        _time.sleep(random.uniform(1, 3))
