import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
from google import genai

load_dotenv()

app = FastAPI(title="Multi-LLM Chatbot API")
model_name = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

api_key = os.getenv("GROQ_API_KEY")

client = Groq(api_key=api_key)


class ChatRequest(BaseModel):
    message: str


@app.post("/chat/groq")
def chat(request: ChatRequest):
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "user", "content": request.message}
        ],
    )

    return {
        "model": model_name,
        "user_message": request.message,
        "response": response.choices[0].message.content,
    }


api_key = os.getenv("GEMINI_API_KEY")
gemini_model_name = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
gemini_client = genai.Client(api_key=api_key)


@app.post("/chat/gemini")
def chat_gemini(request: ChatRequest):
    response = gemini_client.interactions.create(
        model=gemini_model_name,
        input=request.message,
    )

    return {
        "model": gemini_model_name,
        "user_message": request.message,
        "response": response.output_text,
    }
