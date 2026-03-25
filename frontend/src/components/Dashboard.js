import { useState } from "react";
import axios from "axios";
import Chatbot from "./Chatbot";
import ReactMarkdown from "react-markdown";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import BASE_URL from "../config";

function Dashboard() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(null);

  const [goal, setGoal] = useState("");
  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState("");
  const [goalResult, setGoalResult] = useState(null);

  const analyze = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/analyze`, {
        income: Number(income),
        expenses: Number(expenses),
      });
      setResult(res.data);
    } catch {
      alert("Error analyzing");
    }
  };

  const getScore = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/score`, {
        income: Number(income),
        expenses: Number(expenses),
      });
      setScore(res.data);
    } catch {
      alert("Error fetching score");
    }
  };

  const generatePlan = async () => {
    if (!goal || !amount || !months) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/goal-plan`, {
        goal,
        amount: Number(amount),
        months: Number(months),
      });
      setGoalResult(res.data);
    } catch {
      alert("Error generating plan");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <>
      <div className="top-bar">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="dashboard-grid">
        {/* 💰 Financial */}
        <div className="card glass">
          <h3>💰 Financial Analysis</h3>

          <input placeholder="Income" onChange={(e) => setIncome(e.target.value)} />
          <input placeholder="Expenses" onChange={(e) => setExpenses(e.target.value)} />

          <div className="btn-group">
            <button className="btn primary" onClick={analyze}>Analyze</button>
            <button className="btn secondary" onClick={getScore}>Check Score</button>
          </div>

          {result && (
            <div className="result">
              <p>💸 Savings: ₹{result.savings}</p>
              <p>📈 SIP: ₹{result.recommended_sip}</p>
            </div>
          )}

          {score && (
            <div className="result">
              <h2>🔥 Score: {score.score}</h2>
              <p>{score.status}</p>
            </div>
          )}
        </div>

        {/* 🎯 Goal */}
        <div className="card glass">
          <h3>🎯 Goal Planner</h3>

          <input placeholder="Goal" onChange={(e) => setGoal(e.target.value)} />
          <input placeholder="Amount" onChange={(e) => setAmount(e.target.value)} />
          <input placeholder="Months" onChange={(e) => setMonths(e.target.value)} />

          <button className="btn primary" onClick={generatePlan}>
            Generate Plan
          </button>

          {goalResult && (
            <div className="result">
              <h4>📅 Monthly</h4>
              <p>₹{goalResult.monthly_saving}</p>

              <div className="markdown">
                <ReactMarkdown>{goalResult.plan}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🤖 Chat */}
      <Chatbot income={income} expenses={expenses} />
    </>
  );
}

export default Dashboard;