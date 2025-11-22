import csv
from datetime import datetime
from flask import Flask, request
from flask_cors import CORS
import os # Need to import os for file checking

app = Flask(__name__)
CORS(app)

CSV_FILE = "user_data.csv"

def initialize_csv():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow(["Username", "Time"])

@app.route("/save", methods=["POST"])
def save():
    data = request.json
    username = data.get("username", "")
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Call the initialization function before appending
    initialize_csv()

    # Append to CSV
    with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow([username, time])

    return {"status": "OK", "saved": True}

if __name__ == "__main__":
    app.run(port=5000)