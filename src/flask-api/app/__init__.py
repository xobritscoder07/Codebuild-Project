"""
Flask application factory.
"""
from flask import Flask
from flask_cors import CORS
from app.database import init_db
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize SQLite database before serving requests
    init_db()

    # Existing ML prediction routes (network traffic)
    from app.routes.prediction_routes import prediction_bp
    app.register_blueprint(prediction_bp)

    # Teammate's system telemetry storage routes (SQLite)
    from app.routes.system_status_routes import system_status_bp
    app.register_blueprint(system_status_bp)

    # Our Isolation Forest anomaly detection routes
    from app.routes.system_routes import system_bp, start_background_monitor
    app.register_blueprint(system_bp)
    start_background_monitor()

    return app
