import webview
import threading
import time

class API:
    def __init__(self, window):
        self.window = window
        self.counting = False  # Prevent multiple runs

    def start_count(self):
        if self.counting:
            return "Already counting..."
        self.counting = True

        threading.Thread(target=self._count_loop, daemon=True).start()
        return "Counting started!"

    def _count_loop(self):
        for i in range(1, 11):
            msg = f"Count: {i}"
            print(msg)
            self.window.evaluate_js(f"updateCount('{msg}')")
            time.sleep(1)
        self.counting = False
        self.window.evaluate_js("updateCount('✅ Done!')")

def start_app():
    window = webview.create_window(
        "Python ↔ JS Counter",
        "index.html"
    )

    api = API(window)
    window.expose(api.start_count)  # Expose function manually (for older pywebview)

    def on_loaded():
        print("Window loaded and ready.")

    webview.start(on_loaded, debug=True, http_server=True, gui='edgechromium')

if __name__ == "__main__":
    start_app()
