import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
  Modal,
  Alert,
  Dimensions,
  Linking,
  Animated,
  Easing,
  Vibration,
  Image
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './lib/supabase';
import { StatusBar } from 'expo-status-bar';
import AuthScreen from './components/AuthScreen';
import { Analytics } from '@vercel/analytics/react';

// Register Service Worker for PWA
if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}


// --- Theme Constants (Forest Theme) ---
const COLORS = {
  BG_DARK: '#0F2822',       // Deep Forest Green
  BG_CARD: '#1A382F',       // Lighter Green Surface
  ACCENT_LIME: '#D4EE9F',   // Primary Action
  ACCENT_ORANGE: '#F97316', // Alerts/Highlights
  TEXT_WHITE: '#F5F5F5',
  TEXT_SEC: '#AABEB8',      // Muted Green-Grey
  TEXT_DARK: '#0F2822',     // Text on Lime
  MIC_BG: '#D4EE9F',
  MIC_ICON: '#1A382F'
};

// --- Localization ---
const DICTIONARY = {
  cz: {
    hello: 'Ahoj',
    how_feel: 'Jak se dnes cítíš?',
    recommendation: 'Tip pro lepší řeč',
    start_breath: 'Uklidni svou mysl před mluvením',
    start_ex: 'Začít cvičení',
    days_row: 'Dní cvičení',
    ex_week: 'Relace týdně',
    practice_title: 'Terapie řeči',
    diff_text: 'Jiné cvičení',
    press_record: 'Stiskni pro analýzu',
    no_rec: 'Zatím žádné nahrávky',
    tips: 'Tipy logopeda',
    relax_title: 'Dechové techniky',
    relax_sub: 'Získej kontrolu nad svým dechem',
    instructions: 'Instrukce',
    home: 'Domů',
    relax: 'Relax',
    practice: 'Terapie',
    settings: 'Nastavení',
    mic_perm: 'Povolení mikrofonu nutné',
    login_api: 'Zadej API Klíč (OpenAI)',
    // Landing
    hero_title: 'Mluvte zase',
    hero_title_hl: 'Sebevědomě',
    hero_sub: 'Překonejte koktání a úzkost s osobním AI logopedem.',
    start_journey: 'Začít terapii →',
    why_us: 'Proč Speekly?',
    // Scenarios & Practice
    read_mode: '📖 Čtení a Analýza',
    chat_mode: '💬 Hraní Rolí (Chat)',
    scen_job: 'Pohovor',
    scen_coffee: 'Objednávka',
    scen_social: 'Small Talk',
    scen_custom: 'Vlastní',
    custom_placeholder: 'Např. Žádost o zvýšení platu...',
    custom_desc: 'Popiš situaci výše a stiskni mikrofon!',
    // Relax
    rel_diaphragm: 'Brániční dýchání',
    rel_pmr: 'Uvolnění svalů',
    rel_jaw: 'Uvolnění čelisti',
    rel_viz: 'Vizualizace',
    rel_vocal: 'Hlasová rozcvička', // New
    add_custom: 'Přidat vlastní metodu',
    tmj_warning: '⚠️ Pozor: Buďte opatrní, pokud máte problémy s čelistním kloubem (TMJ).', // New
    disclaimer: 'Tato aplikace nenahrazuje klinickou péči. Slouží k tréninku, ne k léčbě.', // New
    // Checkout
    checkout_title: 'Bezpečná platba',
    back_home: 'Zpět domů',
    order_sum: 'Shrnutí objednávky',
    plan_name: 'Doživotní Plán',
    one_time: 'Jednorázová platba. Žádné poplatky.',
    create_acc: 'Vytvořit účet',
    pay_method: 'Platební metoda',
    pay_btn: 'Zaplatit $100 přes Stripe',
    redirect_note: 'Budete přesměrováni na bránu Stripe',
  },
  en: {
    hello: 'Hello',
    how_feel: 'How is your speech today?',
    recommendation: 'Today\'s Activity',
    start_breath: 'Calm your mind before speaking',
    start_ex: 'Start Exercise',
    days_row: 'Day Streak',
    ex_week: 'Sessions',
    practice_title: 'Speech Therapy',
    diff_text: 'Next Exercise',
    press_record: 'Press to Analyze',
    no_rec: 'No recordings yet',
    tips: 'Therapist Tips',
    relax_title: 'Breathing Techniques',
    relax_sub: 'Gain control over your breath',
    instructions: 'Instructions',
    home: 'Home',
    relax: 'Relax',
    practice: 'Therapy',
    settings: 'Settings',
    mic_perm: 'Microphone permission required',
    login_api: 'Enter AI API Key',
    // Landing
    hero_title: 'Speak with',
    hero_title_hl: 'Confidence',
    hero_sub: 'Overcome stuttering and anxiety with your personal AI Speech Therapist.',
    start_journey: 'Start Therapy Journey →',
    why_us: 'Why Speekly?',
    // Scenarios & Practice
    read_mode: '📖 Read & Analyze',
    chat_mode: '💬 Roleplay Chat',
    scen_job: 'Job Interview',
    scen_coffee: 'Ordering Coffee',
    scen_social: 'Small Talk',
    scen_custom: 'Custom Topic',
    custom_placeholder: 'e.g. Asking my boss for a raise...',
    custom_desc: 'Type a description above, then press the mic to start!',
    // Relax
    rel_diaphragm: 'Deep Diaphragm',
    rel_pmr: 'Muscle Release',
    rel_jaw: 'Jaw Loosening',
    rel_viz: 'Visualization',
    rel_vocal: 'Vocal Warm-up', // New
    add_custom: 'Add Your Own Method',
    tmj_warning: '⚠️ Caution: Be gentle if you have TMJ (Jaw Joint) issues.', // New
    disclaimer: 'This app is not a replacement for clinical therapy. It is a training tool.', // New
    // Checkout
    checkout_title: 'Secure Checkout',
    back_home: 'Back to Home',
    order_sum: 'Order Summary',
    plan_name: 'Lifetime Therapy Plan',
    one_time: 'Onetime payment. No recurring fees.',
    create_acc: 'Create Account',
    pay_method: 'Payment Method',
    pay_btn: 'Pay $100 with Stripe',
    redirect_note: 'You will be redirected to secure Stripe Checkout',
  }
};

const TIPS_DATA = [
  'Speak slowly and intentionally',
  'It is okay to pause and breathe',
  'Focus on the flow, not perfection',
  'Soft contact on consonants',
  'Visualize successful speaking'
];

const RELAX_TECHNIQUES = [
  {
    id: 1, title: 'Deep Diaphragm', time: 5, timeStr: '5 minutes', type: 'deep',
    instructions: [
      "Place one hand on your chest, one on your belly.",
      "Breathe in deeply through your nose.",
      "Feel only your belly rise, not your chest.",
      "Exhale slowly through pursed lips."
    ]
  },
  {
    id: 2, title: 'Muscle Release (PMR)', time: 10, timeStr: '10 minutes', type: 'body',
    instructions: [
      "Tense your toes for 5 seconds.",
      "Release and feel the tension leave.",
      "Move to your thighs, stomach, then hands.",
      "Finally tense and release your face muscles."
    ]
  },
  {
    id: 3, title: 'Jaw & Face Loosening', time: 3, timeStr: '3 minutes', type: 'physical',
    instructions: [
      "Gently chew with your mouth closed (fake chewing).",
      "Open your jaw wide, then relax.",
      "Massage the masseter muscles (cheeks).",
      "Flutter your lips (brrr sound) to relax them."
    ]
  },
  {
    id: 4, title: 'Confidence Visualization', time: 5, timeStr: '5 minutes', type: 'mental',
    instructions: [
      "Close your eyes. Picture the room/stage.",
      "See yourself smiling and standing tall.",
      "Visualize words flowing smoothly.",
      "Feel the audience nodding in agreement."
    ]
  }
];

const PRACTICE_SENTENCES = [
  "Peter Piper picked a peck of pickled peppers.",
  "She sells seashells by the seashore.",
  "I am calm, confident, and clear when I speak.",
  "My voice is strong and my words flow freely.",
  "Around the rugged rocks the ragged rascal ran."
];

const CONVERSATION_SCENARIOS = [
  { id: 'job', title: 'Job Interview', icon: '💼', prompt: "You are a professional HR manager interviewing the user for a job. Ask standard interview questions. Keep replies short." },
  { id: 'coffee', title: 'Ordering Coffee', icon: '☕', prompt: "You are a busy barista at a coffee shop. Ask the user what they want to order. Be polite but quick." },
  { id: 'social', title: 'Small Talk', icon: '👋', prompt: "You are a friendly neighbor meeting the user at the mailbox. Make casual small talk about the weather or weekend." },
  { id: 'custom', title: 'Custom Topic', icon: '✨', prompt: "You are a helpful conversation partner. Discuss whatever topic the user brings up." }
];

// --- Components ---

// Mobile Container for Web (Responsive)
const MobileContainer = ({ children, fullWidth = false }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={[styles.mobileWrapper, fullWidth && styles.webWrapperFull]}>
          {children}
        </View>
      </View>
    );
  }
  return <View style={{ flex: 1, backgroundColor: COLORS.BG_DARK }}>{children}</View>;
};

