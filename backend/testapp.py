# backend/testapp.py

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Render works"}