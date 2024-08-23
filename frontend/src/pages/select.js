import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Select.module.css";

const emotions = [
  { label: "Neutral", img: "/emotion_neutral.png" },
  { label: "Happy", img: "/emotion_happy.png" },
  { label: "Angry", img: "/emotion_angry.png" },
  { label: "Sad", img: "/emotion_sad.png" },
  { label: "Confused", img: "/emotion_confused.png" },
  { label: "Fun", img: "/emotion_fun.png" },
  { label: "Surprised", img: "/emotion_surprised.png" },
  { label: "Sorry", img: "/emotion_sorry.png" },
];

const MODAL_STAGES = {
  INITIAL: 1,
  DETAIL: 2,
  THANKS: "thanks",
};

export default function Select() {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [modalStage, setModalStage] = useState(MODAL_STAGES.INITIAL);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleEmotionClick = (emotion) => {
    setSelectedEmotion(emotion);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalStage(MODAL_STAGES.INITIAL); // リセット
    setSelectedEmotion(null);
  };

  const handleOkClick = () => {
    if (modalStage === MODAL_STAGES.INITIAL) {
      setModalStage(MODAL_STAGES.DETAIL);
    } else if (modalStage === MODAL_STAGES.DETAIL) {
      router.push("/create");
    }
  };

  const handleNgClick = () => {
    setModalStage(MODAL_STAGES.THANKS);
    setTimeout(() => {
      setShowModal(false);
      setModalStage(MODAL_STAGES.INITIAL);
      setSelectedEmotion(null);
    }, 3000);
  };

  const handleHomeClick = () => {
    router.push("/"); // ホームボタンがクリックされたときにルートページに遷移
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/home.png" alt="Home" className={styles.homeIcon} onClick={handleHomeClick} />
        <img src="/globe.png" alt="Globe" className={styles.homeIcon} />
      </div>
      <h1 className={styles.title}>
        今の気持ちや気づきを
        <br />
        教えてください。
      </h1>
      <div className={styles.grid}>
        {emotions.map((emotion) => (
          <div key={emotion.label} className={`${styles.button} ${styles[emotion.label.toLowerCase()]}`}>
            <button onClick={() => handleEmotionClick(emotion)}>
              <img src={emotion.img} alt={emotion.label} />
              {emotion.label}
            </button>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center" style={{ minWidth: "300px", maxWidth: "400px" }}>
            {modalStage === MODAL_STAGES.INITIAL && (
              <>
                <img src={selectedEmotion.img} alt={selectedEmotion.label} className="w-24 h-24 mb-4 mx-auto" />
                <p className="mb-4 text-lg sm:text-xl md:text-2xl">
                  こちらで
                  <br />
                  よろしいでしょうか？
                </p>
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
                <img src={selectedEmotion.img} alt={selectedEmotion.label} className="w-24 h-24 mb-4 mx-auto" />
                <p className="mb-4 text-lg sm:text-xl md:text-2xl">
                  詳しくお伺いしても
                  <br />
                  よろしいでしょうか？
                </p>
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