const LandingScreen = ({ t, onGetStarted }) => {
  const { width } = Dimensions.get('window');
  const isDesktop = width > 800;

  const gridStyle = isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 } : {};
  const cardStyle = isDesktop ? { width: '30%', minWidth: 300, marginBottom: 0 } : { width: '100%', marginBottom: 16 };
  const heroStyle = isDesktop ? { maxWidth: 800, alignSelf: 'center' } : {};

  return (
    <ScrollView style={styles.screenScroll}>

      <View style={{ maxWidth: 1200, alignSelf: 'center', width: '100%' }}>



        {/* 1. Hero Section */}
        <View style={[styles.heroSection, heroStyle]}>
          <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>✨ 1st AI Speech Therapist 🚀</Text></View>
          <Text style={[styles.heroTitle, isDesktop && { fontSize: 64, lineHeight: 72 }]}>{t('hero_title')} <Text style={{ color: COLORS.ACCENT_LIME }}>{t('hero_title_hl')}</Text></Text>
          <Text style={[styles.heroSub, isDesktop && { fontSize: 20 }]}>{t('hero_sub')}</Text>

          <TouchableOpacity style={[styles.heroButton, isDesktop && { width: 'auto', paddingHorizontal: 60 }]} onPress={onGetStarted}>
            <Text style={styles.heroButtonText}>{t('start_journey')}</Text>
          </TouchableOpacity>

          <Text style={styles.heroNote}>Helping 10,000+ people find their voice</Text>
        </View>

        {/* 2. Benefits Grid */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{t('why_us')}</Text>
          <View style={gridStyle}>
            {/* SOS Panic Button - FEATURED */}
            <View style={[styles.benefitCard, cardStyle, {
              borderColor: COLORS.ACCENT_ORANGE,
              borderWidth: 2,
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              transform: [{ scale: 1 }]
            }]}>
              <View style={{ position: 'absolute', top: -12, right: 16, backgroundColor: COLORS.ACCENT_ORANGE, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>⭐ MOST POPULAR</Text>
              </View>
              <Text style={styles.benefitIcon}>🚨</Text>
              <Text style={[styles.benefitTitle, { color: COLORS.ACCENT_ORANGE, fontSize: 22 }]}>SOS Panic Button</Text>
              <Text style={styles.benefitDesc}>Presentation in 5 minutes? Exam anxiety? Get immediate calm with our emergency breathing guide. Works in seconds!</Text>
            </View>
            <View style={[styles.benefitCard, cardStyle]}>
              <Text style={styles.benefitIcon}>🛡️</Text>
              <Text style={styles.benefitTitle}>Safe Space</Text>
              <Text style={styles.benefitDesc}>No judgment, no pressure. Practice at your own pace without the fear of public speaking.</Text>
            </View>
            <View style={[styles.benefitCard, cardStyle]}>
              <Text style={styles.benefitIcon}>🌬️</Text>
              <Text style={styles.benefitTitle}>Anxiety Control</Text>
              <Text style={styles.benefitDesc}>Integrated breathing and relaxation techniques to calm your nerves before you speak.</Text>
            </View>
          </View>
        </View>
        {/* 3. Process Section */}
        <View style={styles.processSection}>
          <Text style={styles.sectionHeader}>How It Works</Text>
          <View style={gridStyle}>
            <View style={[styles.stepRow, cardStyle, isDesktop && { flexDirection: 'column', alignItems: 'center', textAlign: 'center' }]}>
              <View style={[styles.stepNumber, isDesktop && { marginBottom: 16, marginRight: 0 }]}><Text style={styles.stepNumText}>1</Text></View>
              <View style={{ flex: 1 }}><Text style={[styles.stepTitle, isDesktop && { textAlign: 'center' }]}>Warm Up</Text><Text style={[styles.stepDesc, isDesktop && { textAlign: 'center' }]}>Start with a 1-minute guided breathing exercise.</Text></View>
            </View>
            <View style={[styles.stepRow, cardStyle, isDesktop && { flexDirection: 'column', alignItems: 'center', textAlign: 'center' }]}>
              <View style={[styles.stepNumber, isDesktop && { marginBottom: 16, marginRight: 0 }]}><Text style={styles.stepNumText}>2</Text></View>
              <View style={{ flex: 1 }}><Text style={[styles.stepTitle, isDesktop && { textAlign: 'center' }]}>Practice Speech</Text><Text style={[styles.stepDesc, isDesktop && { textAlign: 'center' }]}>Read specialized texts or talk freely to the AI.</Text></View>
            </View>
            <View style={[styles.stepRow, cardStyle, isDesktop && { flexDirection: 'column', alignItems: 'center', textAlign: 'center' }]}>
              <View style={[styles.stepNumber, isDesktop && { marginBottom: 16, marginRight: 0 }]}><Text style={styles.stepNumText}>3</Text></View>
              <View style={{ flex: 1 }}><Text style={[styles.stepTitle, isDesktop && { textAlign: 'center' }]}>Analysis & Support</Text><Text style={[styles.stepDesc, isDesktop && { textAlign: 'center' }]}>Get kind feedback on your fluency and clarity.</Text></View>
            </View>
          </View>
        </View>

        {/* 4. Trust Section */}
        <View style={[styles.sectionContainer, { backgroundColor: '#11221E', marginHorizontal: -24, paddingHorizontal: 24, paddingVertical: 40 }]}>

          {/* Trust Badges */}
          <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'center', alignItems: 'center', gap: 30, marginBottom: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 32 }}>🩺</Text>
              <View>
                <Text style={{ color: COLORS.ACCENT_LIME, fontWeight: 'bold', fontSize: 16 }}>Developed with Speech Therapists</Text>
                <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12 }}>Consulted by licensed professionals</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 32 }}>💚</Text>
              <View>
                <Text style={{ color: COLORS.ACCENT_LIME, fontWeight: 'bold', fontSize: 16 }}>Built by Stutterers</Text>
                <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12 }}>We understand your struggle firsthand</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 32 }}>🔒</Text>
              <View>
                <Text style={{ color: COLORS.ACCENT_LIME, fontWeight: 'bold', fontSize: 16 }}>100% Private</Text>
                <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12 }}>Your recordings never leave your device</Text>
              </View>
            </View>
          </View>

          {/* Developer Story */}
          <View style={{ backgroundColor: 'rgba(212, 238, 159, 0.05)', borderRadius: 16, padding: 24, borderLeftWidth: 4, borderLeftColor: COLORS.ACCENT_LIME, marginBottom: 40, maxWidth: 800, alignSelf: 'center' }}>
            <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 16, lineHeight: 26, fontStyle: 'italic' }}>
              "As someone who stuttered since childhood, I know the anxiety of phone calls, presentations, and even ordering food.
              I built Speekly because I wished something like this existed when I was younger.
              This isn't just an app – it's the tool I needed."
            </Text>
            <Text style={{ color: COLORS.ACCENT_LIME, marginTop: 12, fontWeight: 'bold' }}>— Founder, Speekly</Text>
          </View>

          {/* Floating Reviews - Single Line Marquee Style */}
          <Text style={[styles.sectionHeader, { marginBottom: 20 }]}>What Users Say</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -24 }}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={styles.reviewBubble}>
                <Text style={styles.reviewText}>"Finally feel confident in meetings!" ⭐⭐⭐⭐⭐</Text>
                <Text style={styles.reviewAuthor}>Michael K.</Text>
              </View>
              <View style={styles.reviewBubble}>
                <Text style={styles.reviewText}>"SOS button = lifesaver before my thesis defense" ⭐⭐⭐⭐⭐</Text>
                <Text style={styles.reviewAuthor}>Sarah M.</Text>
              </View>
              <View style={styles.reviewBubble}>
                <Text style={styles.reviewText}>"Ordering coffee is no longer terrifying" ⭐⭐⭐⭐⭐</Text>
                <Text style={styles.reviewAuthor}>James T.</Text>
              </View>
              <View style={styles.reviewBubble}>
                <Text style={styles.reviewText}>"My son improved in just 2 weeks!" ⭐⭐⭐⭐⭐</Text>
                <Text style={styles.reviewAuthor}>Linda P.</Text>
              </View>
              <View style={styles.reviewBubble}>
                <Text style={styles.reviewText}>"Better than expensive therapy sessions" ⭐⭐⭐⭐⭐</Text>
                <Text style={styles.reviewAuthor}>David R.</Text>
              </View>
              <View style={styles.reviewBubble}>
                <Text style={styles.reviewText}>"Use it every morning, life changing" ⭐⭐⭐⭐⭐</Text>
                <Text style={styles.reviewAuthor}>Emma S.</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* 5. Lifetime Offer */}
        <View style={[styles.offerContainer, isDesktop && { maxWidth: 600, alignSelf: 'center' }]}>
          <View style={styles.offerBadge}><Text style={styles.offerBadgeText}>LIMITED TIME OFFER</Text></View>
          <Text style={styles.offerTitle}>Lifetime Therapy</Text>
          <Text style={styles.offerPrice}>$100 <Text style={styles.offerOriginal}>/ one-time</Text></Text>

          <View style={styles.checkList}>
            <Text style={styles.checkItem}>✅ Unlimited AI Therapy Sessions</Text>
            <Text style={styles.checkItem}>✅ Private & Secure Environment</Text>
            <Text style={styles.checkItem}>✅ Advanced Progress Tracking</Text>
            <Text style={styles.checkItem}>✅ Fraction of the cost of real therapy</Text>
          </View>

          <TouchableOpacity style={styles.offerButton} onPress={onGetStarted}>
            <Text style={styles.offerButtonText}>Get Lifetime Access Now</Text>
          </TouchableOpacity>
          <Text style={styles.guarantee}>30-day money-back guarantee</Text>
        </View>

        <View style={{ height: 50 }} />
      </View>
    </ScrollView>
  );
};

