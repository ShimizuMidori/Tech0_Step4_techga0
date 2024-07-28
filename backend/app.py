import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import Column, Integer, String, DateTime, create_engine, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import openai
import pandas as pd
from io import BytesIO
import xlsxwriter
import uvicorn

# .envファイルの読み込み
load_dotenv()

# OpenAI APIキーの設定
openai.api_key = os.getenv("OPENAI_API_KEY")

# FastAPIアプリケーションの設定
app = FastAPI()

# CORSの設定
origins = ["http://localhost:3000"]  # Next.jsのデフォルトポート
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# データベースの設定
DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    emotion = Column(Integer, nullable=False)
    title = Column(String(50), nullable=False)
    body = Column(String(300), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    manager_comment = Column(String(300), nullable=True)
    likes = Column(Integer, default=0)

Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/api/chat")
async def chat_with_gpt(request: Request):
    data = await request.json()
    user_input = data.get('message')

    context = """
    役割: カウンセラー兼コンサルとしての役割は、社員、特にマネジメント層に属さない人々の感情や意見を理解し、経営判断に活かせるエッセンスを抽出します。感情の確認と理由の探求を行い、事実と感情の区別をつけます。
    対話の姿勢: 言い分を受け止め、寄り添い、丁寧に対応します。怒りの感情が落ち着くまで諭すことはせず、感情、主観、事実をその会話の中で深掘りし、分けられるようにします。
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": user_input}
            ],
            temperature=0.7
        )

        full_response = response.choices[0].message.content.strip()
        if not full_response.endswith('.'):
            full_response += '.'

        return {"response": full_response}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/export_excel")
async def export_excel(request: Request):
    data = await request.json()
    df = pd.DataFrame(data['tableData'])
    selected_columns = ['created_at', 'title', 'body', 'likes', 'manager_comment']
    df = df[selected_columns]
    df['created_at'] = pd.to_datetime(df['created_at']).dt.strftime('%Y/%m/%d')

    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, sheet_name='Employee Sentiments', index=False)
        worksheet = writer.sheets['Employee Sentiments']
        worksheet.set_column('A:A', 20)
        worksheet.set_column('B:B', 30)
        worksheet.set_column('C:C', 80)
        worksheet.set_column('D:D', 10)
        worksheet.set_column('E:E', 30)

        comment = data.get('voicesComment', 'No comment provided')
        comment = comment.replace('】', '】\n\n').replace('。', '。\n\n')
        df_comments = pd.DataFrame({'Voices Comment': [comment]})
        df_comments.to_excel(writer, sheet_name='Voices Comment', index=False)
        worksheet = writer.sheets['Voices Comment']
        worksheet.set_row(1, 310)
        worksheet.write('B1', 'Word Cloud') 
        worksheet.write('A1', 'Voices Comment')
        wrap_format = writer.book.add_format({'text_wrap': True})
        worksheet.set_column('A:A', 60, wrap_format)
        worksheet.set_column('B:B', 80)

        wordcloud_path = 'C:/Users/masay/Documents/pandas/Step3/Step3-2/newproject/backend/static/images/wordcloud.png'
        worksheet.insert_image('B1', wordcloud_path, {'x_scale': 0.2, 'y_scale': 0.2, 'x_offset': 15, 'y_offset': 10})

    output.seek(0)
    return Response(content=output.read(), media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers={"Content-Disposition": "attachment;filename=report.xlsx"})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
