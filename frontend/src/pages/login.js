import React, { useState } from 'react';
import { useRouter } from 'next/router';

function Login() {
    const router = useRouter();
    const [username, setId] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [managerRedirect, setManagerRedirect] = useState(false);

    const handleLogin = () => {
        console.log('Login button clicked');
        router.push('/');  // ログインボタンをクリックすると、/index.js ページにルーティング
    };

    const isFormValid = username.length > 0 && password.length > 0;

    return (
        <div className="flex flex-col items-center justify-center h-screen p-4">
            <div className="text-center mb-10">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">Voices</h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mt-5">エンゲージメントサーベイへようこそ</p>
            </div>
            <div className="mb-5 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 flex justify-center items-center">
                <div className="w-full">
                    <div className="mb-2">個人ID</div>
                    <input
                        type="text"
                        id="email"
                        value={username}
                        onChange={(e) => setId(e.target.value)}
                        className="bg-gray-200 h-12 rounded-lg p-2.5 box-border w-full text-lg sm:text-xl md:text-2xl"
                    />
                </div>
            </div>
            <div className="mb-5 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 flex justify-center items-center">
                <div className="w-full">
                    <div className="mb-2">パスワード</div>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-200 h-12 rounded-lg p-2.5 box-border w-full text-lg sm:text-xl md:text-2xl"
                    />
                </div>
            </div>
            <div className="mb-5 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 flex justify-center">
                <label className="flex items-center mr-5">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="mr-1.5"
                    />
                    情報を保存
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={managerRedirect}
                        onChange={(e) => setManagerRedirect(e.target.checked)}
                        className="mr-1.5"
                    />
                    マネージャーページへ遷移する
                </label>
            </div>
            <button
                disabled={!isFormValid}
                type="button"
                onClick={handleLogin}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
                ログイン
            </button>
            <a href="/password-reset" className="text-blue-500 hover:text-blue-700 mt-2">パスワードを忘れた場合</a>
        </div>
    );
}

export default Login;
