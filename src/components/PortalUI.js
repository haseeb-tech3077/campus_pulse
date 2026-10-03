import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export const colors = {
  navy: '#355f80', dark: '#29383d', indigo: '#4255b8', blue: '#339fe7',
  paper: '#f0f2f8', white: '#ffffff', ink: '#172b3b', muted: '#718092',
  line: '#d9deea', yellow: '#ffc400', green: '#159b84', red: '#e84f68',
  softBlue: '#e8f5ff', softYellow: '#fff7d6', softGreen: '#e4f6ef', softRed: '#fff0f1',
};

export function PageTitle({ title, subtitle }) {
  const { width } = useWindowDimensions();
  return <View style={[styles.pageTitle, width < 560 && styles.pageTitleCompact]}><Text style={styles.eyebrow}>STUDENT PORTAL</Text><Text style={[styles.title, width < 560 && styles.titleCompact]}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
}

export function Panel({ title, children, style }) {
  const { width } = useWindowDimensions();
  return <View style={[styles.panel, style]}><View style={[styles.panelTitle, width < 560 && styles.panelTitleCompact]}><Text style={styles.panelTitleText}>{title}</Text></View><View style={[styles.panelBody, width < 560 && styles.panelBodyCompact]}>{children}</View></View>;
}

export function ActionButton({ title, onPress, secondary = false, disabled = false }) {
  return <Pressable onPress={onPress} disabled={disabled} style={[styles.button, secondary && styles.secondaryButton, disabled && styles.disabledButton]}><Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text></Pressable>;
}

export function StatCard({ label, value, detail }) {
  return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text>{detail ? <Text style={styles.statDetail}>{detail}</Text> : null}</View>;
}

export function StatusTag({ children, good = false }) {
  return <View style={[styles.tag, good ? styles.goodTag : styles.neutralTag]}><Text style={[styles.tagText, good && styles.goodTagText]}>{children}</Text></View>;
}

export function DataRow({ label, value }) {
  return <View style={styles.dataRow}><Text style={styles.dataLabel}>{label}</Text><Text style={styles.dataValue}>{value}</Text></View>;
}

export function TableHeader({ columns }) {
  const { width } = useWindowDimensions();
  return <View style={[styles.tableHeader, width < 560 && styles.tableHeaderCompact]}>{columns.map((column, index) => <Text key={`${column}-${index}`} style={[styles.tableHeaderText, width < 560 && styles.tableHeaderTextCompact, index === 0 && styles.firstColumn]}>{column}</Text>)}</View>;
}

export function TableLine({ values, highlightLast = false }) {
  const { width } = useWindowDimensions();
  return <View style={[styles.tableLine, width < 560 && styles.tableLineCompact]}>{values.map((value, index) => <Text key={`${index}-${value}`} style={[styles.tableCell, width < 560 && styles.tableCellCompact, index === 0 && styles.firstColumn, highlightLast && index === values.length - 1 && styles.highlightCell]}>{String(value)}</Text>)}</View>;
}

const styles = StyleSheet.create({
  pageTitle: { borderBottomWidth: 2, borderBottomColor: colors.indigo, paddingBottom: 14, marginBottom: 18 },
  pageTitleCompact: { paddingBottom: 10, marginBottom: 12 },
  eyebrow: { color: colors.indigo, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 24, fontWeight: '700', marginTop: 4 },
  titleCompact: { fontSize: 21 },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  panel: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.indigo, marginBottom: 16 },
  panelTitle: { backgroundColor: colors.indigo, minHeight: 45, justifyContent: 'center', paddingHorizontal: 15 },
  panelTitleCompact: { minHeight: 42, paddingHorizontal: 11 },
  panelTitleText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  panelBody: { padding: 15 },
  panelBodyCompact: { padding: 10 },
  button: { backgroundColor: colors.indigo, paddingHorizontal: 14, paddingVertical: 11, alignItems: 'center', justifyContent: 'center', minHeight: 40 },
  secondaryButton: { backgroundColor: colors.white, borderColor: colors.indigo, borderWidth: 1 },
  buttonText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  secondaryButtonText: { color: colors.indigo },
  disabledButton: { opacity: 0.45 },
  stat: { flex: 1, minWidth: 120, padding: 13, borderTopWidth: 3, borderTopColor: colors.blue, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  statLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  statValue: { color: colors.ink, fontSize: 23, fontWeight: '700', marginTop: 6 },
  statDetail: { color: colors.muted, fontSize: 10, marginTop: 3 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4 },
  neutralTag: { backgroundColor: colors.softBlue },
  goodTag: { backgroundColor: colors.softGreen },
  tagText: { color: colors.indigo, fontSize: 10, fontWeight: '700' },
  goodTagText: { color: colors.green },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.line },
  dataLabel: { color: colors.muted, fontSize: 11, flex: 1 },
  dataValue: { color: colors.ink, fontSize: 11, fontWeight: '600', textAlign: 'right', flex: 1 },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.blue, paddingHorizontal: 9, paddingVertical: 10 },
  tableHeaderCompact: { paddingHorizontal: 4, paddingVertical: 8 },
  tableHeaderText: { flex: 1, color: colors.white, fontWeight: '700', fontSize: 10, textAlign: 'center' },
  tableHeaderTextCompact: { fontSize: 8, lineHeight: 11 },
  firstColumn: { textAlign: 'left' },
  tableLine: { flexDirection: 'row', paddingHorizontal: 9, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.white },
  tableLineCompact: { paddingHorizontal: 4, paddingVertical: 8 },
  tableCell: { flex: 1, color: colors.ink, fontSize: 10, textAlign: 'center' },
  tableCellCompact: { fontSize: 9, lineHeight: 13 },
  highlightCell: { color: colors.red, fontWeight: '700' },
});
