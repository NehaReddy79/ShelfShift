from fastapi import FastAPI , UploadFile , File , HTTPException
import os

app = FastAPI()
os.makedirs("storage/uploads/", exist_ok=True)

@app.get("/")
def root():
    return {"message" : "Working"}

@app.post("/convert")
async def file_upload(file : UploadFile = File(...)):
    if not file.filename :
        raise HTTPException(status_code=400 , detail = "No file found")
    
    filepath = os.path.join("storage/uploads", file.filename)

    contents = await file.read()

    with open(filepath , "wb") as buffer : 
        buffer.write(contents)

    return {
        "filename" : file.filename,
        "size" : len(contents)
    }