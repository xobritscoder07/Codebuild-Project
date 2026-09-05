import json
from flask import Blueprint, request, jsonify

from app.database import get_db_connection


system_status_bp = Blueprint(
    "system_status",
    __name__
)


# -----------------------------------------
# POST /system-status
# Agent telemetry receive karega
# -----------------------------------------

@system_status_bp.route(
    "/system-status",
    methods=["POST"]
)
def save_system_status():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No JSON data received"
            }), 400

        required_fields = [
            "timestamp",
            "hostname",
            "cpu_usage",
            "memory_usage",
            "disk_usage",
            "process_count",
            "network_connections",
            "suspicious_processes"
        ]

        missing_fields = [
            field
            for field in required_fields
            if field not in data
        ]

        if missing_fields:
            return jsonify({
                "success": False,
                "message": "Missing required fields",
                "missing_fields": missing_fields
            }), 400


        connection = get_db_connection()

        cursor = connection.execute(
            """
            INSERT INTO system_status (
                timestamp,
                hostname,
                cpu_usage,
                memory_usage,
                disk_usage,
                process_count,
                network_connections,
                suspicious_processes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data["timestamp"],
                data["hostname"],
                data["cpu_usage"],
                data["memory_usage"],
                data["disk_usage"],
                data["process_count"],
                data["network_connections"],
                json.dumps(data["suspicious_processes"])
            )
        )

        connection.commit()

        new_id = cursor.lastrowid

        connection.close()

        return jsonify({
            "success": True,
            "message": "System telemetry saved successfully",
            "id": new_id
        }), 201


    except Exception as error:

        print("POST system status error:", error)

        return jsonify({
            "success": False,
            "message": "Unable to save telemetry",
            "error": str(error)
        }), 500


# -----------------------------------------
# GET /system-status
# History frontend ko dega
# -----------------------------------------

@system_status_bp.route(
    "/system-status",
    methods=["GET"]
)
def get_system_status():

    try:
        limit = request.args.get(
            "limit",
            default=50,
            type=int
        )

        limit = max(
            1,
            min(limit, 500)
        )

        connection = get_db_connection()

        rows = connection.execute(
            """
            SELECT *
            FROM system_status
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,)
        ).fetchall()

        connection.close()

        data = []
        for row in rows:
            d = dict(row)
            try:
                d["suspicious_processes"] = json.loads(d.get("suspicious_processes", "[]"))
            except:
                d["suspicious_processes"] = []
            data.append(d)

        return jsonify({
            "success": True,
            "count": len(data),
            "data": data
        }), 200


    except Exception as error:

        print("GET system status error:", error)

        return jsonify({
            "success": False,
            "message": "Unable to fetch telemetry",
            "error": str(error)
        }), 500


# -----------------------------------------
# GET /system-status/latest
# Latest status frontend ke health cards ke liye
# -----------------------------------------

@system_status_bp.route(
    "/system-status/latest",
    methods=["GET"]
)
def get_latest_system_status():

    try:
        connection = get_db_connection()

        row = connection.execute(
            """
            SELECT *
            FROM system_status
            ORDER BY id DESC
            LIMIT 1
            """
        ).fetchone()

        connection.close()

        if row is None:
            return jsonify({
                "success": False,
                "message": "No system telemetry available"
            }), 404

        row_dict = dict(row)
        try:
            row_dict["suspicious_processes"] = json.loads(row_dict.get("suspicious_processes", "[]"))
        except:
            row_dict["suspicious_processes"] = []

        return jsonify({
            "success": True,
            "data": row_dict
        }), 200


    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to fetch latest telemetry",
            "error": str(error)
        }), 500