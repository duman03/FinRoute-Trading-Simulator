import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';
import { LessonQuizModal } from '../components/LessonQuizModal';

export function AcademyScreen({
  portfolio,
  academyProgress,
  onCompleteLesson1,
  onCompleteLesson2,
  heartsState,
  onConsumeHeart,
  onRestoreHearts,
  onCompleteLesson3,
}) {
  const level = portfolio?.level ?? 1;

  const lesson2Unlocked = academyProgress?.lesson2Unlocked;
  const lesson3Unlocked = academyProgress?.lesson3Unlocked;

  const steps = [
    {
      id: 1,
      title: 'Mumların Sırrı',
      description: 'Mum grafiklerini ve fitilleri okumayı öğren.',
      status: 'active',
    },
    {
      id: 2,
      title: 'Destek ve Direnç',
      description: 'Fiyatın dönüm noktalarını keşfet.',
      status: lesson2Unlocked ? 'active' : 'locked',
    },
    {
      id: 3,
      title: 'Formasyon Avcısı',
      description: 'Doji ve Yutan Boğa gibi formasyonları tanı.',
      status: lesson3Unlocked ? 'active' : 'locked',
    },
  ];

  const heartsLeft = heartsState?.count ?? 5;
  const heartsDepletedAtMs = heartsState?.depletedAtMs ?? null;

  const lesson1Questions = [
    {
      id: 1,
      text: 'Ekranda gördüğün bu 3 mumluk hareket ne anlama gelir?',
      // SADECE VERİ GİRİYORUZ, GERİSİNİ SİSTEM ÇİZECEK
      chartData: [
        { open: 10, high: 15, low: 8, close: 14 }, // Yeşil mum
        { open: 14, high: 20, low: 12, close: 18 }, // Yeşil mum
        { open: 18, high: 25, low: 17, close: 24 }, // Yeşil mum
      ],
      options: ['Güçlü Düşüş', 'Güçlü Yükseliş Trendi', 'Kararsız Piyasa'],
      correctIndex: 1,
    },
    {
      id: 2,
      text: 'Ortadaki mumun adı nedir? (Açılış ve kapanışı neredeyse aynı)',
      chartData: [
        { open: 100, high: 110, low: 90, close: 95 }, // Kırmızı
        { open: 95, high: 105, low: 85, close: 95 },  // DOJI (Kararsız)
        { open: 95, high: 100, low: 80, close: 85 },  // Kırmızı
      ],
      options: ['Yutan Ayı', 'Doji (Kararsızlık)', 'Çekiç'],
      correctIndex: 1,
    },
    {
      id: 3,
      text: 'Kapanış fiyatı açılış fiyatından düşükse mum ne renk olur?',
      // Bunda veri yok, sadece metin sorusu olarak kalsın
      options: ['Kırmızı', 'Yeşil', 'Sarı'],
      correctIndex: 0,
    },
  ];

  const lesson2Questions = [
    {
      id: 1,
      text: 'Fiyatın düşerken çarpıp geri sektiği (tutunduğu) alt seviyeye ne denir?',
      options: ['Destek', 'Direnç', 'Trend'],
      correctIndex: 0,
    },
    {
      id: 2,
      text: 'Fiyatın yükselirken aşmakta zorlandığı tepe noktasına ne ad verilir?',
      options: ['Destek', 'Direnç', 'Hacim'],
      correctIndex: 1,
    },
    {
      id: 3,
      text: 'Bir direnç seviyesi kırıldığında genellikle neye dönüşür?',
      options: ['Desteğe', 'Boşluğa', 'Fitile'],
      correctIndex: 0,
    },
  ];
  const lesson3Questions = [
    {
      id: 1,
      text: 'Açılış ve kapanış fiyatının neredeyse aynı olduğu, piyasadaki kararsızlığı ifade eden mum hangisidir?',
      options: ['Doji', 'Yutan Boğa', 'Çekiç'],
      correctIndex: 0,
    },
    {
      id: 2,
      text: 'Önceki kırmızı mumu tamamen içine alan (kapsayan) güçlü yeşil muma ne ad verilir?',
      options: ['Doji', 'Yutan Boğa', 'Kayan Yıldız'],
      correctIndex: 1,
    },
    {
      id: 3,
      text: 'Yutan Boğa (Bullish Engulfing) formasyonu görüldüğünde piyasanın ne yapması beklenir?',
      options: ['Düşmesi', 'Yatay kalması', 'Yükselmesi'],
      correctIndex: 2,
    },
  ];
  const [activeLessonId, setActiveLessonId] = useState(null);

  const openLesson = (lessonId) => {
    setActiveLessonId(lessonId);
  };

  const closeLesson = () => {
    setActiveLessonId(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Akademi Haritası</Text>
          <Text style={styles.subtitle}>Finansın Duolingo'suna hoş geldin.</Text>
          <Text style={styles.levelHint}>Şu an Seviye {level}. Öğrenmeye devam et!</Text>
        </View>
        <View style={styles.heartsContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Text key={index} style={[styles.heart, index >= heartsLeft && styles.heartEmpty]}>
              {index < heartsLeft ? '❤️' : '🖤'}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.pathContainer}>
        {steps.map((step, index) => {
          const isActive = step.status === 'active';
          const isLocked = step.status === 'locked';
          const isLast = index === steps.length - 1;
          const isPressable = isActive; // Tüm aktif dersler tıklanabilir olsun

          return (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View
                  style={[
                    styles.stepNode,
                    isActive && styles.stepNodeActive,
                    isLocked && styles.stepNodeLocked,
                  ]}
                >
                  <Text style={[styles.stepNodeText, isLocked && styles.stepNodeTextLocked]}>
                    {step.id}
                  </Text>
                </View>
                {!isLast && <View style={styles.stepConnector} />}
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!isPressable}
                style={[styles.stepCard, !isPressable && styles.stepCardDisabled]}
                onPress={() => openLesson(step.id)}
              >
                <Text
                  style={[
                    styles.stepTitle,
                    isLocked && styles.stepTitleLocked,
                    isActive && styles.stepTitleActive,
                  ]}
                >
                  {step.title}
                </Text>
                <Text style={[styles.stepDescription, isLocked && styles.stepDescriptionLocked]}>
                  {step.description}
                </Text>
                {isActive && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Aktif Ders</Text>
                  </View>
                )}
                {isLocked && (
                  <View style={styles.lockedPill}>
                    <Text style={styles.lockedPillText}>Kilidi Yakında Açılacak</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <LessonQuizModal
        visible={activeLessonId === 1}
        onRequestClose={closeLesson}
        lessonTitle="Mumların Sırrı"
        lessonSubtitle="Mini Test: Temel mum bilgisi"
        questions={lesson1Questions}
        heartsLeft={heartsLeft}
        heartsDepletedAtMs={heartsDepletedAtMs}
        onConsumeHeart={onConsumeHeart}
        onRestoreHearts={onRestoreHearts}
        onComplete={onCompleteLesson1}
        successXpLabel="+100 XP"
      />

      <LessonQuizModal
        visible={activeLessonId === 2}
        onRequestClose={closeLesson}
        lessonTitle="Destek ve Direnç"
        lessonSubtitle="Mini Test: Seviye çizgileri"
        questions={lesson2Questions}
        heartsLeft={heartsLeft}
        heartsDepletedAtMs={heartsDepletedAtMs}
        onConsumeHeart={onConsumeHeart}
        onRestoreHearts={onRestoreHearts}
        onComplete={onCompleteLesson2}
        successXpLabel="+150 XP"
      />
      <LessonQuizModal
        visible={activeLessonId === 3}
        onRequestClose={closeLesson}
        lessonTitle="Formasyon Avcısı"
        lessonSubtitle="Final Testi: Doji ve Yutan Boğa"
        questions={lesson3Questions}
        heartsLeft={heartsLeft}
        heartsDepletedAtMs={heartsDepletedAtMs}
        onConsumeHeart={onConsumeHeart}
        onRestoreHearts={onRestoreHearts}
        onComplete={onCompleteLesson3} // App.js'deki mezuniyet fonksiyonu
        successXpLabel="+500 XP"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  levelHint: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textSoft,
  },
  heartsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  heart: {
    fontSize: 18,
  },
  heartEmpty: {
    opacity: 0.6,
  },
  pathContainer: {
    marginTop: 8,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  stepLeft: {
    alignItems: 'center',
    width: 40,
  },
  stepNode: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: theme.colors.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.cardSoft,
  },
  stepNodeActive: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
  },
  stepNodeLocked: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSubtle,
  },
  stepNodeText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  stepNodeTextLocked: {
    color: theme.colors.textSoft,
  },
  stepConnector: {
    width: 2,
    flex: 1,
    marginTop: 4,
    backgroundColor: theme.colors.borderSubtle,
  },
  stepCard: {
    flex: 1,
    marginLeft: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  stepCardDisabled: {
    opacity: 0.7,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  stepTitleActive: {
    color: theme.colors.accent,
  },
  stepTitleLocked: {
    color: theme.colors.textSoft,
  },
  stepDescription: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  stepDescriptionLocked: {
    color: theme.colors.textSoft,
  },
  activePill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22c55e',
  },
  lockedPill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  lockedPillText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSoft,
  },
});

