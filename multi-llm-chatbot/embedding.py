
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util

app = FastAPI(title="Text Embedding API")

model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

class TextInput(BaseModel):
    text1: str
    text2: str


@app.get("/")
def home():
    return {"message": "Text Embedding API is running!"}


@app.post("/similarity")
def calculate_similarity(data: TextInput):

    embedding1 = model.encode(
        data.text1,
        convert_to_tensor=True
    )

    embedding2 = model.encode(
        data.text2,
        convert_to_tensor=True
    )
    similarity = util.cos_sim(
        embedding1,
        embedding2
    ).item()


    if similarity >= 0.7:
        result = "Highly Similar"
    elif similarity >= 0.4:
        result = "Moderately Similar"
    else:
        result = "Less Similar"

    return {
        "text1": data.text1,
        "text2": data.text2,
        "embedding1": embedding1.tolist(),
        "embedding2": embedding2.tolist(),
        "embedding_dimension": len(embedding1),
        "similarity_score": round(similarity, 4),
        "result": result
    }
