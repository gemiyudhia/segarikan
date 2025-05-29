from PIL import Image
import base64
from io import BytesIO
import numpy as np

def decode_base64_image(image_data):
    try:
        if "," in image_data:
            _, encoded = image_data.split(",", 1)
        else:
            encoded = image_data
        img_bytes = base64.b64decode(encoded)
        return Image.open(BytesIO(img_bytes)).convert('RGB')
    except Exception as e:
        raise ValueError(f"Gagal decode gambar: {e}")

def preprocess_image(img, target_size=(224, 224)):
    img = img.resize(target_size)
    img = np.array(img)
    if img.shape[-1] == 4:
        img = img[..., :3]
    img = img / 255.0
    return np.expand_dims(img, axis=0)
