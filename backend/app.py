import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import create_engine, select
from datetime import datetime
import openai
import uvicorn

# .envファイルの読み込み
load_dotenv()

# ログの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# 環境変数からDB接続情報を取得
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
SSL_CA_PATH = os.getenv("SSL_CA_PATH")

# SSLパスのオプション化
if SSL_CA_PATH:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}?ssl_ca={SSL_CA_PATH}"
else:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# SQLAlchemyのエンジンを作成
try:
    engine = create_engine(DATABASE_URL)
    logger.info("Database engine created successfully.")
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    engine = None

# エンジンがNoneの場合の処理
if engine is None:
    raise ValueError("Engine creation failed. Check your DATABASE_URL and database settings.")

# データベースセッションの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# モデルクラスのベース作成
Base = declarative_base()

# モデルの定義
class Post(Base):
    __tablename__ = "posts"
    POST_ID = Column(Integer, primary_key=True, index=True)
    COMPANY_ID = Column(Integer, ForeignKey('companies.COMPANY_ID'))
    USER_ID = Column(Integer, ForeignKey('users.USER_ID'))
    EMOTION_ID = Column(Integer, ForeignKey('emotion_master.EMOTION_ID'))
    CONTENT_ENCRYPTED = Column(String, nullable=False)
    FINAL_SUGGESTION = Column(String, nullable=True)
    POST_DATE = Column(DateTime, nullable=False, default=datetime.now)
    DELETED_FLAG = Column(Integer, default=0)

class Policy(Base):
    __tablename__ = "policies"
    POLICY_ID = Column(Integer, primary_key=True, index=True)
    POLICY_TITLE = Column(String(255), nullable=False)
    POLICY_CONTENT = Column(String, nullable=False)

# テーブルを作成（既存のテーブルがあればスキップされます）
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")
except Exception as e:
    logger.error(f"Failed to create database tables: {e}")

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/api/chat")
async def chat_with_gpt(request: Request):
    data = await request.json()
    user_input = data.get('message')

    # データベースセッションの作成
    session = SessionLocal()

    try:
        # 社内規定を検索
        query = select(Policy).where(
            Policy.POLICY_TITLE.ilike(f"%{user_input}%") | 
            Policy.POLICY_CONTENT.ilike(f"%{user_input}%")
        )
        result = session.execute(query).scalars().first()

        if result:
            logger.info(f"Found policy: {result.POLICY_TITLE}")  # ログを追加
            context = """
            役割: カウンセラー兼コンサルとして、従業員に対し、社内規定に基づいた助言を行います。
            社内規定に基づいた回答を提供します。
            """
            assistant_message = f"以下の社内規定が見つかりました：\n\n{result.POLICY_CONTENT}"
        else:
            logger.info("No matching policy found.")  # ログを追加
            context = """
            役割: カウンセラー兼コンサルとして、従業員の感情や意見を理解し、経営判断に活かせるエッセンスを抽出します。
            感情の確認と理由の探求を行い、事実と感情の区別をつけます。
            """
            assistant_message = "詳しく教えてください。どのようなお困りごとがありますか？"

        # GPT-4での対話生成
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": user_input},
                {"role": "assistant", "content": assistant_message}
            ],
            temperature=0.7
        )

        full_response = response.choices[0].message.content.strip()

        return {"response": full_response}

    except SQLAlchemyError as e:
        logger.error(f"Database query failed: {e}")
        raise HTTPException(status_code=500, detail="データベースクエリに失敗しました")
    finally:
        session.close()


@app.post("/api/save_comment")
async def save_comment(request: Request):
    data = await request.json()
    user_id = data.get('user_id')
    company_id = data.get('company_id')
    emotion_id = data.get('emotion_id')
    content = data.get('content')
    final_suggestion = data.get('final_suggestion', '')

    # データベースセッションの作成
    session = SessionLocal()

    try:
        # 新しいPOSTレコードの作成
        new_post = Post(
            COMPANY_ID=company_id,
            USER_ID=user_id,
            EMOTION_ID=emotion_id,
            CONTENT_ENCRYPTED=content,
            FINAL_SUGGESTION=final_suggestion,
            POST_DATE=datetime.now(),
            DELETED_FLAG=0
        )
        session.add(new_post)
        session.commit()

        return {"message": "コメントが保存されました"}

    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Failed to save comment: {e}")
        raise HTTPException(status_code=500, detail="コメントの保存に失敗しました")
    finally:
        session.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
