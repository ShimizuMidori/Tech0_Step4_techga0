import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Select.module.css";

const emotions = [
  { label: "ニュートラル（Neutral）", img: "/emotion_neutral.png" },
  { label: "嬉しい（Happy）", img: "/emotion_happy.png" },
  { label: "怒り（Angry）", img: "/emotion_angry.png" },
  { label: "悲しい（Sad）", img: "/emotion_sad.png" },
  { label: "混乱（Confused）", img: "/emotion_confused.png" },
  { label: "楽しい（Fun）", img: "/emotion_fun.png" },
  { label: "驚き（Surprised）", img: "/emotion_surprised.png" },
  { label: "謝罪（Sorry）", img: "/emotion_sorry.png" },
];

const MODAL_STAGES = {
  INITIAL: 1,
  DETAIL: 2,
  THANKS: "thanks",
};

export default function Select() {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [modalStage, setModalStage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleEmotionClick = (emotion) => {
    setSelectedEmotion(emotion);
    localStorage.setItem("selectedEmotion", JSON.stringify(emotion));
    setModalStage(MODAL_STAGES.INITIAL);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalStage(null);
    setSelectedEmotion(null);
  };

  const handleOkClick = () => {
    if (modalStage === MODAL_STAGES.INITIAL) {
      setModalStage(MODAL_STAGES.DETAIL);
    } else if (modalStage === MODAL_STAGES.DETAIL) {
      router.push({
        pathname: "/create",
        query: { img: encodeURIComponent(selectedEmotion.img) },
      });
    }
  };

  const handleNgClick = () => {
    setModalStage(MODAL_STAGES.THANKS);
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
        <img src="/home.png" alt="Home" className={styles.homeIcon} onClick={handleHomeClick} aria-label="Home" />
        <img src="/globe.png" alt="Globe" className={styles.homeIcon} aria-label="Globe" />
      </div>
      <h1 className={styles.title}>今の気持ちや気づきを教えてください。</h1>
      <div className={styles.grid}>
        {emotions.map((emotion) => (
          <div key={emotion.label} className={styles.button}>
            <button onClick={() => handleEmotionClick(emotion)} aria-label={emotion.label}>
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
            {modalStage === MODAL_STAGES.INITIAL && (
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
            {modalStage === MODAL_STAGES.DETAIL && (
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
            {modalStage === MODAL_STAGES.THANKS && <p className="mb-4 text-lg sm:text-xl md:text-2xl">ありがとうございました！</p>}
          </div>
        </div>
      )}
    </div>
  );
}
