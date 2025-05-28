from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

USER_FILE = 'data/user.json'

os.makedirs(os.path.dirname(USER_FILE), exist_ok=True)
if not os.path.exists(USER_FILE):
    with open(USER_FILE, 'w') as f:
        json.dump([], f)

def load_users():
    with open(USER_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USER_FILE, 'w') as f:
        json.dump(users, f, indent=2)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'status': 'error', 'message': 'Data tidak lengkap'}), 400

    users = load_users()
    if any(user['email'] == data['email'] for user in users):
        return jsonify({'status': 'error', 'message': 'Email sudah terdaftar'}), 400

    users.append({
        'name': data['name'],
        'email': data['email'],
        'password': data['password']
    })

    save_users(users)
    return jsonify({'status': 'success', 'message': 'Registrasi berhasil'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'status': 'error', 'message': 'Email dan password wajib diisi'}), 400

    users = load_users()
    user = next((u for u in users if u['email'] == data['email'] and u['password'] == data['password']), None)

    if user:
        return jsonify({'status': 'success', 'message': 'Login berhasil', 'user': user})
    else:
        return jsonify({'status': 'error', 'message': 'Email atau password salah'}), 401

if __name__ == '__main__':
    app.run(debug=True)
