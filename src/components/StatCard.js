import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

export function StatCard({ label, value, accent = 'none' }) {
  const accentStyle =
    accent === 'primary'
      ? styles.accentPrimary
      : accent === 'secondary'
      ? styles.accentSecondary
      : accent === 'danger'
      ? styles.accentDanger
      : null;

  return (
    <View style={styles.container}>
      <View style={[styles.accentPill, accentStyle]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  accentPill: {
    width: 26,
    height: 4,
    borderRadius: 999,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  accentPrimary: {
    backgroundColor: theme.colors.accent,
  },
  accentSecondary: {
    backgroundColor: theme.colors.accentSecondary,
  },
  accentDanger: {
    backgroundColor: theme.colors.danger,
  },
  label: {
    fontSize: 11,
    color: theme.colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  value: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

