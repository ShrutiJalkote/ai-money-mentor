from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from model import calculate_plan, calculate_score
from openai import OpenAI
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI Client
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

# Memory
chat_memory = []

# Models
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


# Routes
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


# 🎯 Goal Plan (NO markdown, clean format)
@app.post("/goal-plan")
def goal_plan(data: GoalInput):
    monthly = data.amount / data.months

    prompt = f"""
Create a financial plan in very clean simple text.

Rules:
- Do NOT use symbols like #, *, -, bullet points
- Use plain sentences
- Keep spacing between sections
- Make it easy to read

Include:
Monthly saving amount
Simple step by step plan
Investment suggestions (India)
Tips

Goal: {data.goal}
Amount: ₹{data.amount}
Duration: {data.months} months
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

    except Exception as e:
        return {
            "monthly_saving": monthly,
            "plan": "Save regularly every month and reduce unnecessary expenses."
        }


# 🤖 Chatbot (NO markdown)
@app.post("/chat")
def chat(data: ChatInput):
    global chat_memory

    system_prompt = """
You are a smart financial advisor.

Rules:
- Do NOT use markdown symbols like #, *, -
- Write in clean simple sentences
- Give practical financial advice for Indian users
- Keep response short and clear
"""

    user_message = data.message

    if data.income and data.expenses:
        user_message += f" User income is {data.income} and expenses are {data.expenses}."

    chat_memory.append({"role": "user", "content": user_message})
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

    except Exception as e:
        return {"reply": "Try to save at least 20 percent of your income."}
