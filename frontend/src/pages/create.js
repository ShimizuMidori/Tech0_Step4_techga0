import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const CreatePage = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [image, setImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const router = useRouter();
  const inputRef = useRef(null);

  useEffect(() => {
    addMessage("どうされましたか？詳しくお聞かせください。", "bot");
  }, []);

  const handleChat = async () => {
    if (chatInput || transcript) {
      const userMessage = chatInput || transcript;
      addMessage(userMessage, "user");

      try {
        const response = await fetch("http://127.0.0.1:8000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();
        if (response.ok) {
          addMessage(data.response, "bot");
        } else {
          addMessage("エラーが発生しました。もう一度お試しください。", "bot");
        }
      } catch (error) {
        console.error("Chat API error:", error);
        addMessage("通信エラーが発生しました。", "bot");
      }

      setChatInput("");
      resetTranscript();
      router.push("/index");
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
    setModalMessage("お疲れ様でした。");
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
      router.push("/index");
    }, 3000);
  };

  const closeModal = () => {
    setShowModal(false);
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
    <div className="container mx-auto p-4 sm:p-10">
      <div className="flex flex-col items-center">
        <div className="w-full bg-white p-4 rounded shadow-md">
          <div className="chat-box max-h-96 overflow-y-auto mb-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                <span className={`inline-block px-4 py-2 my-1 rounded ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="relative">
            <textarea
              ref={inputRef}
              className="w-full p-2 border rounded mb-2 pr-12"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="メッセージを入力..."
              style={{ paddingRight: "4rem" }} // 右側にアイコンのスペースを確保
            />
            <div className="absolute right-2 bottom-2 flex space-x-2 opacity-70">
              <button onClick={startCamera} className="focus:outline-none">
                <img src="/camera.png" alt="カメラ" className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  SpeechRecognition.startListening({ continuous: true });
                  inputRef.current.focus();
                }}
                className="focus:outline-none"
              >
                <img src="/mic.png" alt="マイク" className="w-6 h-6" />
              </button>
              <button onClick={open} className="focus:outline-none">
                <img src="/attach.png" alt="クリップ" className="w-6 h-6" />
              </button>
              <button onClick={handleChat} className="focus:outline-none">
                <img src="/send.png" alt="送信" className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div {...getRootProps({ className: "dropzone" })} className="hidden">
            <input {...getInputProps()} />
          </div>
          {image && (
            <div className="mb-4">
              <Image src={image} alt="Uploaded preview" className="mx-auto" width={500} height={500} />
            </div>
          )}
          {capturedImage && (
            <div className="mb-4">
              <Image src={capturedImage} alt="Captured" className="mx-auto" width={500} height={500} />
            </div>
          )}
          <div className="flex justify-between">
            <button onClick={handleRegister} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mr-2">
              登録する
            </button>
            <button onClick={handleStopChat} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
              対話をやめる
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="p-6 text-center" style={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}>
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
