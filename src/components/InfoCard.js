import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

export function InfoCard({ title = 'Teknik Analiz İpucu', tip, highlight }) {
  return (
    <View style={styles.container}>
      {highlight ? (
        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>{highlight}</Text>
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.tip}>{tip}</Text>
      <Text style={styles.helper}>Bu bir eğitim simülasyonudur, gerçek yatırım tavsiyesi değildir.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.cardSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  highlightBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    borderWidth: 1,
    borderColor: '#facc15',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 12,
    color: '#fde68a',
    fontWeight: '700',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tip: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  helper: {
    marginTop: 10,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
});

