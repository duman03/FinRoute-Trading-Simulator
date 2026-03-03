import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { theme } from '../utils/theme';
import { PriceChart } from './PriceChart';
import { Audio } from 'expo-av';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function LessonQuizModal({
  visible,
  onRequestClose,
  lessonTitle,
  lessonSubtitle,
  questions,
  heartsLeft,
  heartsDepletedAtMs,
  onConsumeHeart,
  onRestoreHearts,
  onComplete,
  successXpLabel = '+100 XP',
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lastAnswerIndex, setLastAnswerIndex] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());

  const timeLeftMs = useMemo(() => {
    if (heartsLeft > 0) return 0;
    if (!heartsDepletedAtMs) return FIVE_MINUTES_MS;
    const passed = nowMs - heartsDepletedAtMs;
    return Math.max(0, FIVE_MINUTES_MS - passed);
  }, [heartsLeft, heartsDepletedAtMs, nowMs]);

  const isCooldownLocked = heartsLeft <= 0 && timeLeftMs > 0;

  useEffect(() => {
    if (!visible) return undefined;

    // modal açıldığında quiz state'ini sıfırla (kalp sayısı kalıcıdır)
    setQuestionIndex(0);
    setLastAnswerIndex(null);
    setLastAnswerCorrect(null);
    setFeedback('');
    setIsCompleted(false);
    setIsFailed(false);
    setNowMs(Date.now());
    return undefined;
  }, [visible]);

  useEffect(() => {
    if (!visible) return undefined;
    if (heartsLeft > 0) return undefined;

    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [visible, heartsLeft]);

  useEffect(() => {
    if (!visible) return;
    if (heartsLeft > 0) return;

    // cooldown bittiğinde otomatik yenile
    if (timeLeftMs === 0 && onRestoreHearts) {
      onRestoreHearts('cooldown');
    }
  }, [visible, heartsLeft, timeLeftMs, onRestoreHearts]);
  const playSound = async (isCorrect) => {
    try {
      const soundFile = isCorrect 
        ? require('../../assets/correct.mp3') 
        : require('../../assets/wrong.mp3');
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Ses çalınamadı:", error);
    }
  };
  const handleAnswer = (optionIndex) => {
    // Tıklanan seçenek geçerli mi kontrol et
    if (questions === undefined || questions[questionIndex] === undefined) return;

    const isCorrect = optionIndex === questions[questionIndex].correctIndex;
    setLastAnswerIndex(optionIndex);
    setLastAnswerCorrect(isCorrect);

    if (isCorrect) {
      // Sesi try-catch içine alalım ki hata verirse kod durmasın
      try { playSound(true); } catch(e) {} 
      
      const isLastQuestion = questionIndex === questions.length - 1;
      
      if (isLastQuestion) {
        setIsCompleted(true);
        setFeedback(`Dersi Tamamladın! ${successXpLabel}`);
        if (onComplete) onComplete();
      } else {
        setFeedback('Doğru! Sıradaki soruya geçiyorsun.');
        setTimeout(() => {
          setQuestionIndex((prev) => prev + 1);
          setLastAnswerIndex(null);
          setLastAnswerCorrect(null);
          setFeedback('');
        }, 800);
      }
    } else {
      try { playSound(false); Vibration.vibrate(60); } catch(e) {}
      
      // Kalp azaltma mantığı
      if (onConsumeHeart) {
        onConsumeHeart(heartsLeft - 1);
      }
      setFeedback('Yanlış cevap, tekrar dene!');
      
      // Hatalı seçimden sonra butonu sıfırla ki tekrar basılabilsin
      setTimeout(() => {
        setLastAnswerIndex(null);
        setLastAnswerCorrect(null);
      }, 1000);
    }
  };

  const progressPercent = useMemo(() => {
    const total = Math.max(1, questions?.length ?? 1);
    return ((questionIndex + 1) / total) * 100;
  }, [questionIndex, questions?.length]);

  const timeLeftLabel = useMemo(() => {
    const totalSec = Math.ceil(timeLeftMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [timeLeftMs]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onRequestClose} transparent={false}>
      <View style={styles.quizContainer}>
        <View style={styles.quizHeader}>
          <View>
            <Text style={styles.quizTitle}>{lessonTitle}</Text>
            <Text style={styles.quizSubtitle}>{lessonSubtitle}</Text>
          </View>
          <View style={styles.quizHearts}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Text key={index} style={[styles.quizHeart, index >= heartsLeft && styles.quizHeartEmpty]}>
                {index < heartsLeft ? '❤️' : '🖤'}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.quizProgressBar}>
          <View style={[styles.quizProgressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.quizCard}>
        {isCooldownLocked ? (
            <>
              <Text style={styles.quizQuestionLabel}>Kilitli</Text>
              <Text style={styles.quizQuestionText}>Canın bitti.</Text>
              <Text style={styles.quizCooldownText}>Yenilenme için kalan süre: {timeLeftLabel}</Text>

              <View style={styles.quizOptions}>
                <TouchableOpacity
                  style={[styles.quizOptionButton, styles.quizOptionButtonAccent]}
                  activeOpacity={0.9}
                  onPress={() => onRestoreHearts && onRestoreHearts('ad')}
                >
                  <Text style={[styles.quizOptionText, styles.quizOptionTextEmphasis]}>Reklam İzle ve Yenile</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.quizQuestionLabel}>Soru {questionIndex + 1}</Text>
              
              {/* EĞER SORUDA GRAFİK VERİSİ VARSA, CANLI ÇİZ! */}
              {questions?.[questionIndex]?.chartData && (
                <PriceChart 
                  candles={questions[questionIndex].chartData} 
                  isQuizMode={true} 
                />
              )}

              <Text style={styles.quizQuestionText}>{questions?.[questionIndex]?.text}</Text>

              <View style={styles.quizOptions}>
                {(questions?.[questionIndex]?.options ?? []).map((option, index) => {
                  const isSelected = lastAnswerIndex === index;
                  const correctSelected = isSelected && lastAnswerCorrect === true;
                  const wrongSelected = isSelected && lastAnswerCorrect === false;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.quizOptionButton,
                        correctSelected && styles.quizOptionButtonCorrect,
                        wrongSelected && styles.quizOptionButtonWrong,
                      ]}
                      activeOpacity={0.9}
                      onPress={() => handleAnswer(index)}
                    >
                      <Text style={[styles.quizOptionText, correctSelected && styles.quizOptionTextEmphasis]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {!!feedback && <Text style={styles.quizFeedback}>{feedback}</Text>}

              {isCompleted && (
                <View style={styles.quizSuccessBanner}>
                  <Text style={styles.quizSuccessText}>Dersi Tamamladın! {successXpLabel}</Text>
                </View>
              )}

              {isFailed && (
                <View style={styles.quizFailedBanner}>
                  <Text style={styles.quizFailedText}>Canın Bitti! Yenilenmesi için bekle veya Reklam İzle.</Text>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.quizFooter}>
          <TouchableOpacity style={styles.quizFooterButton} onPress={onRequestClose}>
            <Text style={styles.quizFooterButtonText}>{isCompleted ? 'Dersi Kapat' : 'Dersi Sonlandır'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  quizContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  quizSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  quizHearts: {
    flexDirection: 'row',
    gap: 4,
  },
  quizHeart: {
    fontSize: 18,
  },
  quizHeartEmpty: {
    opacity: 0.5,
  },
  quizProgressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.cardSoft,
    overflow: 'hidden',
    marginBottom: 12,
  },
  quizProgressFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
  },
  quizCard: {
    flex: 1,
    marginTop: 4,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: 16,
  },
  quizQuestionLabel: {
    fontSize: 12,
    color: theme.colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  quizQuestionText: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  quizCooldownText: {
    marginTop: 10,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  quizOptions: {
    marginTop: 14,
    gap: 8,
  },
  quizOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.cardSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  quizOptionButtonAccent: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
  },
  quizOptionButtonCorrect: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#22c55e',
  },
  quizOptionButtonWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    borderColor: theme.colors.danger,
  },
  quizOptionText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  quizOptionTextEmphasis: {
    fontWeight: '600',
  },
  quizFeedback: {
    marginTop: 14,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  quizSuccessBanner: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  quizSuccessText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#22c55e',
    textAlign: 'center',
  },
  quizFailedBanner: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.cardSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  quizFailedText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  quizFooter: {
    marginTop: 12,
  },
  quizFooterButton: {
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizFooterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