// Bottom Tab Bar
const Navbar = ({ activeTab, onTabChange, t }) => (
  <View style={styles.navbar}>
    <TouchableOpacity style={styles.navItem} onPress={() => onTabChange('home')}>
      <Text style={[styles.navIcon, activeTab === 'home' && styles.navActive]}>🏠</Text>
      <Text style={[styles.navText, activeTab === 'home' && styles.navActiveText]}>{t('home')}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => onTabChange('relax')}>
      <Text style={[styles.navIcon, activeTab === 'relax' && styles.navActive]}>🧘</Text>
      <Text style={[styles.navText, activeTab === 'relax' && styles.navActiveText]}>{t('relax')}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => onTabChange('practice')}>
      <Text style={[styles.navIcon, activeTab === 'practice' && styles.navActive]}>🎤</Text>
      <Text style={[styles.navText, activeTab === 'practice' && styles.navActiveText]}>{t('practice')}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.navItem} onPress={() => onTabChange('settings')}>
      <Text style={[styles.navIcon, activeTab === 'settings' && styles.navActive]}>⚙️</Text>
      <Text style={[styles.navText, activeTab === 'settings' && styles.navActiveText]}>{t('settings')}</Text>
    </TouchableOpacity>
  </View>
);

// --- SCREENS ---

// --- SCREENS ---

// --- SCREENS ---

const CheckoutScreen = ({ t, onComplete, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(false); // Toggle between signup and login
  const { width } = Dimensions.get('window');
  const isDesktop = width > 800;

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handlePay = async () => {
    // Validate inputs
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsProcessing(true);
    setError('');

    // ADMIN BYPASS - Owner gets instant access without auth
    const ADMIN_EMAILS = ['petrzak.ig@seznam.cz'];
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      await AsyncStorage.setItem('is_premium', 'true');
      Alert.alert('👑 Welcome!', 'You have full premium access.');
      setIsProcessing(false);
      onComplete();
      return;
    }

    try {
      if (isLoginMode) {
        // LOGIN MODE - For existing users
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          throw new Error(authError.message);
        }

        // Check if user is premium
        const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', authData.user.id).single();

        if (profile?.is_premium) {
          // Already premium - go to app
          await AsyncStorage.setItem('is_premium', 'true');
          Alert.alert('Welcome back!', 'You already have premium access.');
          onComplete();
          return;
        }
        // Not premium yet - continue to payment
      } else {
        // SIGNUP MODE - Create new account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password
        });

        if (authError && !authError.message.includes('already registered')) {
          throw new Error(authError.message);
        }
      }

      // 2. Call our Stripe checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        // 3. Redirect to Stripe Checkout
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          Linking.openURL(data.url);
        }
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.screenScroll}>
      <View style={{ maxWidth: 1000, alignSelf: 'center', width: '100%', paddingBottom: 50 }}>

        {/* Navigation */}
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: COLORS.TEXT_SEC, fontSize: 18, marginRight: 5 }}>←</Text>
          <Text style={{ color: COLORS.TEXT_SEC, fontSize: 16 }}>{t('back_home')}</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { marginBottom: 10 }]}>{t('checkout_title')}</Text>

        <View style={isDesktop ? { flexDirection: 'row', gap: 40, alignItems: 'flex-start' } : {}}>

          {/* Left Column: Order Summary (Desktop) */}
          <View style={isDesktop ? { flex: 1 } : { marginBottom: 30 }}>
            <View style={{ backgroundColor: '#11221E', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#2D4F44' }}>
              <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 15 }}>{t('order_sum')}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 18, fontWeight: 'bold' }}>{t('plan_name')}</Text>
                <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 18 }}>$100.00</Text>
              </View>
              <Text style={{ color: COLORS.TEXT_SEC, marginBottom: 20 }}>{t('one_time')}</Text>

              <View style={{ height: 1, backgroundColor: '#2D4F44', marginBottom: 20 }} />

              <Text style={{ color: COLORS.ACCENT_LIME, marginBottom: 5 }}>✅ Unlimited AI Access</Text>
              <Text style={{ color: COLORS.ACCENT_LIME, marginBottom: 5 }}>✅ Speech Pattern Analysis</Text>
              <Text style={{ color: COLORS.ACCENT_LIME, marginBottom: 5 }}>✅ Future V2 Updates Included</Text>
            </View>

            {isDesktop && (
              <View style={{ marginTop: 20, flexDirection: 'row', gap: 10, opacity: 0.6 }}>
                <Text style={{ fontSize: 24 }}>🔒</Text>
                <Text style={{ color: COLORS.TEXT_SEC, flex: 1, fontSize: 12 }}>Payments are securely processed by Stripe. We do not store your credit card details.</Text>
              </View>
            )}
          </View>

          {/* Right Column: Payment Form */}
          <View style={isDesktop ? { flex: 1 } : {}}>
            <View style={styles.checkoutCard}>

              {/* Login/Signup Toggle */}
              <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 12, marginBottom: 20 }}>
                <TouchableOpacity
                  style={{ flex: 1, padding: 12, alignItems: 'center', borderRadius: 8, backgroundColor: !isLoginMode ? COLORS.ACCENT_LIME : 'transparent' }}
                  onPress={() => setIsLoginMode(false)}
                >
                  <Text style={{ fontWeight: 'bold', color: !isLoginMode ? COLORS.BG_DARK : COLORS.TEXT_SEC }}>New Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, padding: 12, alignItems: 'center', borderRadius: 8, backgroundColor: isLoginMode ? COLORS.ACCENT_LIME : 'transparent' }}
                  onPress={() => setIsLoginMode(true)}
                >
                  <Text style={{ fontWeight: 'bold', color: isLoginMode ? COLORS.BG_DARK : COLORS.TEXT_SEC }}>I Have Account</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>{isLoginMode ? 'Sign In' : t('create_acc')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#556"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder={isLoginMode ? "Your password" : "Choose Password (min 6 chars)"}
                secureTextEntry
                placeholderTextColor="#556"
                value={password}
                onChangeText={setPassword}
              />

              {error ? (
                <Text style={{ color: COLORS.ACCENT_ORANGE, marginBottom: 10, textAlign: 'center' }}>{error}</Text>
              ) : null}

              <Text style={styles.inputLabel}>{t('pay_method')}</Text>

              <TouchableOpacity
                style={{
                  backgroundColor: isProcessing ? '#4a4a8f' : '#635BFF',
                  paddingVertical: 18,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginBottom: 20,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 10,
                  opacity: isProcessing ? 0.7 : 1
                }}
                onPress={handlePay}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>Processing...</Text>
                ) : (
                  <>
                    <Text style={{ fontSize: 20 }}>💳</Text>
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>
                      {isLoginMode ? 'Sign In' : t('pay_btn')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
                <Text style={{ fontSize: 12, color: COLORS.TEXT_SEC }}>🔒 {t('redirect_note')}</Text>
              </View>
            </View>
          </View>

        </View>
      </View>
    </ScrollView>
  );
};




