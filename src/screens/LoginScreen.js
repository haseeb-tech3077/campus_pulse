import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { STUDENTS } from '../data/flexData';
import { ActionButton, colors } from '../components/PortalUI';

export default function LoginScreen({ onLogin }) {
  const { width } = useWindowDimensions();
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submit = () => {
    if (!rollNo.trim() || !password) {
      setMessage('Enter both your roll number and password.');
      return;
    }
    if (rollNo.trim().toLowerCase() === 'admin' && password === 'admin') {
      setMessage('');
      onLogin(null, 'admin');
      return;
    }
    const student = STUDENTS.find(account => account.rollNo.toLowerCase() === rollNo.trim().toLowerCase() && account.password === password);
    if (!student) {
      setMessage('Roll number or password is incorrect.');
      return;
    }
    setMessage('');
    onLogin(student);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.rootContent, width < 760 && styles.rootContentMobile]} keyboardShouldPersistTaps="handled">
      <View style={[styles.card, width < 760 && styles.cardMobile, width >= 760 && styles.wideCard]}>
        {width < 760 ? <View style={styles.mobileHero}>
          <Image source={require('../../assets/flex-logo.png')} style={styles.mobileLogo} resizeMode="contain" accessibilityLabel="Flex Academic Portal logo" />
          <Text style={styles.mobileWelcome}>Welcome to Flex</Text>
          <Text style={styles.mobileSubtitle}>Your student portal, all in one place</Text>
        </View> : null}
        <View style={[styles.formSide, width < 420 && styles.formSideCompact, width >= 760 && styles.wideFormSide]}>
          {width >= 760 ? <><Image source={require('../../assets/flex-logo.png')} style={styles.logoImage} resizeMode="contain" accessibilityLabel="Flex Academic Portal logo" /><Text style={styles.caption}>ACADEMIC PORTAL</Text></> : null}
          <Text style={[styles.heading, width < 420 && styles.headingCompact]}>Sign in</Text>
          <Text style={styles.fieldLabel}>Username or roll number</Text>
          <TextInput value={rollNo} onChangeText={setRollNo} placeholder="Enter username or roll number" autoCapitalize="none" style={styles.input} returnKeyType="next" accessibilityLabel="Username or roll number" />
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={styles.input} onSubmitEditing={submit} accessibilityLabel="Password" />
          {!!message && <Text style={styles.error}>{message}</Text>}
          <ActionButton title="Sign in" onPress={submit} />
          <Text style={styles.disclaimer}>Sign in with your student roll number or administrator username.</Text>
        </View>
        {width >= 760 ? (
          <View style={styles.welcomeSide}>
            <View style={styles.shelf}><View style={styles.book} /><View style={[styles.book, styles.bookBlue]} /><View style={[styles.book, styles.bookGold]} /><View style={[styles.book, styles.bookTeal]} /></View>
            <Text style={styles.welcomeTitle}>Welcome to Flex-Student</Text>
            <Text style={styles.welcomeCopy}>Attendance, course marks, registration and your semester record—all together.</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  rootContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 18 },
  rootContentMobile: { justifyContent: 'flex-start', padding: 0 },
  card: { width: '100%', maxWidth: 1020, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  cardMobile: { flex: 1, width: '100%', maxWidth: 480, borderWidth: 0, backgroundColor: colors.white },
  wideCard: { flexDirection: 'row', minHeight: 650 },
  formSide: { flex: 1, padding: 28, maxWidth: 520, alignSelf: 'center', width: '100%' },
  formSideCompact: { padding: 22, paddingTop: 24, maxWidth: 480 },
  wideFormSide: { width: 'auto', alignSelf: 'center' },
  mobileHero: { minHeight: 225, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 22, paddingBottom: 34, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  mobileLogo: { width: 205, height: 78, backgroundColor: colors.white, paddingHorizontal: 8 },
  mobileWelcome: { color: colors.white, fontSize: 21, fontWeight: '700', marginTop: 18 },
  mobileSubtitle: { color: '#dce8f0', fontSize: 12, textAlign: 'center', marginTop: 5 },
  logoImage: { width: 250, height: 96, maxWidth: '100%', alignSelf: 'center' },
  caption: { color: colors.muted, fontSize: 9, letterSpacing: 1.2, marginTop: 3 },
  heading: { color: colors.ink, fontSize: 25, fontWeight: '700', marginTop: 26, marginBottom: 14 },
  headingCompact: { marginTop: 0, marginBottom: 12, fontSize: 24 },
  fieldLabel: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: { minHeight: 45, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, fontSize: 13, color: colors.ink, marginBottom: 4, backgroundColor: '#fbfcfe' },
  error: { color: colors.red, fontSize: 12, marginBottom: 10, marginTop: 5 },
  disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 16 },
  welcomeSide: { flex: 1.15, minHeight: 430, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', padding: 35 },
  shelf: { height: 200, width: '100%', maxWidth: 390, backgroundColor: '#26455b', borderBottomWidth: 12, borderBottomColor: '#1e3648', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 12, paddingHorizontal: 18 },
  book: { width: 58, height: 150, backgroundColor: '#e7ebf2', borderTopWidth: 7, borderTopColor: colors.blue },
  bookBlue: { height: 175, backgroundColor: '#cfdeec', borderTopColor: colors.yellow },
  bookGold: { height: 135, backgroundColor: '#f4e6bb', borderTopColor: '#d48b54' },
  bookTeal: { height: 160, backgroundColor: '#cce3de', borderTopColor: colors.green },
  welcomeTitle: { color: colors.white, fontSize: 28, textAlign: 'center', fontWeight: '600', marginTop: 28 },
  welcomeCopy: { color: '#dce8f0', fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 360, marginTop: 12 },
});
