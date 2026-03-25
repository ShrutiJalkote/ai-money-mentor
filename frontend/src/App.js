import "./App.css";
import Dashboard from "./components/Dashboard";
import { auth } from "./firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  return (
    <>
      {/* 🔐 LOGIN SCREEN */}
      {!user && (
        <div className="login-container">
          <div className="login-card">
            <h1>💰 MoneyAI</h1>
            <p>Smart Finance. Smarter You.</p>

            <button className="google-btn" onClick={handleLogin}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                alt="google"
              />
              Continue with Google
            </button>
          </div>
        </div>
      )}

      {/* 📊 DASHBOARD */}
      {user && (
        <>
          <div className="navbar">
            <div className="logo">💰 MoneyAI</div>
            <div>{user.email}</div>
          </div>

          <div className="container">
            <Dashboard />
          </div>
        </>
      )}
    </>
  );
}

export default App;