const HomeScreen = ({ t, onStartRelax, onStartSos, onStartPractice, streak = 0 }) => {
  const [showInstall, setShowInstall] = useState(Platform.OS === 'web');
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    weeklyActivity: [false, false, false, false, false, false, false], // Mon-Sun
    averageWpm: 0,
    lastPractice: null
  });
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    loadStats();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('hello').includes('Ahoj') ? 'Dobré ráno' : 'Good morning';
    if (hour < 18) return t('hello').includes('Ahoj') ? 'Dobré odpoledne' : 'Good afternoon';
    return t('hello').includes('Ahoj') ? 'Dobrý večer' : 'Good evening';
  };

  const loadStats = async () => {
    try {
      const sessions = await AsyncStorage.getItem('total_sessions');
      const minutes = await AsyncStorage.getItem('total_minutes');
      const wpm = await AsyncStorage.getItem('average_wpm');
      const lastDate = await AsyncStorage.getItem('last_practice_date');
      const weekData = await AsyncStorage.getItem('weekly_activity');

      setStats({
        totalSessions: parseInt(sessions) || 0,
        totalMinutes: parseInt(minutes) || 0,
        averageWpm: parseInt(wpm) || 0,
        lastPractice: lastDate,
        weeklyActivity: weekData ? JSON.parse(weekData) : [false, false, false, false, false, false, false]
      });
    } catch (e) {
      console.log('Error loading stats:', e);
    }
  };

  const getMotivationalMessage = () => {
    if (streak === 0) return "Start your journey today! 🌱";
    if (streak < 3) return "Great start! Keep building momentum 💪";
    if (streak < 7) return "You're on fire! Almost a full week 🔥";
    if (streak < 14) return "Amazing consistency! You're making real progress 🌟";
    if (streak < 30) return "Incredible dedication! You're transforming 🚀";
    return "You're a speaking champion! 👑";
  };

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1; // Convert Sunday=0 to index 6

  return (
    <ScrollView style={styles.screenScroll} showsVerticalScrollIndicator={false}>
      {/* Header with Greeting */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{greeting}! 👋</Text>
        <Text style={styles.headerSubtitle}>{getMotivationalMessage()}</Text>
      </View>

      {/* Streak & Quick Stats Row */}
      <View style={{
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12
      }}>
        {/* Streak Card */}
        <View style={{
          flex: 1,
          backgroundColor: streak > 0 ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
          borderRadius: 16,
          padding: 16,
          borderWidth: streak > 0 ? 1 : 0,
          borderColor: COLORS.ACCENT_ORANGE
        }}>
          <Text style={{ fontSize: 32, textAlign: 'center' }}>{streak > 0 ? '🔥' : '💤'}</Text>
          <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>{streak}</Text>
          <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12, textAlign: 'center' }}>Day Streak</Text>
        </View>

        {/* Total Sessions */}
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(212,238,159,0.1)',
          borderRadius: 16,
          padding: 16
        }}>
          <Text style={{ fontSize: 32, textAlign: 'center' }}>🎯</Text>
          <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>{stats.totalSessions}</Text>
          <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12, textAlign: 'center' }}>Sessions</Text>
        </View>

        {/* Total Time */}
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 16,
          padding: 16
        }}>
          <Text style={{ fontSize: 32, textAlign: 'center' }}>⏱️</Text>
          <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>{stats.totalMinutes}</Text>
          <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12, textAlign: 'center' }}>Minutes</Text>
        </View>
      </View>

      {/* Weekly Activity Calendar */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
      }}>
        <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12, marginBottom: 12, fontWeight: '600' }}>THIS WEEK</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {weekDays.map((day, index) => (
            <View key={index} style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.TEXT_SEC, fontSize: 11, marginBottom: 6 }}>{day}</Text>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: stats.weeklyActivity[index]
                  ? COLORS.ACCENT_LIME
                  : index === adjustedToday
                    ? 'rgba(212,238,159,0.3)'
                    : 'rgba(255,255,255,0.1)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: index === adjustedToday ? 2 : 0,
                borderColor: COLORS.ACCENT_LIME
              }}>
                {stats.weeklyActivity[index] && (
                  <Text style={{ color: COLORS.BG_DARK, fontSize: 16 }}>✓</Text>
                )}
              </View>
            </View>
          ))}
        </View>
        <Text style={{ color: COLORS.TEXT_SEC, fontSize: 11, textAlign: 'center', marginTop: 12 }}>
          {stats.weeklyActivity.filter(Boolean).length}/7 days completed
        </Text>
      </View>

      {/* SOS Panic Button - Featured */}
      <TouchableOpacity
        style={{
          backgroundColor: 'rgba(249,115,22,0.15)',
          borderColor: COLORS.ACCENT_ORANGE,
          borderWidth: 1,
          padding: 20,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16
        }}
        onPress={onStartSos}
      >
        <Text style={{ fontSize: 32, marginRight: 15 }}>🚨</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.ACCENT_ORANGE, fontSize: 18, fontWeight: 'bold' }}>SOS Panic Button</Text>
          <Text style={{ color: COLORS.TEXT_SEC, fontSize: 13 }}>Instant calm in 60 seconds</Text>
        </View>
        <Text style={{ color: COLORS.ACCENT_ORANGE, fontSize: 24 }}>→</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <Text style={styles.sectionLabel}>Quick Start</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: COLORS.ACCENT_LIME,
            borderRadius: 16,
            padding: 20,
            alignItems: 'center'
          }}
          onPress={onStartPractice}
        >
          <Text style={{ fontSize: 28, marginBottom: 8 }}>🎤</Text>
          <Text style={{ color: COLORS.BG_DARK, fontWeight: 'bold', fontSize: 16 }}>Practice</Text>
          <Text style={{ color: COLORS.BG_DARK, opacity: 0.7, fontSize: 11 }}>AI Speech Training</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(212,238,159,0.15)',
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: COLORS.ACCENT_LIME
          }}
          onPress={onStartRelax}
        >
          <Text style={{ fontSize: 28, marginBottom: 8 }}>🧘</Text>
          <Text style={{ color: COLORS.ACCENT_LIME, fontWeight: 'bold', fontSize: 16 }}>Relax</Text>
          <Text style={{ color: COLORS.TEXT_SEC, fontSize: 11 }}>Breathing Exercises</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Tip */}
      <View style={{
        backgroundColor: 'rgba(212,238,159,0.08)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.ACCENT_LIME
      }}>
        <Text style={{ color: COLORS.ACCENT_LIME, fontWeight: 'bold', marginBottom: 6 }}>💡 Daily Tip</Text>
        <Text style={{ color: COLORS.TEXT_WHITE, lineHeight: 20 }}>
          {TIPS_DATA[new Date().getDay() % TIPS_DATA.length]}
        </Text>
      </View>

      {/* Install Banner */}
      {showInstall && (
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(212,238,159,0.15)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: COLORS.ACCENT_LIME,
            flexDirection: 'row',
            alignItems: 'center'
          }}
          onPress={() => {
            const isIOS = Platform.OS === 'web' && /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isAndroid = Platform.OS === 'web' && /Android/.test(navigator.userAgent);

            let instructions;
            if (isIOS) {
              instructions = "📱 Install Speekly on iPhone:\n\n1️⃣ Tap the Share button ⬆️ at the bottom of Safari\n\n2️⃣ Scroll down in the menu\n\n3️⃣ Tap 'Add to Home Screen'\n\n4️⃣ Tap 'Add' in the top right\n\n✨ Done! Speekly will appear on your home screen.";
            } else if (isAndroid) {
              instructions = "📱 Install Speekly on Android:\n\n1️⃣ Tap the menu ⋮ (three dots) in Chrome\n\n2️⃣ Tap 'Install app' or 'Add to Home screen'\n\n3️⃣ Confirm the installation\n\n✨ Done!";
            } else {
              instructions = "📱 Install Speekly:\n\niPhone: Safari → Share → Add to Home Screen\n\nAndroid: Chrome → Menu → Install App";
            }

            if (Platform.OS === 'web') {
              window.alert(instructions);
            } else {
              Alert.alert("📲 Install Speekly", instructions);
            }
          }}
        >
          <Text style={{ fontSize: 32, marginRight: 12 }}>📲</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.ACCENT_LIME, fontWeight: 'bold', fontSize: 16 }}>Install App</Text>
            <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12 }}>Tap here for instructions</Text>
          </View>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); setShowInstall(false); }}
            style={{ padding: 8 }}
          >
            <Text style={{ color: COLORS.TEXT_SEC, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const PracticeScreen = ({ t, language, apiKey, setApiKey, onComplete }) => {
  const [mode, setMode] = useState('read'); // 'read' or 'chat'
  const [selectedScenario, setSelectedScenario] = useState(CONVERSATION_SCENARIOS[0]);

  // Read Mode State
  const [textIndex, setTextIndex] = useState(0);

  // Chat Mode State
  const [chatHistory, setChatHistory] = useState([]); // [{role, content}]
  const [customPromptInput, setCustomPromptInput] = useState(''); // For user-defined scenarios

  // Common State
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState(''); // Current incomplete utterance
  const [aiFeedback, setAiFeedback] = useState(''); // For read mode
  const [isProcessing, setIsProcessing] = useState(false);
  const [wpm, setWpm] = useState(0); // Words Per Minute

  // Audio Recording State
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordings, setRecordings] = useState([]); // History of recordings

  // Refs
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  const startRecording = async () => {
    setTranscript('');
    setAiFeedback('');
    setWpm(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecording(true);
    startTimeRef.current = Date.now();
    audioChunksRef.current = [];

    if (Platform.OS === 'web') {
      // Start speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'cz' ? 'cs-CZ' : 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) final += event.results[i][0].transcript;
          }
          if (final) setTranscript(prev => prev + ' ' + final);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      // Start audio recording for playback
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioUrl(url);

          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      } catch (err) {
        console.log('Audio recording not available:', err);
      }
    }
  };

  const stopRecording = () => {
    setRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Calculate WPM
    const durationSec = (Date.now() - startTimeRef.current) / 1000;
    const wordCount = transcript.trim().split(/\s+/).length;
    if (durationSec > 0 && wordCount > 0) {
      setWpm(Math.round((wordCount / durationSec) * 60));
    }

    // Small delay to ensure final transcript is captured
    setTimeout(() => {
      if (transcript.length > 2) handleFinalInput(transcript);
    }, 500);
  };

  // Play/Pause recorded audio
  const togglePlayback = () => {
    if (!audioUrl) return;

    if (isPlaying) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      audioPlayerRef.current = audio;
      setIsPlaying(true);
    }
  };

  const handleFinalInput = (text) => {
    if (mode === 'read') {
      analyzeRead(text);
    } else {
      analyzeChat(text);
    }
  };

  // Determine API Endpoint
  // If user provided their own key, use OpenAI direct.
  // Otherwise, use our secure backend proxy.
  const getApiConfig = () => {
    if (apiKey) {
      return { url: 'https://api.openai.com/v1/chat/completions', key: apiKey };
    }
    // Production usage: Point to our own Vercel API
    // When running locally, this might fail unless we run 'vercel dev'
    // But for production URL (e.g. speekly.vercel.app), this works.
    return { url: '/api/chat', key: null };
  };

  const analyzeRead = async (text) => {
    setIsProcessing(true);
    const { url, key } = getApiConfig();

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (key) headers['Authorization'] = `Bearer ${key}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a supportive speech therapist. Evaluate 'Acoustic Stability' (steady volume, lack of fillers like 'um', 'err') and clarity. Check for Bradylalia (too slow) or Tachylalia (too fast). Be supportive." },
            { role: "user", content: text }
          ]
        })
      });
      const data = await response.json();
      if (data.choices) {
        setAiFeedback(data.choices[0].message.content);
        if (onComplete) onComplete();
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not connect to AI server. Please check your connection.");
    }
    setIsProcessing(false);
  };

  const analyzeChat = async (userText) => {
    const { url, key } = getApiConfig();
    setIsProcessing(true);

    const newMsg = { role: 'user', content: userText };
    const updatedHistory = [...chatHistory, newMsg];
    setChatHistory(updatedHistory);

    // Initial System Prompt based on Scenario
    let sysMsg = { role: "system", content: "You are a helpful assistant." };
    if (selectedScenario.id === 'job') sysMsg.content = "You are a strict HR manager conducting a job interview. Be professional but tough.";
    if (selectedScenario.id === 'coffee') sysMsg.content = "You are a busy barista at a coffee shop. Take the order quickly.";
    if (selectedScenario.id === 'social') sysMsg.content = "You are a friendly neighbor chatting about the weather.";
    if (selectedScenario.id === 'custom') sysMsg.content = `Roleplay Scenario: ${customPromptInput || 'General Conversation'}. Stay in character.`;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (key) headers['Authorization'] = `Bearer ${key}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [sysMsg, ...updatedHistory]
        })
      });
      const data = await response.json();
      if (data.choices) {
        const aiMsg = data.choices[0].message;
        setChatHistory(prev => [...prev, aiMsg]);
        if (onComplete) onComplete();
      }
    } catch (e) { console.error(e); }
    setIsProcessing(false);
  };

  // Switch Mode & Clear
  const switchMode = (m) => {
    setMode(m);
    setChatHistory([]);
    setAiFeedback('');
    setTranscript('');
  };

  return (
    <ScrollView style={styles.screenScroll}>
      <View style={styles.navHeader}>
        <TouchableOpacity><Text style={styles.backArrow}>◀</Text></TouchableOpacity>
        <Text style={styles.navTitle}>{t('practice_title')}</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Mode Toggle */}
      <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 12, marginBottom: 20, marginHorizontal: 20 }}>
        <TouchableOpacity
          style={{ flex: 1, padding: 10, alignItems: 'center', borderRadius: 8, backgroundColor: mode === 'read' ? COLORS.ACCENT_LIME : 'transparent' }}
          onPress={() => switchMode('read')}
        >
          <Text style={{ fontWeight: 'bold', color: mode === 'read' ? COLORS.BG_DARK : COLORS.TEXT_SEC }}>{t('read_mode')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, padding: 10, alignItems: 'center', borderRadius: 8, backgroundColor: mode === 'chat' ? COLORS.ACCENT_LIME : 'transparent' }}
          onPress={() => switchMode('chat')}
        >
          <Text style={{ fontWeight: 'bold', color: mode === 'chat' ? COLORS.BG_DARK : COLORS.TEXT_SEC }}>{t('chat_mode')}</Text>
        </TouchableOpacity>
      </View>

      {mode === 'read' ? (
        <>
          <Text style={styles.sectionLabel}>Practice Text</Text>
          <View style={styles.practiceCard}>
            <Text style={styles.practiceTextContent}>{PRACTICE_SENTENCES[textIndex]}</Text>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => setTextIndex((textIndex + 1) % PRACTICE_SENTENCES.length)}
            >
              <Text style={styles.smallButtonText}>{t('diff_text')}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* Scenario Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, paddingLeft: 20 }}>
            {CONVERSATION_SCENARIOS.map(sc => (
              <TouchableOpacity
                key={sc.id}
                style={{ marginRight: 10, backgroundColor: selectedScenario.id === sc.id ? COLORS.ACCENT_LIME : 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                onPress={() => { setSelectedScenario(sc); setChatHistory([]); }}
              >
                <Text style={{ color: selectedScenario.id === sc.id ? COLORS.BG_DARK : COLORS.TEXT_WHITE, fontWeight: 'bold' }}>
                  {sc.icon} {sc.id === 'job' ? t('scen_job') : sc.id === 'coffee' ? t('scen_coffee') : sc.id === 'social' ? t('scen_social') : t('scen_custom')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Custom Scenario Input Area */}
          {selectedScenario.id === 'custom' && chatHistory.length === 0 && (
            <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12 }}>
              <Text style={{ color: COLORS.TEXT_WHITE, marginBottom: 10, fontWeight: 'bold' }}>{t('custom_desc')}</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: '#FFF', padding: 12, borderRadius: 8, marginBottom: 10 }}
                placeholder={t('custom_placeholder')}
                placeholderTextColor="#666"
                value={customPromptInput}
                onChangeText={setCustomPromptInput}
              />
              <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12 }}></Text>
            </View>
          )}

          {/* Chat Area */}
          <View style={{ minHeight: 300, paddingHorizontal: 20 }}>
            {chatHistory.length === 0 && (
              <Text style={{ color: COLORS.TEXT_SEC, textAlign: 'center', marginTop: 50, fontStyle: 'italic' }}>
                {selectedScenario.id === 'custom'
                  ? t('custom_desc')
                  : t('start_breath')}
              </Text>
            )}
            {chatHistory.map((msg, i) => (
              <View key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? COLORS.ACCENT_ORANGE : 'rgba(255,255,255,0.1)', maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 10 }}>
                <Text style={{ color: '#FFF' }}>{msg.content}</Text>
              </View>
            ))}
            {isProcessing && <Text style={{ marginLeft: 20, color: COLORS.TEXT_SEC, fontStyle: 'italic' }}>AI is typing...</Text>}
          </View>
        </>
      )}

      <View style={styles.micContainer}>
        {/* Playback Button (left side) */}
        {audioUrl && !recording && (
          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: isPlaying ? COLORS.ACCENT_ORANGE : 'rgba(212,238,159,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
              borderWidth: 2,
              borderColor: isPlaying ? COLORS.ACCENT_ORANGE : COLORS.ACCENT_LIME
            }}
            onPress={togglePlayback}
          >
            <Text style={{ fontSize: 20 }}>{isPlaying ? '⏸️' : '▶️'}</Text>
          </TouchableOpacity>
        )}

        {/* Main Mic Button */}
        <TouchableOpacity
          style={[styles.micButton, recording && styles.micActive]}
          onPress={recording ? stopRecording : startRecording}
        >
          <Text style={styles.micIcon}>{recording ? '⬛' : '🎤'}</Text>
        </TouchableOpacity>

        {/* Empty space for balance when playback visible */}
        {audioUrl && !recording && <View style={{ width: 70 }} />}
      </View>

      {/* Recording Status */}
      <Text style={styles.micLabel}>
        {recording ? 'Listening...' : audioUrl ? 'Tap ▶️ to replay' : t('press_record')}
      </Text>

      {/* Legacy Feedback Area (only for Read mode) */}
      {mode === 'read' && (transcript || aiFeedback) && (
        <View style={styles.feedbackArea}>
          <Text style={styles.userText}>"{transcript}"</Text>
          {wpm > 0 && <Text style={{ color: COLORS.ACCENT_LIME, fontSize: 12, marginTop: 5, fontStyle: 'italic' }}>Speed: ~{wpm} WPM</Text>}
          {isProcessing && <Text style={{ color: COLORS.ACCENT_LIME }}>Analyzing...</Text>}
          {aiFeedback ? <View style={styles.aiBox}><Text style={styles.aiText}>💡 {aiFeedback}</Text></View> : null}
        </View>
      )}

      {/* No Recordings Placeholder if empty */}
      {!transcript && !recording && (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 24 }}>🎙️</Text>
          <Text style={styles.emptyText}>{t('no_rec')}</Text>
        </View>
      )}

      <View style={styles.tipsBox}>
        <Text style={styles.tipsTitle}>💡 {t('tips')}</Text>
        {TIPS_DATA.map((tip, i) => (
          <Text key={i} style={styles.tipItem}>• {tip}</Text>
        ))}
      </View>

      {/* API key warning removed - backend proxy handles auth */}

    </ScrollView>
  );
};

