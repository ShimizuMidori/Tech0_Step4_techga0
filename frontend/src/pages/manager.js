import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import WordCloudDisplay from '../components/WordCloudDisplay';

const Manager = () => {
    const [posts, setPosts] = useState([]);
    const [inputComments, setInputComments] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/posts') // URLを修正
            .then(response => response.json())
            .then(data => {
                setPosts(data);
                const commentsMap = {};
                data.forEach(post => {
                    commentsMap[post.id] = post.manager_comment || '';
                });
                setInputComments(commentsMap);
            })
            .catch(error => console.error('Error:', error));
    }, []);

    const handleCommentChange = (postId, value) => {
        setInputComments(prev => ({ ...prev, [postId]: value }));
    };

    const updateManagerComment = (postId) => {
        const manager_comment = inputComments[postId];
        fetch(`http://127.0.0.1:8000/api/manager/comment/update/${postId}`, { // URLを修正
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ manager_comment }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.status === 'success') {
                setPosts(prev => prev.map(post => post.id === postId ? { ...post, manager_comment } : post));
            }
        })
        .catch(error => console.error('Error:', error));
    };

    const likePost = (postId) => {
        fetch(`http://127.0.0.1:8000/api/posts/${postId}/like`, { // URLを修正
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            setPosts(prev => prev.map(post => post.id === postId ? { ...post, likes: post.likes + 1 } : post));
        })
        .catch(error => console.error('Error:', error));
    };

    const handleChat = async () => {
        if (chatInput) {
            addMessage(chatInput, 'user');  // ユーザーのメッセージを履歴に追加
            try {
                const response = await fetch('http://127.0.0.1:8000/api/chat/manager', { // URLを修正
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: chatInput })
                });
                const data = await response.json();
                if (response.ok) {
                    addMessage(data.response, 'bot');  // GPTからの応答を履歴に追加
                    setChatInput('');  // 入力フィールドをクリア
                } else {
                    addMessage('エラーが発生しました。もう一度お試しください。', 'bot');
                }
            } catch (error) {
                console.error('Chat API error:', error);
                addMessage('通信エラーが発生しました。', 'bot');
            }
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(chatInput)
            .then(() => alert('コピーされました！'))
            .catch(err => console.error('コピーに失敗しました:', err));
    };

    const addMessage = (text, sender) => {
        setChatHistory(prevHistory => [...prevHistory, { text, sender }]);
    };

    const openModal = () => {
        setShowModal(true);
        setChatHistory([]); // モーダルを開く時にチャット履歴をクリアする
    };

    const exportToExcel = async () => {
        const response = await fetch('http://127.0.0.1:8000/api/export_excel', { // URLを修正
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tableData: posts,  // 表示されているポストデータ
                voicesComment: `【Voicesからの提案】顧客の要望に関する社内のコミュニケーションと進捗報告の不足を改善するために、内部コミュニケーションプラットフォームの導入、定期的な進捗報告ミーティングの設置、進捗追跡システムの構築を提案します。これらの措置により、顧客からの要望がどのように取り扱われているかについての透明性が高まり、社員が感じるフラストレーションを軽減し、積極的な顧客対応へとつながるでしょう。具体的には、Voicesの活用促進キャンペーンを実施しましょう。毎月月初に自動で投稿促進メールを送ることを推奨します。定期的な進捗報告ミーティングを設置しましょう。心理的安全性に配慮するためにアイスブレイクも取り入れてください。進捗追跡システムを構築しましょう。JiraやConfluenceなどのツールが活用できます。`
            })
        });

        if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', 'report.xlsx'); // Excelファイルとしてダウンロード
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <nav className="bg-gray-200 p-4 rounded">
                <Link href="/login">
                    <button className="text-blue-500 hover:text-blue-700">ログイン画面へ戻る</button>
                </Link>
            </nav>
            <div className="py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">マネージャーページ</h2>
                <button
                    className="bg-blue-500 hover:transparent bg-gradient-to-r from-blue-500 to-teal-400 text-white py-2 px-4 rounded"
                    onClick={openModal}
                >
                    Voicesと対話する
                </button>
            </div>
            <table className="table-auto w-full">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2">タイトル</th>
                        <th className="px-4 py-2">本文</th>
                        <th className="px-4 py-2">作成日時</th>
                        <th className="px-4 py-2">経営層からの言葉</th>
                        <th className="px-4 py-2">イイネ</th>
                        <th className="px-4 py-2">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map(post => (
                        <tr key={post.id}>
                            <td className="border px-4 py-2">{post.title}</td>
                            <td className="border px-4 py-2">{post.body}</td>
                            <td className="border px-4 py-2">{new Date(post.created_at).toLocaleDateString()}</td>
                            <td className="border px-4 py-2">
                                <input
                                    type="text"
                                    value={inputComments[post.id]}
                                    onChange={e => handleCommentChange(post.id, e.target.value)}
                                    className="form-input rounded w-full"
                                />
                                <button
                                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
                                    onClick={() => updateManagerComment(post.id)}
                                >
                                    更新
                                </button>
                            </td>
                            <td className="border px-4 py-2">{post.likes}</td>
                            <td className="border px-4 py-2">
                                <button
                                    className="bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded"
                                    onClick={() => likePost(post.id)}
                                >
                                    イイネ
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex items-center justify-between mt-8 mb-4">
                <h3 className="text-xl font-bold">現在の従業員の気持ち</h3>
                <button onClick={exportToExcel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    サマリーを出力する
                </button>
            </div>
            <div className="bg-gradient-to-r from-blue-500/80 to-teal-400/80 shadow-lg p-4 mb-6 relative before:absolute before:content-[''] before:top-full before:left-1/2 before:-ml-2 before:border-t-8 before:border-t-transparent before:border-l-8 before:border-l-transparent before:border-r-8 before:border-r-transparent h-40">
                <p className="text-lg text-white font-bold mb-2">【Voicesからの提案】</p>
                <p className="text-base text-white font-semibold mb-1">顧客の要望に関する社内のコミュニケーションと進捗報告の不足を改善するために、<b>①内部コミュニケーションプラットフォームの導入、②定期的な進捗報告ミーティングの設置、③進捗追跡システムの構築</b>を提案します。</p>
                <p className="text-sm text-white mb-1">これらの措置により、顧客からの要望がどのように取り扱われているかについての透明性が高まり、社員が感じるフラストレーションを軽減し、積極的な顧客対応へとつながるでしょう。</p>
                <p className="text-sm text-white">具体的には、<b>①</b>Voicesの活用促進キャンペーンを実施しましょう。毎月月初に自動で投稿促進メールを送ることを推奨します。<b>②</b>定期的な進捗報告ミーティングを設置しましょう。心理的安全性に配慮するためにアイスブレイクも取り入れてください。<b>③</b>進捗追跡システムを構築しましょう。JiraやConfluenceなどのツールが活用できます。</p>
            </div>

            <WordCloudDisplay />
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-3/4 max-w-4xl">
                        <h2 className="text-lg">Voicesとの対話</h2>
                        <div className="flex flex-col space-y-2 my-4 max-h-96 overflow-y-auto">
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`px-4 py-2 rounded-lg shadow ${msg.sender === 'user' ? 'ml-auto bg-blue-200' : 'mr-auto bg-gray-200'}`}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        <textarea
                            className="w-full p-2 border rounded"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="メッセージを入力..."
                        ></textarea>
                        <div className="flex justify-end space-x-2 mt-2">
                            <button
                                className="transparent bg-gradient-to-r from-blue-500 to-teal-400 hover:transparent bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold py-1 px-2 rounded"
                                onClick={handleChat}
                            >
                                対話を続ける
                            </button>
                            <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                                onClick={handleCopy}
                            >
                                コピーする
                            </button>
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                                onClick={() => setShowModal(false)}
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Manager;
