import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import styles from "../styles/CreatePage.module.css";

const CreatePage = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [image, setImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const router = useRouter();
  const inputRef = useRef(null);
  const [selectedEmotionImg, setSelectedEmotionImg] = useState(null);

  useEffect(() => {
    addMessage("どうされましたか？詳しくお聞かせください。", "bot");

    const img = router.query.img;
    if (img) {
      setSelectedEmotionImg(decodeURIComponent(img));
    }
  }, []);

  const handleChat = () => {
    if (chatInput || transcript) {
      const userMessage = chatInput || transcript;
      addMessage(userMessage, "user");

      setChatInput("");
      resetTranscript();
    }
  };

  const addMessage = (text, sender) => {
    setChatHistory((prevHistory) => [...prevHistory, { text, sender }]);
  };

  const handleRegister = () => {
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
      router.push("/index");
    }, 3000);
  };

  const handleStopChat = () => {
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
      router.push("/index");
    }, 3000);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImage(URL.createObjectURL(file));
    },
    noClick: true,
  });

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();
        video.addEventListener("loadeddata", () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext("2d").drawImage(video, 0, 0);
          setCapturedImage(canvas.toDataURL("image/png"));
          stream.getTracks().forEach((track) => track.stop());
        });
      })
      .catch((error) => console.error("Camera error:", error));
  };

  return (
    <div className={styles.container}>
      <div className="flex flex-col items-center">
        <div className="w-full bg-white p-4 rounded shadow-md">
          {selectedEmotionImg && (
            <div className="mb-4 text-center">
              <img src={selectedEmotionImg} alt="Selected Emotion" className="mx-auto" style={{ maxWidth: "100px", maxHeight: "100px" }} />
            </div>
          )}
          <div className="chat-box max-h-96 overflow-y-auto mb-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                <span className={`inline-block px-4 py-2 my-1 rounded ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>{msg.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.textareaContainer}>
        <textarea ref={inputRef} className={styles.textarea} value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="メッセージを入力..." />
        <div className={styles.iconContainer}>
          <button onClick={startCamera} className="focus:outline-none">
            <img src="/camera.png" alt="カメラ" className={styles.icon} />
          </button>
          <button
            onClick={() => {
              SpeechRecognition.startListening({ continuous: true });
              inputRef.current.focus();
            }}
            className="focus:outline-none"
          >
            <img src="/mic.png" alt="マイク" className={styles.icon} />
          </button>
          <button onClick={open} className="focus:outline-none">
            <img src="/attach.png" alt="クリップ" className={styles.icon} />
          </button>
          <button onClick={handleChat} className="focus:outline-none">
            <img src="/send.png" alt="送信" className={styles.icon} />
          </button>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button onClick={handleRegister} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mr-2">
          登録する
        </button>
        <button onClick={handleStopChat} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
          対話をやめる
        </button>
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <object type="image/svg+xml" data="/ThankYouSmilingPenguin.svg" style={{ width: "200px", height: "auto" }}>
              Your browser does not support SVG
            </object>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePage;