const RelaxationScreen = ({ t, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(RELAX_TECHNIQUES[0].time * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedId, setSelectedId] = useState(1);

  // Custom Techniques State
  const [customList, setCustomList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');

  // Combined List
  const allTechniques = [...RELAX_TECHNIQUES, ...customList];

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      if (isActive) {
        setIsActive(false);
        if (onComplete) onComplete();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const selectTech = (tech) => {
    setSelectedId(tech.id);
    setTimeLeft(tech.time * 60);
    setIsActive(false);
  };

  const addCustomTechnique = () => {
    if (!newTitle || !newTime) return;
    const newTech = {
      id: Date.now(), // simple unique id
      title: newTitle,
      time: parseInt(newTime),
      timeStr: `${newTime} minutes`,
      type: 'custom'
    };
    setCustomList([...customList, newTech]);
    setShowAddModal(false);
    setNewTitle('');
    setNewTime('');
  };

  return (
    <ScrollView style={styles.screenScroll}>
      <View style={styles.navHeader}>
        <TouchableOpacity><Text style={styles.backArrow}>◀</Text></TouchableOpacity>
        <Text style={styles.navTitle}>{t('relax_title')}</Text>
        <View style={{ width: 20 }} />
      </View>
      <Text style={styles.subHeaderCentered}>{t('relax_sub')}</Text>

      <View style={{ gap: 10, marginVertical: 20 }}>
        {allTechniques.map(tech => (
          <TouchableOpacity
            key={tech.id}
            style={[styles.techCard, selectedId === tech.id && styles.techCardActive]}
            onPress={() => selectTech(tech)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>
                {
                  tech.type === 'deep' ? '🧘' :
                    tech.type === 'body' ? '💪' :
                      tech.type === 'physical' ? '💆' :
                        tech.type === 'mental' ? '🧠' : '⏰'
                }
              </Text>
              <View>
                <Text style={styles.techTitle}>
                  {tech.id === 1 ? t('rel_diaphragm') :
                    tech.id === 2 ? t('rel_pmr') :
                      tech.id === 3 ? t('rel_jaw') :
                        tech.id === 4 ? t('rel_viz') :
                          tech.id === 5 ? t('rel_vocal') : tech.title}
                </Text>
                <Text style={styles.techTime}>{tech.timeStr}</Text>
              </View>
            </View>
            {selectedId === tech.id && <View style={styles.radioDot} />}
          </TouchableOpacity>
        ))}

        {/* Add New Button */}
        <TouchableOpacity style={[styles.techCard, { borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' }]} onPress={() => setShowAddModal(true)}>
          <Text style={{ color: COLORS.ACCENT_LIME, fontWeight: 'bold' }}>+ {t('add_custom')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{fmt(timeLeft)}</Text>
        <View style={styles.timerControls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => setIsActive(!isActive)}
          >
            <Text style={styles.playIcon}>{isActive ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => { setIsActive(false); const tech = allTechniques.find(x => x.id === selectedId); setTimeLeft(tech ? tech.time * 60 : 180); }}
          >
            <Text style={styles.resetIcon}>↺</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tipsBox}>
        <Text style={styles.tipsTitle}>📄 {t('instructions')}</Text>
        {/* TMJ Warning */}
        {allTechniques.find(t => t.id === selectedId)?.warning && (
          <View style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', padding: 10, borderRadius: 8, marginBottom: 10 }}>
            <Text style={{ color: COLORS.ACCENT_ORANGE, fontWeight: 'bold', fontSize: 13 }}>{t('tmj_warning')}</Text>
          </View>
        )}

        {allTechniques.find(t => t.id === selectedId)?.instructions ? (
          allTechniques.find(t => t.id === selectedId).instructions.map((step, i) => (
            <Text key={i} style={styles.tipItem}>• {step}</Text>
          ))
        ) : (
          <>
            <Text style={styles.tipItem}>• Sit comfortably and close your eyes</Text>
            <Text style={styles.tipItem}>• Focus on your breath</Text>
            <Text style={styles.tipItem}>• Breathe in for 4 counts, hold for 4 counts</Text>
            <Text style={styles.tipItem}>• Repeat and relax</Text>
          </>
        )}
      </View>

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: COLORS.BG_DARK, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.ACCENT_LIME }}>
            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Add Custom Technique</Text>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={styles.input} placeholder="e.g. Morning Calm" placeholderTextColor="#556" value={newTitle} onChangeText={setNewTitle} />

            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput style={styles.input} placeholder="e.g. 5" keyboardType="numeric" placeholderTextColor="#556" value={newTime} onChangeText={setNewTime} />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity style={{ flex: 1, padding: 15, alignItems: 'center' }} onPress={() => setShowAddModal(false)}>
                <Text style={{ color: COLORS.TEXT_SEC }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.limeButton, { marginTop: 0, flex: 1 }]} onPress={addCustomTechnique}>
                <Text style={styles.limeButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const SosScreen = ({ t, onExit }) => {
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale
  const [timeLeft, setTimeLeft] = useState(60);
  const [msgIndex, setMsgIndex] = useState(0);
  const [isDiscrete, setIsDiscrete] = useState(false); // New Discrete Mode

  const AFFIRMATIONS = [
    "You are safe.",
    "Take your time.",
    "Your voice matters.",
    "You are prepared.",
    "Just breathe.",
    "Speak slowly.",
    "It is okay to pause."
  ];

  useEffect(() => {
    // Timer
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Breathing Phase Loop (12s cycle: 4 In, 4 Hold, 4 Out)
    let step = 0;
    const breather = setInterval(() => {
      step = (step + 1) % 3;
      if (step === 0) {
        setPhase("Inhale");
        if (Platform.OS !== 'web') Vibration.vibrate(100); // Haptic start
      }
      if (step === 1) setPhase("Hold");
      if (step === 2) setPhase("Exhale");
    }, 4000);

    // Affirmation Loop
    const affirmer = setInterval(() => {
      setMsgIndex(i => (i + 1) % AFFIRMATIONS.length);
    }, 5000);

    return () => { clearInterval(timer); clearInterval(breather); clearInterval(affirmer); };
  }, []);

  return (
    <View style={[styles.screenScroll, { alignItems: 'center', justifyContent: 'center', height: '90%', backgroundColor: isDiscrete ? '#000' : 'transparent' }]}>
      <TouchableOpacity
        style={{ position: 'absolute', top: 0, right: 0, padding: 10 }}
        onPress={() => setIsDiscrete(!isDiscrete)}
      >
        <Text style={{ fontSize: 24 }}>{isDiscrete ? '👁️‍🗨️' : '👁️'}</Text>
      </TouchableOpacity>

      <Text style={{ color: isDiscrete ? '#333' : COLORS.ACCENT_ORANGE, fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>
        {isDiscrete ? 'DISCRETE MODE' : 'EMERGENCY CALM'}
      </Text>

      {/* Breathing Circle */}
      <View style={{ width: 200, height: 200, borderRadius: 100, borderWidth: isDiscrete ? 0 : 4, borderColor: COLORS.ACCENT_ORANGE, alignItems: 'center', justifyContent: 'center', marginBottom: 40, backgroundColor: (!isDiscrete && phase === 'Hold') ? 'rgba(249,115,22,0.1)' : 'transparent' }}>

        {/* In discrete mode, show minimal text, hide big visual cues */}
        {!isDiscrete ? (
          <>
            <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 32, fontWeight: 'bold' }}>{phase}</Text>
            <Text style={{ color: COLORS.TEXT_SEC, fontSize: 14, marginTop: 5 }}>4 sec</Text>
          </>
        ) : (
          <Text style={{ color: '#444', fontSize: 14 }}>{phase}...</Text>
        )}

      </View>

      <Text style={{ color: isDiscrete ? '#444' : COLORS.TEXT_WHITE, fontSize: isDiscrete ? 16 : 24, textAlign: 'center', height: 60, marginBottom: 20 }}>
        "{AFFIRMATIONS[msgIndex]}"
      </Text>

      <TouchableOpacity style={[styles.limeButton, { backgroundColor: isDiscrete ? '#222' : COLORS.ACCENT_ORANGE, width: 200 }]} onPress={onExit}>
        <Text style={{ color: isDiscrete ? '#666' : '#FFF', fontWeight: 'bold', fontSize: 18 }}>{timeLeft > 0 ? `I'm Ready (${timeLeft}s)` : "I'm Ready"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const SettingsScreen = ({ t, language, setLanguage, apiKey, setApiKey, onReset, user, onLogin }) => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremium = async () => {
      const premium = await AsyncStorage.getItem('is_premium');
      setIsPremium(premium === 'true');
    };
    checkPremium();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('is_premium');
    Alert.alert('Signed Out', 'You have been signed out.');
  };

  return (
    <ScrollView style={styles.screenScroll}>
      <Text style={styles.headerTitle}>{t('settings')}</Text>

      {/* Premium Status Banner */}
      {isPremium && (
        <View style={{
          backgroundColor: 'rgba(212,238,159,0.15)',
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: COLORS.ACCENT_LIME,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 28, marginRight: 12 }}>👑</Text>
          <View>
            <Text style={{ color: COLORS.ACCENT_LIME, fontSize: 18, fontWeight: 'bold' }}>Premium Active</Text>
            <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12 }}>Lifetime access • All features unlocked</Text>
          </View>
        </View>
      )}

      {/* Account Section */}
      <Text style={styles.sectionLabel}>Account / Účet</Text>
      <View style={{ marginBottom: 20, padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
        {user ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.ACCENT_LIME, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 24, color: COLORS.BG_DARK }}>👤</Text>
              </View>
              <View>
                <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 16, fontWeight: 'bold' }}>{user.email}</Text>
                <Text style={{ color: COLORS.TEXT_SEC, fontSize: 12 }}>Logged in</Text>
              </View>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={handleSignOut}
            >
              <Text style={{ color: COLORS.TEXT_SEC, fontWeight: '600' }}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : isPremium ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>✅</Text>
            <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 16 }}>Premium Access Active</Text>
          </View>
        ) : (
          <>
            <Text style={{ color: COLORS.TEXT_SEC, marginBottom: 12 }}>Sync your progress across devices.</Text>
            <TouchableOpacity style={styles.limeButton} onPress={onLogin}>
              <Text style={styles.limeButtonText}>Sign In / Register</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Language */}
      <Text style={styles.sectionLabel}>Language / Jazyk</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 30 }}>
        <TouchableOpacity style={[styles.langBtn, language === 'en' && styles.langBtnActive]} onPress={() => setLanguage('en')}>
          <Text style={styles.langText}>English 🇺🇸</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.langBtn, language === 'cz' && styles.langBtnActive]} onPress={() => setLanguage('cz')}>
          <Text style={styles.langText}>Čeština 🇨🇿</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <Text style={styles.sectionLabel}>About</Text>
      <View style={{ marginBottom: 30, padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: COLORS.TEXT_SEC }}>Version</Text>
          <Text style={{ color: COLORS.TEXT_WHITE }}>1.0.0</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: COLORS.TEXT_SEC }}>Status</Text>
          <Text style={{ color: COLORS.ACCENT_LIME }}>{isPremium ? '✅ Premium' : '🔒 Free'}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: COLORS.TEXT_SEC }}>Support</Text>
          <Text style={{ color: COLORS.ACCENT_LIME }}>speeklymng@gmail.com</Text>
        </View>
      </View>

      {/* Danger Zone */}
      <Text style={[styles.sectionLabel, { color: COLORS.ACCENT_ORANGE }]}>Danger Zone</Text>
      <TouchableOpacity
        style={{ backgroundColor: 'rgba(249,115,22,0.1)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', alignItems: 'center' }}
        onPress={onReset}
      >
        <Text style={{ color: COLORS.ACCENT_ORANGE, fontWeight: 'bold' }}>🔄 Reset App Data</Text>
        <Text style={{ color: COLORS.TEXT_SEC, fontSize: 11, marginTop: 4 }}>Clears all local data and restarts</Text>
      </TouchableOpacity>

      {/* Disclaimer */}
      <View style={{ marginTop: 40, marginBottom: 40, padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
        <Text style={{ color: COLORS.TEXT_SEC, fontSize: 11, textAlign: 'center', fontStyle: 'italic', lineHeight: 16 }}>
          {t('disclaimer')}
        </Text>
        <Text style={{ color: COLORS.TEXT_SEC, fontSize: 10, textAlign: 'center', marginTop: 10, opacity: 0.5 }}>
          © 2025 Speekly. Made with ❤️ for people who stutter.
        </Text>
      </View>
    </ScrollView>
  );
};



