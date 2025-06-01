from flask import Flask, request, jsonify
from flask_cors import CORS 

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route('/')
def home():
    return "Flask server ready!"

@app.route('/api/check_fish', methods=['POST', 'OPTIONS'])
def check_fish():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        image_data = data.get('image')
        # TODO: proses image_data dengan model/logic deteksi ikan
        # Saat ini hanya dummy response
        result = {
            "status": "success",
            "message": "Fish checked successfully",
            "image_length": len(image_data) if image_data else 0
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/check_freshness', methods=['POST', 'OPTIONS'])
def check_freshness():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        image_data = data.get('image')
        # TODO: proses image_data dengan model/logic kesegaran ikan
        # Saat ini hanya dummy response
        result = {
            "status": "success",
            "message": "Freshness checked successfully",
            "image_length": len(image_data) if image_data else 0
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        image_data = data.get('image')
        # TODO: proses image_data dengan model/logic deteksi ikan
        # Saat ini hanya dummy response
        result = {
            "result": [
                {
                    "freshness": "Segar",
                    "confidence": 0.92,
                    "fish_type": "Ikan Umum",
                    "recommendation": "Disarankan langsung dimasak atau disimpan di suhu dingin."
                }
            ]
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Jalankan server Flask di semua IP (0.0.0.0) port 9000 dengan debug aktif
    app.run(host='0.0.0.0', port=9000, debug=True)