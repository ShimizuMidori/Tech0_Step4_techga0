import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const CreatePage = () => {
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        // 初回の問いかけ
        addMessage('どうされましたか？詳しくお聞かせください。', 'bot');
    }, []);

    const handleChat = async () => {
        if (chatInput) {
            addMessage(chatInput, 'user'); // ユーザーのメッセージを履歴に追加

            try {
                const response = await fetch('http://127.0.0.1:8000/api/chat', { // URLを修正
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: chatInput })
                });

                const data = await response.json();
                if (response.ok) {
                    addMessage(data.response, 'bot'); // GPTからの応答を履歴に追加
                } else {
                    addMessage('エラーが発生しました。もう一度お試しください。', 'bot');
                }
            } catch (error) {
                console.error('Chat API error:', error);
                addMessage('通信エラーが発生しました。', 'bot');
            }

            setChatInput(''); // 入力フィールドをクリア
        }
    };

    const addMessage = (text, sender) => {
        setChatHistory(prevHistory => [...prevHistory, { text, sender }]);
    };

    const handleRegister = () => {
        setModalMessage('あなたの声は登録されました。ありがとうございました。');
        setShowModal(true);
        setTimeout(() => {
            setShowModal(false);
            router.push('/login');
        }, 3000);
    };

    const handleStopChat = () => {
        setModalMessage('お疲れ様でした。');
        setShowModal(true);
        setTimeout(() => {
            setShowModal(false);
            router.push('/login');
        }, 3000);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="container mx-auto p-4 sm:p-10">
            <div className="flex flex-col items-center">
                <div className="w-full bg-white p-4 rounded shadow-md">
                    <div className="chat-box max-h-96 overflow-y-auto mb-4">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                <span className={`inline-block px-4 py-2 my-1 rounded ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                                    {msg.text}
                                </span>
                            </div>
                        ))}
                    </div>
                    <textarea
                        className="w-full p-2 border rounded mb-2"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="メッセージを入力..."
                    />
                    <div className="flex justify-between">
                        <button
                            onClick={handleChat}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-2"
                        >
                            送信する
                        </button>
                        <button
                            onClick={handleRegister}
                            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mr-2"
                        >
                            登録する
                        </button>
                        <button
                            onClick={handleStopChat}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                        >
                            対話をやめる
                        </button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <p className="mb-4 text-lg sm:text-xl md:text-2xl">{modalMessage}</p>
                        <button onClick={closeModal} className="bg-blue-500 text-white py-2 px-4 rounded">閉じる</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePage;
