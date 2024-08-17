import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css"; // CSSモジュールをインポート

export default function Home() {
  const [dateTime, setDateTime] = useState(null);
  const [startTimes, setStartTimes] = useState([]);
  const [endTimes, setEndTimes] = useState([]);
  const [breakTimes, setBreakTimes] = useState([]);
  const [breakState, setBreakState] = useState(false);
  const [startDisabled, setStartDisabled] = useState(false);
  const [endDisabled, setEndDisabled] = useState(true);
  const [breakDisabled, setBreakDisabled] = useState(true);
  const [showPopup, setShowPopup] = useState(false); // ポップアップの表示状態を管理するステート
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const recordStartTime = () => {
    if (!startDisabled) {
      setStartTimes([...startTimes, new Date()]);
      setStartDisabled(true);
      setEndDisabled(false); // 出社ボタンが押された後、退社ボタンを有効にする
      setBreakDisabled(false); // 出社ボタンが押された後、Breaktimeボタンを有効にする
    }
  };

  const recordEndTime = () => {
    if (!endDisabled) {
      setEndTimes([...endTimes, new Date()]);
      setEndDisabled(true); // 一度退社ボタンが押されたら、再度押せないようにする
      setShowPopup(true); // ポップアップを表示
    }
  };

  const recordBreakTime = () => {
    if (!breakDisabled) {
      const currentTime = new Date();
      setBreakTimes([...breakTimes, { time: currentTime, isStart: !breakState }]);
      setBreakState(!breakState);
    }
  };

  const handleLogout = () => {
    router.push("/login"); // ログアウト後、ログインページに遷移
  };

  const handleRegister = () => {
    setShowPopup(false);
    router.push("/select"); // 登録後に create ページに遷移
  };

  const handleModify = () => {
    setShowPopup(false);
    setEndTimes([]); // 退勤時刻をリセットして再入力を促す
    setEndDisabled(false); // 再度退社ボタンを押せるようにする
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleLogout}>
          <img src="/logout.png" alt="logout" className={styles.homeIcon} />
        </button>
        <img src="/globe.png" alt="globe" className={styles.homeIcon} />
      </div>
      <h1 className={styles.title}>Voices</h1>
      <div className={styles.dateTime}>
        {dateTime && (
          <>
            <p className={styles.time}>{dateTime.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</p>
            <p className={styles.date}>{dateTime.toLocaleDateString(undefined, { year: "numeric", month: "numeric", day: "numeric" })}</p>
          </>
        )}
      </div>
      <div className={styles.buttonsRow}>
        <div className={styles.buttonWrapper}>
          <button className={`${styles.button} ${styles.startButton}`} onClick={recordStartTime} disabled={startDisabled}>
            <Image src="/goingcompany.png" alt="Start" layout="fill" objectFit="contain" className={styles.icon} />
          </button>
          <div className={`${styles.timeStamp} ${styles.start}`}>{startTimes.length > 0 && formatTime(startTimes[0])}</div>
        </div>
        <div className={styles.buttonWrapper}>
          <button className={`${styles.button} ${styles.endButton}`} onClick={recordEndTime} disabled={endDisabled}>
            <Image src="/goingback.png" alt="End" layout="fill" objectFit="contain" className={styles.icon} />
          </button>
          <div className={`${styles.timeStamp} ${styles.end}`}>{endTimes.length > 0 && formatTime(endTimes[0])}</div>
        </div>
      </div>
      <div className={styles.buttonWrapperLarge}>
        <button className={`${styles.buttonLarge} ${styles.breakButton} ${breakState ? styles.breakButtonActive : ""}`} onClick={recordBreakTime} disabled={breakDisabled}>
          <Image src="/Breakingtime.png" alt="Breaktime" layout="fill" objectFit="contain" className={styles.icon} />
        </button>
        <div className={styles.breakTimes}>
          {breakTimes.map((breakTime, index) =>
            index % 2 === 0 ? (
              <div key={index / 2} className={styles.breakTimeSet}>
                <div className={`${styles.timeStamp} ${styles.break}`}>
                  {formatTime(breakTime.time)} -{breakTimes[index + 1] && formatTime(breakTimes[index + 1].time)}
                </div>
              </div>
            ) : (
              <div key={index} className={`${styles.timeStamp} ${styles.break}`}></div>
            )
          )}
        </div>
      </div>
      <div className={styles.buttonWrapperLarge}>
        <Link href="/select">
          <button className={`${styles.buttonLarge} ${styles.consultingButton}`}>
            <Image src="/Thinking.png" alt="Consulting" layout="fill" objectFit="contain" className={styles.icon} />
          </button>
        </Link>
      </div>

      {/* ポップアップ */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <p>登録してよろしいでしょうか？</p>
            <div className={styles.popupButtons}>
              <button onClick={handleModify} className={styles.modifyButton}>
                修正する
              </button>
              <button onClick={handleRegister} className={styles.registerButton}>
                登録する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
