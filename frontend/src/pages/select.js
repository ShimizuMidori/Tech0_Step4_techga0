import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Select.module.css"; // CSSモジュールをインポート

const emotions = [
  { label: "喜（Joy）", img: "/joy.png" },
  { label: "怒（Angry）", img: "/angry.png" },
  { label: "悲（Sad）", img: "/sad.png" },
  { label: "楽（Happy）", img: "/happy.png" },
  { label: "心配・困った（Worried）", img: "/worried.png" },
  { label: "複雑（Mixed）", img: "/mixed.png" },
];

export default function Select() {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [modalStage, setModalStage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleEmotionClick = (emotion) => {
    setSelectedEmotion(emotion);
    localStorage.setItem("selectedEmotion", JSON.stringify(emotion)); // イラスト情報を保存
    setModalStage(1);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalStage(null);
    setSelectedEmotion(null);
  };

  const handleOkClick = () => {
    if (modalStage === 1) {
      setModalStage(2);
    } else if (modalStage === 2) {
      router.push({
        pathname: "/create",
        query: { img: encodeURIComponent(selectedEmotion.img) },
      });
    }
  };

  const handleNgClick = () => {
    setModalStage("thanks");
    setTimeout(() => {
      setShowModal(false);
      setModalStage(null);
      setSelectedEmotion(null);
    }, 3000);
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/home.png" alt="Home" className={styles.homeIcon} onClick={handleHomeClick} />
        <img src="/globe.png" alt="Globe" className={styles.homeIcon} />
      </div>
      <h1 className={styles.title}>今の気持ちや気づきを教えてください。</h1>
      <div className={styles.grid}>
        {emotions.map((emotion) => (
          <div key={emotion.label} className={styles.button}>
            <button onClick={() => handleEmotionClick(emotion)}>
              <img src={emotion.img} alt={emotion.label} />
              {emotion.label}
            </button>
          </div>
        ))}
      </div>
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            {selectedEmotion && (
              <div className="flex flex-col items-center mb-4">
                <img src={selectedEmotion.img} alt={selectedEmotion.label} className="w-24 h-24 mb-2" />
                <p className="text-lg sm:text-xl md:text-2xl">{selectedEmotion.label}</p>
              </div>
            )}
            {modalStage === 1 && (
              <>
                <p className="mb-4 text-lg sm:text-xl md:text-2xl">これでよろしいですか？</p>
                <button onClick={handleOkClick} className="bg-blue-500 text-white py-2 px-4 rounded mr-4">
                  OK
                </button>
                <button onClick={handleModalClose} className="bg-gray-500 text-white py-2 px-4 rounded">
                  キャンセル
                </button>
              </>
            )}
            {modalStage === 2 && (
              <>
                <p className="mb-4 text-lg sm:text-xl md:text-2xl">詳しくお伺いしてもよろしいでしょうか？</p>
                <button onClick={handleOkClick} className="bg-blue-500 text-white py-2 px-4 rounded mr-4">
                  OK
                </button>
                <button onClick={handleNgClick} className="bg-gray-500 text-white py-2 px-4 rounded">
                  NG
                </button>
              </>
            )}
            {modalStage === "thanks" && <p className="mb-4 text-lg sm:text-xl md:text-2xl">ありがとうございました！</p>}
          </div>
        </div>
      )}
    </div>
  );
}
