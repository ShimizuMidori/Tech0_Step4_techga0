import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Login.module.css";

function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [managerRedirect, setManagerRedirect] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    const correctUsername = "user";
    const correctPassword = "password123";

    if (username === correctUsername && password === correctPassword) {
      router.push("/");
    } else {
      setError("ユーザー名またはパスワードが間違っています。");
    }
  };

  const isFormValid = username.length > 0 && password.length > 0;

  return (
    <div className={styles.container}>
      <div className="text-center mb-10">
        <h1 className={styles.title}>Voices</h1>
        <p className={styles.subtitle}>エンゲージメントサーベイへようこそ</p>
      </div>
      <div className="w-full">
        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="個人ID" className={styles.inputField} />
      </div>
      <div className="w-full">
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" className={styles.inputField} />
      </div>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <div className={styles.checkboxContainer}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          情報を保存
        </label>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={managerRedirect} onChange={(e) => setManagerRedirect(e.target.checked)} />
          マネージャーページへ遷移する
        </label>
      </div>
      <div className="w-full mt-4">
        <button disabled={!isFormValid} type="button" onClick={handleLogin} className={styles.loginButton}>
          ログイン
        </button>
      </div>
      <a href="/password-reset" className={styles.forgotPasswordLink}>
        パスワードを忘れた場合
      </a>
    </div>
  );
}

export default Login;
