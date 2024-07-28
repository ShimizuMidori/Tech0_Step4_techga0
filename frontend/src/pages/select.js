import React, { useState } from 'react';
import { useRouter } from 'next/router';

const emotions = [
    { label: "喜（Joy）", img: "/joy.png" },
    { label: "怒（Angry）", img: "/angry.png" },
    { label: "悲（Sad）", img: "/sad.png" },
    { label: "楽（Happy）", img: "/happy.png" },
    { label: "心配・困った（Worried）", img: "/worried.png" },
    { label: "複雑（Mixed）", img: "/mixed.png" }
];

export default function Select() {
    const [modalStage, setModalStage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const handleEmotionClick = () => {
        setModalStage(1);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setModalStage(null);
    };

    const handleOkClick = () => {
        if (modalStage === 1) {
            setModalStage(2);
        } else if (modalStage === 2) {
            router.push('/create');
        }
    };

    const handleNgClick = () => {
        setModalStage('thanks');
        setTimeout(() => {
            setShowModal(false);
            setModalStage(null);
        }, 3000);
    };

    return (
        <div className="container mx-auto p-4 sm:p-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-10">今の気持ちや気づきを教えてください。</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {emotions.map((emotion) => (
                    <div key={emotion.label} className="flex flex-col items-center">
                        <button onClick={handleEmotionClick} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                            <img src={emotion.img} alt={emotion.label} className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mb-2"/>
                            {emotion.label}
                        </button>
                    </div>
                ))}
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        {modalStage === 1 && (
                            <>
                                <p className="mb-4 text-lg sm:text-xl md:text-2xl">これでよろしいですか？</p>
                                <button onClick={handleOkClick} className="bg-blue-500 text-white py-2 px-4 rounded mr-4">OK</button>
                                <button onClick={handleModalClose} className="bg-gray-500 text-white py-2 px-4 rounded">キャンセル</button>
                            </>
                        )}
                        {modalStage === 2 && (
                            <>
                                <p className="mb-4 text-lg sm:text-xl md:text-2xl">詳しくお伺いしてもよろしいでしょうか？</p>
                                <button onClick={handleOkClick} className="bg-blue-500 text-white py-2 px-4 rounded mr-4">OK</button>
                                <button onClick={handleNgClick} className="bg-gray-500 text-white py-2 px-4 rounded">NG</button>
                            </>
                        )}
                        {modalStage === 'thanks' && (
                            <p className="mb-4 text-lg sm:text-xl md:text-2xl">ありがとうございました！</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
