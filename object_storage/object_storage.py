from flask import Flask, request, jsonify

app = Flask(__name__)

stored_data = []

@app.route('/store', methods=['POST'])
def store_data():
    try:
        data = request.get_json()
        stored_data.append(data)
        return jsonify({"message": "Data stored successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/retrieve', methods=['GET'])
def retrieve_data():
    return jsonify(stored_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8585)
