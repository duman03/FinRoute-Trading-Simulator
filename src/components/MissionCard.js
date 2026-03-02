import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

export function MissionCard({ title, description, completed }) {
  return (
    <View style={[styles.container, completed && styles.containerCompleted]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.statusPill, completed && styles.statusPillCompleted]}>
          <Text style={[styles.statusText, completed && styles.statusTextCompleted]}>{completed ? 'Tamamlandı' : 'Aktif'}</Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: theme.colors.cardSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  containerCompleted: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  statusPillCompleted: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  statusText: {
    fontSize: 10,
    color: theme.colors.textSoft,
  },
  statusTextCompleted: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
});

