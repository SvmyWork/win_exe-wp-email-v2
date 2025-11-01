import tkinter as tk
from tkinter import ttk
from tkinter import messagebox

# -----------------------------
# Modern Tkinter Login Page
# -----------------------------
class ModernLoginApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Modern Login Page")
        self.geometry("400x480")
        self.resizable(False, False)
        self.configure(bg="#EAF0F7")

        self.create_ui()

    def create_ui(self):
        # Gradient-like background (simulated)
        gradient_frame = tk.Canvas(self, width=400, height=480, highlightthickness=0)
        gradient_frame.place(x=0, y=0)
        gradient_frame.create_rectangle(0, 0, 400, 480, fill="#EAF0F7", outline="")
        gradient_frame.create_rectangle(0, 0, 400, 200, fill="#5674E0", outline="")

        # App Title
        title = tk.Label(self, text="Welcome Back 👋", font=("Segoe UI", 18, "bold"), bg="#5674E0", fg="white")
        title.pack(pady=(60, 10))

        subtitle = tk.Label(self, text="Login to continue", font=("Segoe UI", 11), bg="#5674E0", fg="#DCE3FF")
        subtitle.pack()

        # Main frame
        frame = tk.Frame(self, bg="white", bd=0, highlightthickness=0)
        frame.place(relx=0.5, rely=0.55, anchor="center", width=320, height=250)

        # Username field
        self.add_input_field(frame, "Username", 30)

        # Password field
        self.add_input_field(frame, "Password", 100, show="*")

        # Login button
        login_btn = tk.Button(
            frame, text="Login", font=("Segoe UI", 11, "bold"), bg="#5674E0",
            fg="white", activebackground="#4059B8", activeforeground="white",
            relief="flat", cursor="hand2", command=self.login
        )
        login_btn.place(x=20, y=170, width=280, height=40)
        login_btn.bind("<Enter>", lambda e: login_btn.config(bg="#4059B8"))
        login_btn.bind("<Leave>", lambda e: login_btn.config(bg="#5674E0"))

        # Register text
        register_label = tk.Label(
            frame, text="Don’t have an account? Sign up", font=("Segoe UI", 9),
            bg="white", fg="#5674E0", cursor="hand2"
        )
        register_label.place(x=60, y=220)
        register_label.bind("<Button-1>", lambda e: messagebox.showinfo("Sign up", "Redirecting to Sign-up page..."))

    def add_input_field(self, parent, placeholder, y, show=""):
        """Create a modern input field with a borderless Entry and placeholder."""
        field_frame = tk.Frame(parent, bg="#F5F7FB", bd=1, relief="flat")
        field_frame.place(x=20, y=y, width=280, height=40)

        entry = tk.Entry(field_frame, font=("Segoe UI", 11), bg="#F5F7FB",
                         fg="#333", bd=0, relief="flat", show=show)
        entry.insert(0, placeholder)
        entry.config(fg="#888")
        entry.bind("<FocusIn>", lambda e, ent=entry, ph=placeholder: self._clear_placeholder(ent, ph))
        entry.bind("<FocusOut>", lambda e, ent=entry, ph=placeholder: self._add_placeholder(ent, ph))
        entry.place(x=10, y=8, width=260, height=24)

        if placeholder.lower() == "username":
            self.username_entry = entry
        elif placeholder.lower() == "password":
            self.password_entry = entry

    def _clear_placeholder(self, entry, placeholder):
        if entry.get() == placeholder:
            entry.delete(0, "end")
            entry.config(fg="#000")

    def _add_placeholder(self, entry, placeholder):
        if entry.get() == "":
            entry.insert(0, placeholder)
            entry.config(fg="#888")

    def login(self):
        username = self.username_entry.get()
        password = self.password_entry.get()

        if username in ["", "Username"] or password in ["", "Password"]:
            messagebox.showwarning("Error", "Please fill in all fields.")
        elif username == "admin" and password == "1234":
            messagebox.showinfo("Login Successful", f"Welcome, {username}!")
        else:
            messagebox.showerror("Login Failed", "Invalid credentials. Try again.")


if __name__ == "__main__":
    app = ModernLoginApp()
    app.mainloop()
