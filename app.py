from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import base64
from io import BytesIO
import tensorflow as tf
import numpy as np
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

try:
    model = tf.keras.models.load_model('model/ikan_segarkan.h5')
    app.logger.info("Model berhasil dimuat")
except Exception as e:
    app.logger.error(f"Gagal memuat model: {e}")
    model = None

def preprocess_image(img, target_size=(224, 224)):
    img = img.resize(target_size)
    img = np.array(img)
    if img.shape[-1] == 4:
        img = img[..., :3]
    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    return img

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model belum dimuat"}), 500

    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "Tidak ada data gambar"}), 400

        image_data = data['image']

        if "," in image_data:
            _, encoded = image_data.split(",", 1)
        else:
            encoded = image_data

        img_bytes = base64.b64decode(encoded)
        img = Image.open(BytesIO(img_bytes)).convert('RGB')

        processed_img = preprocess_image(img)
        predictions = model.predict(processed_img)

        confidence = float(np.max(predictions))
        class_idx = np.argmax(predictions)
        class_names = ['Kurang Segar', 'Segar']
        prediction = class_names[class_idx]

        return jsonify({
            "prediction": prediction,
            "confidence": confidence
        })

    except Exception as e:
        app.logger.error(f"Error predict: {e}")
        return jsonify({"error": "Terjadi kesalahan saat memproses gambar"}), 500

@app.route('/check-fish', methods=['POST'])
def check_fish():
    try:
        if 'image' not in request.files:
            app.logger.info("Tidak ada file gambar di request")
            return jsonify({"isFish": False})

        file = request.files['image']
        img = Image.open(file.stream).convert('RGB')

        img_gray = img.convert('L')
        mean_brightness = np.mean(np.array(img_gray))
        is_fish = 50 < mean_brightness < 200

        app.logger.info(f"Brightness: {mean_brightness:.2f} => isFish: {is_fish}")

        return jsonify({"isFish": is_fish})

    except Exception as e:
        app.logger.error(f"Error check_fish: {e}")
        return jsonify({"isFish": False})

@app.route('/scan-image', methods=['POST'])
def scan_image():
    """
    Endpoint gabungan: cek ikan + prediksi segar sekaligus dari file upload.
    """
    if model is None:
        return jsonify({"error": "Model belum dimuat"}), 500

    try:
        if 'image' not in request.files:
            return jsonify({"error": "Tidak ada file gambar"}), 400

        file = request.files['image']
        img = Image.open(file.stream).convert('RGB')

        # Cek apakah ada ikan
        img_gray = img.convert('L')
        mean_brightness = np.mean(np.array(img_gray))
        is_fish = 50 < mean_brightness < 200
        app.logger.info(f"[Scan] Brightness: {mean_brightness:.2f} => isFish: {is_fish}")

        if not is_fish:
            return jsonify({
                "isFish": False,
                "prediction": None,
                "confidence": None,
                "message": "Tidak terdeteksi ikan pada gambar."
            })

        # Jika ada ikan, lakukan prediksi kesegaran
        processed_img = preprocess_image(img)
        predictions = model.predict(processed_img)

        confidence = float(np.max(predictions))
        class_idx = np.argmax(predictions)
        class_names = ['Kurang Segar', 'Segar']
        prediction = class_names[class_idx]

        return jsonify({
            "isFish": True,
            "prediction": prediction,
            "confidence": confidence,
            "message": "Prediksi berhasil."
        })

    except Exception as e:
        app.logger.error(f"Error scan_image: {e}")
        return jsonify({"error": "Terjadi kesalahan saat memproses gambar"}), 500

if __name__ == "__main__":
    app.run(debug=True)
