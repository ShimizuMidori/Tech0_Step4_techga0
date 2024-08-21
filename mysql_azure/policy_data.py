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
    'ssl_ca': SSL_CERT_PATH  # 環境変数から取得した絶対パスを使用
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

    # 既存のpoliciesテーブルがあれば削除
    cursor.execute("DROP TABLE IF EXISTS policies;")
    print("Finished dropping policies table (if existed).")

    # policiesテーブルの作成
    cursor.execute("""
        CREATE TABLE policies (
            POLICY_ID INT AUTO_INCREMENT PRIMARY KEY,
            POLICY_TITLE VARCHAR(255) NOT NULL,
            POLICY_CONTENT TEXT NOT NULL
        );
    """)
    print("Finished creating policies table.")

    # ダミーデータの挿入
    policies = [
        ("勤務時間", "従業員の勤務時間は午前9時から午後6時までです。休憩時間は1時間です。"),
        ("休暇申請", "休暇の申請は、上司の承認を得て、2週間前に提出する必要があります。"),
        ("day off", "You will need to submit a leave request and get approved by your manager at least 2 weeks prior to your requested leave date."),
        ("残業規定", "残業は原則として認められていませんが、緊急時には上司の許可を得ることで可能です。"),
        ("服装規定", "従業員はビジネスカジュアルを着用することが求められます。ジーンズやスニーカーは許可されていません。"),
        ("機密情報の取り扱い", "機密情報は厳重に管理され、許可のない第三者に漏洩することは禁止されています。"),
        ("セキュリティポリシー", "パスワードは8文字以上で、大文字、小文字、数字を含む必要があります。定期的な変更が推奨されます。"),
        ("出張規定", "出張の際は、上司の事前承認が必要で、出張報告書を提出する必要があります。"),
        ("健康診断", "年に1回、従業員は健康診断を受ける義務があります。費用は会社が負担します。"),
        ("ハラスメント防止", "すべての従業員は、ハラスメントを防止するためのガイドラインを遵守する必要があります。違反した場合は厳重に対処されます。"),
        ("リモートワーク規定", "リモートワークは事前に上司の許可を得た場合にのみ許可されます。業務効率を保つためのルールを遵守する必要があります。")
    ]

    for title, content in policies:
        cursor.execute("""
            INSERT INTO policies (POLICY_TITLE, POLICY_CONTENT)
            VALUES (%s, %s)
        """, (title, content))

    print("Finished inserting policies data.")

    # 変更のコミット
    conn.commit()
    cursor.close()
    conn.close()
    print("Done.")
