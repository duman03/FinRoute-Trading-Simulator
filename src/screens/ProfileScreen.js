import React from 'react';
import { DashboardScreen } from './DashboardScreen';

export function ProfileScreen({ portfolio, onReset }) {
  return <DashboardScreen portfolio={portfolio} onReset={onReset} />;
}