// --- MAIN APP ---

const SCENARIOS = {
  // ... (previous content)
};

// Backend API handles OpenAI calls - no client key needed
// Set to 'backend' to indicate we're using server-side proxy
const SYSTEM_API_KEY = "backend";

import { SpeedInsights } from "@vercel/speed-insights/react";

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('home'); // home | relax | practice | settings | sos | auth
  const [user, setUser] = useState(null);

  // --- AUTH EFFECT ---
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && activeTab === 'auth') {
        setActiveTab('home'); // Auto-redirect after login
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  const [currentScreen, setCurrentScreen] = useState('landing'); // landing | checkout | app
  const [language, setLanguage] = useState('en');
  const [apiKey, setApiKey] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [streak, setStreak] = useState(0); // Gamification

  useEffect(() => {
    // Load Persisted Data
    const load = async () => {
      const l = await AsyncStorage.getItem('language');
      const k = await AsyncStorage.getItem('openai_key');
      const isPremium = await AsyncStorage.getItem('is_premium');

      // Load Streak
      const s = await AsyncStorage.getItem('user_streak');
      const lastDate = await AsyncStorage.getItem('last_practice_date');

      // Basic Streak Validation logic (visual only for now, logic on update)
      if (s) setStreak(parseInt(s));

      if (l) setLanguage(l);
      if (k) setApiKey(k);

      // Check for payment success from URL (Stripe redirect)
      if (Platform.OS === 'web') {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const sessionId = urlParams.get('session_id');

        if (paymentStatus === 'success') {
          // Payment successful - unlock premium
          await AsyncStorage.setItem('is_premium', 'true');
          setCurrentScreen('app');
          Alert.alert('🎉 Payment Successful!', 'Welcome to Speekly Premium! You now have unlimited access.');
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsReady(true);
          return;
        } else if (paymentStatus === 'canceled') {
          // Payment was canceled
          Alert.alert('Payment Canceled', 'Your payment was canceled. You can try again anytime.');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      // Auto-Login if Premium
      if (isPremium === 'true') {
        setCurrentScreen('app');
      }

      setIsReady(true);
    };
    load();
  }, []);

  const goToCheckout = () => {
    setCurrentScreen('checkout');
  };

  const finishCheckout = async () => {
    await AsyncStorage.setItem('is_premium', 'true');
    await AsyncStorage.setItem('has_seen_landing', 'true');
    setCurrentScreen('app');
  };

  const saveLang = async (l) => { setLanguage(l); await AsyncStorage.setItem('language', l); };
  const saveKey = async (k) => { setApiKey(k); await AsyncStorage.setItem('openai_key', k); };

  const markPracticeComplete = async (durationMinutes = 5) => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = await AsyncStorage.getItem('last_practice_date');
    const dayOfWeek = new Date().getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0, Sun=6

    // Update total sessions
    const sessions = parseInt(await AsyncStorage.getItem('total_sessions')) || 0;
    await AsyncStorage.setItem('total_sessions', (sessions + 1).toString());

    // Update total minutes
    const minutes = parseInt(await AsyncStorage.getItem('total_minutes')) || 0;
    await AsyncStorage.setItem('total_minutes', (minutes + durationMinutes).toString());

    // Update weekly activity
    let weeklyActivity = [false, false, false, false, false, false, false];
    try {
      const stored = await AsyncStorage.getItem('weekly_activity');
      if (stored) weeklyActivity = JSON.parse(stored);
    } catch (e) { }

    // Reset weekly if it's a new week (Monday)
    const lastWeek = await AsyncStorage.getItem('week_start');
    const currentWeekStart = getWeekStart();
    if (lastWeek !== currentWeekStart) {
      weeklyActivity = [false, false, false, false, false, false, false];
      await AsyncStorage.setItem('week_start', currentWeekStart);
    }

    weeklyActivity[adjustedDay] = true;
    await AsyncStorage.setItem('weekly_activity', JSON.stringify(weeklyActivity));

    // Streak logic - only count once per day
    if (lastDate === today) return;

    let newStreak = streak;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (lastDate === yesterday) {
      newStreak += 1;
    } else if (lastDate !== today) {
      newStreak = 1; // Broken streak or first time
    }

    setStreak(newStreak);
    await AsyncStorage.setItem('user_streak', newStreak.toString());
    await AsyncStorage.setItem('last_practice_date', today);

    Alert.alert("🔥 Great Practice!", `${newStreak} day streak! Sessions: ${sessions + 1}`);

    // SYNC TO SUPABASE (Cloud Backup)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          streak: newStreak,
          last_practice_date: today,
          total_sessions: sessions + 1
        });
      }
    } catch (e) {
      console.log('Online sync failed (offline?)', e);
    }
  };

  // Helper function to get week start date (Monday)
  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  };

  const t = (k) => DICTIONARY[language][k] || k;

  if (!isReady) return null;

  if (currentScreen === 'landing') {
    return (
      <MobileContainer fullWidth={true}>
        <StatusBar style="light" />
        <Analytics />
        <SafeAreaView style={styles.safeArea}>
          <LandingScreen t={t} onGetStarted={goToCheckout} />
        </SafeAreaView>
      </MobileContainer>
    );
  }

  if (currentScreen === 'checkout') {
    return (
      <MobileContainer fullWidth={true}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <CheckoutScreen t={t} onComplete={finishCheckout} onBack={() => setCurrentScreen('landing')} />
        </SafeAreaView>
      </MobileContainer>
    );
  }

  const handleReset = async () => {
    await AsyncStorage.removeItem('is_premium');
    setCurrentScreen('landing');
  };

  return (
    <MobileContainer fullWidth={true}>
      <StatusBar style="light" />
      {Platform.OS === 'web' && <><Analytics /><SpeedInsights /></>}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <View style={{ maxWidth: 1000, alignSelf: 'center', width: '100%', flex: 1 }}>
            {activeTab === 'home' && <HomeScreen t={t} streak={streak} onStartRelax={() => setActiveTab('relax')} onStartSos={() => setActiveTab('sos')} onStartPractice={() => setActiveTab('practice')} />}
            {activeTab === 'relax' && <RelaxationScreen t={t} onComplete={markPracticeComplete} />}
            {activeTab === 'practice' && <PracticeScreen t={t} language={language} apiKey={apiKey} onComplete={markPracticeComplete} />}
            {activeTab === 'settings' && <SettingsScreen t={t} language={language} setLanguage={saveLang} apiKey={apiKey} setApiKey={saveKey} onReset={handleReset} onLogin={() => setActiveTab('auth')} user={user} />}
            {activeTab === 'sos' && <SosScreen t={t} onExit={() => setActiveTab('home')} />}
            {activeTab === 'auth' && <AuthScreen t={t} colors={COLORS} onLoginSuccess={() => setActiveTab('home')} onCancel={() => setActiveTab('home')} />}
          </View>
        </View>
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} t={t} />
      </SafeAreaView>
    </MobileContainer>
  );
}

