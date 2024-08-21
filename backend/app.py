import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import create_engine, select
from datetime import datetime
import openai
import uvicorn
from langdetect import detect, LangDetectException

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

    # 言語を検出
    try:
        language = detect(user_input)
    except LangDetectException:
        language = "unknown"

    # 検索用のキーワードリストを定義
    keywords = ["勤務時間", "休暇申請", "day off", "残業規定", "服装規定", "機密情報の取り扱い", "セキュリティポリシー", "出張規定", "健康診断", "ハラスメント防止", "リモートワーク規定"]

    # 入力された文章からキーワードを抽出
    matching_keyword = None
    for keyword in keywords:
        if keyword.lower() in user_input.lower():  # 大文字小文字を無視して検索
            matching_keyword = keyword
            break

    # データベースセッションの作成
    session = SessionLocal()

    try:
        if matching_keyword:
            # 抽出したキーワードで社内規定を検索
            query = select(Policy).where(
                Policy.POLICY_TITLE.ilike(f"%{matching_keyword}%") | 
                Policy.POLICY_CONTENT.ilike(f"%{matching_keyword}%")
            )
            result = session.execute(query).scalars().first()

            if result:
                logger.info(f"Found policy: {result.POLICY_TITLE}")
                # 言語に応じてメッセージを選択
                if language == "en":
                    context = "Your role is to provide accurate answers based on company policies. The following policy was found:"
                    assistant_message = f"The following policy was found:\n\n{result.POLICY_CONTENT}"
                elif language == "ja":
                    context = "あなたの役割は、従業員の質問に対し、社内規定に基づいた適切な回答を提供するカウンセラー兼コンサルタントです。以下の社内規定に基づいて回答してください。"
                    assistant_message = f"以下の社内規定が見つかりました：\n\n{result.POLICY_CONTENT}"
                else:
                    context = "Your role is to assist employees by providing relevant advice. Unfortunately, we couldn't detect the language used."
                    assistant_message = "We couldn't detect the language of your request. Please ensure you are using either English or Japanese."
                
                return {"response": assistant_message, "found_policy": True}
            else:
                logger.info("No matching policy found.")
                if language == "en":
                    context = "Your role is to understand the emotions and concerns of employees and extract useful insights for management decisions."
                    assistant_message = "No matching policy was found. Could you please provide more details about your concern?"
                elif language == "ja":
                    context = """
                    あなたの役割は、カウンセラー兼コンサルタントとして、従業員の感情や意見を理解し、それを経営判断に活かせる形で抽出することです。
                    従業員の感情や問題点を確認し、適切なサポートを提供してください。
                    """
                    assistant_message = "社内規定が見つかりませんでした。詳しく教えてください。どのようなお困りごとがありますか？"
                else:
                    context = "Your role is to assist employees by providing relevant advice. Unfortunately, we couldn't detect the language used."
                    assistant_message = "We couldn't detect the language of your request. Please ensure you are using either English or Japanese."
                
        else:
            logger.info("No matching keyword found in the input.")
            if language == "en":
                context = "Your role is to understand the emotions and concerns of employees and extract useful insights for management decisions."
                assistant_message = "No matching policy was found. Could you please provide more details about your concern?"
            elif language == "ja":
                context = """
                あなたの役割は、カウンセラー兼コンサルタントとして、従業員の感情や意見を理解し、それを経営判断に活かせる形で抽出することです。
                従業員の感情や問題点を確認し、適切なサポートを提供してください。
                """
                assistant_message = "社内規定が見つかりませんでした。詳しく教えてください。どのようなお困りごとがありますか？"
            else:
                context = "Your role is to assist employees by providing relevant advice. Unfortunately, we couldn't detect the language used."
                assistant_message = "We couldn't detect the language of your request. Please ensure you are using either English or Japanese."

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

        return {"response": full_response, "found_policy": False}

    except SQLAlchemyError as e:
        logger.error(f"Database query failed: {e}")
        raise HTTPException(status_code=500, detail="データベースクエリに失敗しました")
    finally:
        session.close()

@app.post("/api/save_comment")
async def save_comment(request: Request):
    data = await request.json()
    user_id = data.get('user_id')
    emotion_id = data.get('emotion_id')
    content = data.get('content')
    final_suggestion = data.get('final_suggestion', '')

    # データベースセッションの作成
    session = SessionLocal()

    try:
        # 新しいPOSTレコードの作成
        new_post = Post(
            COMPANY_ID=None,  # MVPのために一時的にNoneに設定
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
