from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from model import calculate_plan, calculate_score
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

chat_memory = []

class UserInput(BaseModel):
    income: float
    expenses: float

class ChatInput(BaseModel):
    message: str
    income: float = None
    expenses: float = None

class GoalInput(BaseModel):
    goal: str
    amount: float
    months: int

@app.get("/")
def home():
    return {"message": "API Running 🚀"}

@app.post("/analyze")
def analyze(data: UserInput):
    return calculate_plan(data.income, data.expenses)

@app.post("/score")
def score(data: UserInput):
    s = calculate_score(data.income, data.expenses)
    status = "Excellent 🔥" if s >= 80 else "Good 👍" if s >= 60 else "Improve ⚠️"
    return {"score": s, "status": status}

@app.post("/goal-plan")
def goal_plan(data: GoalInput):
    monthly = data.amount / data.months

    prompt = f"""
Give a financial plan in simple clean text format.

Rules:
- Do NOT use #, *, -, markdown symbols
- Use simple headings with normal text
- Use proper spacing
- Keep it neat and readable

Goal: {data.goal}
Amount: ₹{data.amount}
Time: {data.months} months
"""

    try:
        res = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[{"role": "user", "content": prompt}]
        )

        return {
            "monthly_saving": monthly,
            "plan": res.choices[0].message.content
        }
    except:
        return {
            "monthly_saving": monthly,
            "plan": "Save monthly and invest wisely."
        }

@app.post("/chat")
def chat(data: ChatInput):
    global chat_memory

    system_prompt = """
    You are a financial advisor.
    Reply in clean markdown:
    - headings
    - bullet points
    - bold numbers
    """

    chat_memory.append({"role": "user", "content": data.message})
    chat_memory = chat_memory[-5:]

    messages = [{"role": "system", "content": system_prompt}] + chat_memory

    try:
        res = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=messages
        )

        reply = res.choices[0].message.content
        chat_memory.append({"role": "assistant", "content": reply})

        return {"reply": reply}
    except:
        return {"reply": "Try saving 20% income."}