const styles = StyleSheet.create({
  // Layouts
  webContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  mobileWrapper: { width: '100%', maxWidth: 500, height: '100%', backgroundColor: COLORS.BG_DARK, overflow: 'hidden' },
  webWrapperFull: { maxWidth: '100%' },
  safeArea: { flex: 1, backgroundColor: COLORS.BG_DARK },
  contentContainer: { flex: 1 },
  screenScroll: { flex: 1, padding: 20 },

  // Landing Screen
  heroSection: { alignItems: 'center', padding: 30, paddingTop: 60, marginBottom: 20 },
  heroBadge: { backgroundColor: '#1A382F', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#2D4F44' },
  heroBadgeText: { color: COLORS.ACCENT_LIME, fontWeight: '600', fontSize: 12 },
  heroTitle: { fontSize: 42, color: COLORS.TEXT_WHITE, fontWeight: 'bold', textAlign: 'center', lineHeight: 50, marginBottom: 20 },
  heroSub: { fontSize: 18, color: COLORS.TEXT_SEC, textAlign: 'center', lineHeight: 28, marginBottom: 40 },
  heroButton: { backgroundColor: COLORS.ACCENT_LIME, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 100, marginBottom: 20, width: '100%', alignItems: 'center', shadowColor: COLORS.ACCENT_LIME, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  heroButtonText: { color: '#0F2822', fontWeight: 'bold', fontSize: 18 },
  heroNote: { color: COLORS.TEXT_SEC, fontSize: 12 },

  sectionContainer: { padding: 24, marginBottom: 10 },
  sectionHeader: { fontSize: 28, fontWeight: 'bold', color: COLORS.TEXT_WHITE, marginBottom: 30, textAlign: 'center' },

  benefitCard: { backgroundColor: '#1A382F', padding: 24, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  benefitIcon: { fontSize: 32, marginBottom: 16 },
  benefitTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.TEXT_WHITE, marginBottom: 8 },
  benefitDesc: { fontSize: 15, color: COLORS.TEXT_SEC, lineHeight: 22 },

  processSection: { padding: 24, backgroundColor: '#11221E', marginVertical: 20 },
  stepRow: { flexDirection: 'row', marginBottom: 30 },
  stepNumber: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2D4F44', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  stepNumText: { color: COLORS.ACCENT_LIME, fontWeight: 'bold', fontSize: 18 },
  stepTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.TEXT_WHITE, marginBottom: 4 },
  stepDesc: { fontSize: 14, color: COLORS.TEXT_SEC },

  testimonialCard: { backgroundColor: '#142E27', padding: 30, borderRadius: 20, borderTopWidth: 4, borderTopColor: COLORS.ACCENT_LIME },
  quote: { fontSize: 18, color: COLORS.TEXT_WHITE, fontStyle: 'italic', marginBottom: 20, lineHeight: 28 },
  author: { color: COLORS.ACCENT_LIME, fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  stars: { fontSize: 12 },

  // Review Bubbles (floating single-line)
  reviewBubble: {
    backgroundColor: '#1A382F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(212, 238, 159, 0.2)',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 200
  },
  reviewText: { color: COLORS.TEXT_WHITE, fontSize: 14, textAlign: 'center' },
  reviewAuthor: { color: COLORS.ACCENT_LIME, fontSize: 12, fontWeight: 'bold', marginTop: 4 },

  // Offer Section
  offerContainer: { margin: 24, padding: 30, backgroundColor: 'linear-gradient(180deg, #1A382F 0%, #0F2822 100%)', borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.ACCENT_LIME, shadowColor: COLORS.ACCENT_LIME, shadowOpacity: 0.1, shadowRadius: 20 },
  offerBadge: { backgroundColor: COLORS.ACCENT_LIME, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 20 },
  offerBadgeText: { color: '#0F2822', fontWeight: 'bold', fontSize: 12 },
  offerTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.TEXT_WHITE, marginBottom: 10 },
  offerPrice: { fontSize: 48, fontWeight: 'bold', color: COLORS.TEXT_WHITE, marginBottom: 30 },
  offerOriginal: { fontSize: 16, color: COLORS.TEXT_SEC, fontWeight: 'normal' },

  checkList: { alignSelf: 'flex-start', marginBottom: 30 },
  checkItem: { color: COLORS.TEXT_WHITE, fontSize: 16, marginBottom: 12 },

  offerButton: { backgroundColor: COLORS.ACCENT_LIME, paddingVertical: 18, width: '100%', borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  offerButtonText: { color: '#0F2822', fontWeight: 'bold', fontSize: 18 },
  guarantee: { color: COLORS.TEXT_SEC, fontSize: 12 },

  // Checkout & Forms
  checkoutCard: { backgroundColor: '#1A382F', padding: 24, borderRadius: 16 },
  input: { backgroundColor: '#11221E', color: COLORS.TEXT_WHITE, padding: 16, borderRadius: 12, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#2D4F44' },
  inputLabel: { color: COLORS.ACCENT_LIME, fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  cardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#11221E', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#2D4F44' },

  // Install Banner
  installBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2D4F44', padding: 16, margin: 20, borderRadius: 12, marginBottom: 10 },
  installTitle: { color: COLORS.TEXT_WHITE, fontWeight: 'bold', fontSize: 16 },
  installDesc: { color: COLORS.TEXT_SEC, fontSize: 12 },

  // Navbar
  navbar: {
    flexDirection: 'row',
    backgroundColor: COLORS.BG_CARD,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    marginBottom: Platform.OS === 'web' ? 20 : 0,
    borderRadius: Platform.OS === 'web' ? 20 : 0,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 24, marginBottom: 4, color: COLORS.TEXT_SEC, opacity: 0.7 },
  navText: { fontSize: 10, color: COLORS.TEXT_SEC },
  navActive: { color: COLORS.ACCENT_LIME, opacity: 1 },
  navActiveText: { color: COLORS.ACCENT_LIME, fontWeight: 'bold' },

  // Header
  headerContainer: { marginTop: 20, marginBottom: 30 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.TEXT_WHITE, marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: COLORS.TEXT_SEC },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 10 },
  navTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.TEXT_WHITE },
  backArrow: { fontSize: 24, color: COLORS.TEXT_SEC, width: 30 },
  subHeaderCentered: { textAlign: 'center', color: COLORS.TEXT_SEC, marginBottom: 10 },

  // Typography
  sectionLabel: { fontSize: 18, color: COLORS.TEXT_WHITE, fontWeight: '600', marginBottom: 12, marginTop: 10 },

  // Cards
  recCard: { backgroundColor: COLORS.BG_CARD, padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  recText: { color: COLORS.TEXT_WHITE, fontSize: 16, textAlign: 'center', marginBottom: 16, lineHeight: 24 },

  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: COLORS.BG_CARD, padding: 20, borderRadius: 16, alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: COLORS.ACCENT_LIME, marginBottom: 5 },
  statLabel: { fontSize: 12, color: COLORS.TEXT_SEC },

  // Buttons
  limeButton: { backgroundColor: COLORS.ACCENT_LIME, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 30, width: '100%', alignItems: 'center' },
  limeButtonText: { color: COLORS.TEXT_DARK, fontWeight: 'bold', fontSize: 16 },
  smallButton: { backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginTop: 10 },
  smallButtonText: { color: COLORS.ACCENT_ORANGE, fontSize: 14, fontWeight: '600' },

  // Practice Specifics
  practiceCard: { backgroundColor: '#142E27', padding: 24, borderRadius: 12, alignItems: 'center', marginBottom: 40, borderLeftWidth: 4, borderLeftColor: COLORS.BG_CARD }, // Slightly distinct background
  practiceTextContent: { fontSize: 18, color: COLORS.TEXT_WHITE, textAlign: 'center', lineHeight: 28 },

  micContainer: { alignItems: 'center', marginBottom: 30 },
  micButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.ACCENT_LIME, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  micActive: { backgroundColor: COLORS.ACCENT_ORANGE },
  micIcon: { fontSize: 32 },
  micLabel: { color: COLORS.TEXT_SEC, fontSize: 14 },

  feedbackArea: { marginBottom: 20 },
  userText: { color: COLORS.TEXT_WHITE, fontSize: 16, fontStyle: 'italic', marginBottom: 10, textAlign: 'center' },
  aiBox: { backgroundColor: 'rgba(212, 238, 159, 0.1)', padding: 12, borderRadius: 8 },
  aiText: { color: '#E2E8F0', fontSize: 15 },

  emptyState: { alignItems: 'center', backgroundColor: COLORS.BG_CARD, padding: 30, borderRadius: 12, marginBottom: 20 },
  emptyText: { color: COLORS.TEXT_SEC, marginTop: 10 },

  // Relaxation Screen
  techCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#142E27', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  techCardActive: { borderColor: COLORS.ACCENT_LIME, backgroundColor: COLORS.BG_CARD },
  techTitle: { color: COLORS.TEXT_WHITE, fontSize: 16, fontWeight: 'bold' },
  techTime: { color: COLORS.TEXT_SEC, fontSize: 12 },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.ACCENT_LIME },

  timerContainer: { backgroundColor: '#1A382F', padding: 30, borderRadius: 16, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  timerText: { fontSize: 64, color: COLORS.TEXT_WHITE, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: 'bold', marginBottom: 20 },
  timerControls: { flexDirection: 'row', gap: 20 },
  playButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.ACCENT_LIME, alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 24, color: COLORS.TEXT_DARK },
  resetButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2D1F1C', alignItems: 'center', justifyContent: 'center' }, // Dark reddish brown for reset 
  resetIcon: { fontSize: 24, color: COLORS.ACCENT_ORANGE },

  // Tips Box
  tipsBox: { backgroundColor: '#11221E', padding: 20, borderRadius: 12, borderTopWidth: 1, borderTopColor: COLORS.BG_CARD, marginTop: 10 },
  tipsTitle: { color: '#FCD34D', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }, // Yellowish for tips header
  tipItem: { color: COLORS.TEXT_SEC, marginBottom: 8, fontSize: 14, lineHeight: 20 },

  // Settings
  langBtn: { flex: 1, padding: 16, backgroundColor: COLORS.BG_CARD, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  langBtnActive: { borderColor: COLORS.ACCENT_LIME },
  langText: { color: COLORS.TEXT_WHITE },
  apiKeyInput: { backgroundColor: '#0A1C18', color: COLORS.TEXT_WHITE, padding: 12, borderRadius: 8, width: '100%', borderWidth: 1, borderColor: COLORS.BG_CARD }
});
