import os
import mysql.connector
from mysql.connector import errorcode
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

# .envファイルから環境変数を取得
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
SSL_CERT_PATH = os.getenv("SSL_CERT_PATH")

# 接続文字列情報を設定
config = {
    'host': DB_HOST,
    'user': DB_USER,
    'password': DB_PASSWORD,
    'database': DB_NAME,
    'client_flags': [mysql.connector.ClientFlag.SSL],
    'ssl_ca': SSL_CERT_PATH,  # 環境変数から取得した絶対パスを使用
    'charset': 'utf8mb4'  # エンコーディングをUTF-8に設定
}

# 接続文字列を構築して接続
try:
    conn = mysql.connector.connect(**config)
    print("Connection established")
except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Something is wrong with the user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print("Error:", err)
else:
    cursor = conn.cursor()
    print("Cursor created")

    # 英語のデータを挿入
    emotions = [
        (1, "Neutral"),
        (2, "Happy"),
        (3, "Angry"),
        (4, "Sad"),
        (5, "Confused"),
        (6, "Fun"),
        (7, "Surprised"),
        (8, "Sorry")
    ]

    for emotion_id, emotion_name in emotions:
        cursor.execute("""
            INSERT INTO emotion_master (EMOTION_ID, EMOTION_NAME)
            VALUES (%s, %s)
        """, (emotion_id, emotion_name))

    print("Finished inserting emotion data.")

    # 変更のコミット
    conn.commit()
    cursor.close()
    conn.close()
    print("Done.")
