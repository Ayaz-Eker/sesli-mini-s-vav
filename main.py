import os
from queue import Full, Queue
from threading import Event, Thread

import pyttsx3
from flask import Flask, jsonify, render_template, request


app = Flask(__name__)
speech_queue = Queue(maxsize=20)
speech_ready = Event()
speech_error = None


def speech_worker():
	global speech_error
	try:
		engine = pyttsx3.init()
		speech_ready.set()
		while True:
			text = speech_queue.get()
			try:
				engine.say(text)
				engine.runAndWait()
			finally:
				speech_queue.task_done()
	except Exception as error:
		speech_error = str(error)
		speech_ready.set()
		print(f"Ses motoru başlatılamadı: {error}")


if not os.environ.get("VERCEL"):
	Thread(target=speech_worker, daemon=True).start()


@app.get("/")
def index():
	return render_template("index.html")


@app.post("/api/speak")
def speak():
	if os.environ.get("VERCEL"):
		return jsonify({"error": "Dağıtımda tarayıcı konuşma motoru kullanılır."}), 503
	if not speech_ready.wait(timeout=2) or speech_error:
		return jsonify({"error": "Ses motoru kullanılamıyor."}), 503

	payload = request.get_json(silent=True)
	text = payload.get("text", "").strip() if isinstance(payload, dict) else ""
	if not text or len(text) > 300:
		return jsonify({"error": "Seslendirilecek metin geçersiz."}), 400

	try:
		speech_queue.put_nowait(text)
	except Full:
		return jsonify({"error": "Ses kuyruğu dolu, lütfen tekrar deneyin."}), 503

	return jsonify({"queued": True})


if __name__ == "__main__":
	print("Mini Sınav Asistanı: http://127.0.0.1:5001")
	app.run(host="127.0.0.1", port=5001, debug=False, threaded=True)
