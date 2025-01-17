from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
     CORSMiddleware, allow_origins=["*"],
     allow_methods=["*"],
     allow_headers=["*"],)

base_dir = os.path.dirname(__file__)
json_file_path = os.path.join(base_dir, "meteodaten_2023_daily.json")

@app.get("/api/daten")
def get_daten():
    try:
        with open(json_file_path, encoding="utf-8") as file:
            daten = json.load(file)
        return daten
    except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Datei nicht gefunden")