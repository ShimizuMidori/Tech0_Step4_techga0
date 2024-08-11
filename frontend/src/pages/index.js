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
  const [consultingTimes, setConsultingTimes] = useState([]);
  const [breakState, setBreakState] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const recordStartTime = () => {
    setStartTimes([...startTimes, new Date()]);
  };

  const recordEndTime = () => {
    setEndTimes([...endTimes, new Date()]);
  };

  const recordBreakTime = () => {
    const currentTime = new Date();
    setBreakTimes([...breakTimes, { time: currentTime, isStart: !breakState }]);
    setBreakState(!breakState);
  };

  const handleLogout = () => {
    // ログアウト処理をここに追加（例えば、トークンの削除など）
    router.push("/login"); // ログアウト後、ログインページに遷移
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
        <img src="/globe.png" alt="globe" className={styles.homeIcon} /> {/* 新しく追加 */}
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
          <button className={`${styles.button} ${styles.startButton}`} onClick={recordStartTime}>
            <Image src="/goingcompany.png" alt="Start" layout="fill" objectFit="contain" className={styles.icon} />
          </button>
          {startTimes.map((time, index) => (
            <div key={index} className={styles.timeStamp}>
              {formatTime(time)}
            </div>
          ))}
        </div>
        <div className={styles.buttonWrapper}>
          <button className={`${styles.button} ${styles.endButton}`} onClick={recordEndTime}>
            <Image src="/goingback.png" alt="End" layout="fill" objectFit="contain" className={styles.icon} />
          </button>
          {endTimes.map((time, index) => (
            <div key={index} className={styles.timeStamp}>
              {formatTime(time)}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.buttonWrapperLarge}>
        <button className={`${styles.buttonLarge} ${styles.breakButton}`} onClick={recordBreakTime}>
          <Image src="/Breakingtime.png" alt="Breaktime" layout="fill" objectFit="contain" className={styles.icon} />
        </button>
        <div className={styles.breakTimes}>
          {breakTimes.map((breakTime, index) =>
            index % 2 === 0 ? (
              <div key={index / 2} className={styles.breakTimeSet}>
                <div className={styles.timeStamp}>{formatTime(breakTime.time)} - </div>
                {breakTimes[index + 1] && <div className={styles.timeStamp}>{formatTime(breakTimes[index + 1].time)}</div>}
              </div>
            ) : null
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
    </div>
  );
}
