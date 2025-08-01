import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, Button, Platform, FlatList, Alert, Dimensions
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import API services
import { authAPI } from './middleware/authService';
import { patientAPI } from './middleware/patientService';
import { doctorAPI } from './middleware/doctorService';
import { consultationAPI } from './middleware/consultationService';

import logo from './assets/logo.png';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');

// Custom Components
const GradientButton = ({ title, onPress, colors = ['#667eea', '#764ba2'], style = {}, textStyle = {}, disabled = false }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.gradientButtonContainer, style]}>
    <LinearGradient colors={disabled ? ['#ccc', '#999'] : colors} style={styles.gradientButton}>
      <Text style={[styles.gradientButtonText, textStyle]}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const Card = ({ children, style = {} }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const IconButton = ({ icon, title, onPress, colors = ['#667eea', '#764ba2'] }) => (
  <TouchableOpacity onPress={onPress} style={styles.iconButtonContainer}>
    <LinearGradient colors={colors} style={styles.iconButton}>
      <Text style={styles.iconButtonIcon}>{icon}</Text>
    </LinearGradient>
    <Text style={styles.iconButtonText}>{title}</Text>
  </TouchableOpacity>
);

// ----- Auth Screens -----
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      let result;
      if (isPhoneLogin) {
        if (!phone || !password) {
          Alert.alert('Error', 'Please enter phone number and password');
          setLoading(false);
          return;
        }
        result = await authAPI.loginPhone({ phone, password });
      } else {
        if (!email || !password) {
          Alert.alert('Error', 'Please enter email and password');
          setLoading(false);
          return;
        }
        result = await authAPI.login({ email, password });
      }
      
      if (result.token) {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      Alert.alert('Login Error', error.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.authContainer}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.authScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.authHeader}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.authLogo} />
          </View>
          <Text style={styles.authTitle}>Murakaza neza</Text>
          <Text style={styles.authSubtitle}>Injira muri ConnectCare</Text>
        </View>

        <View style={styles.authForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{isPhoneLogin ? 'Telefoni' : 'Imeyili'}</Text>
            {isPhoneLogin ? (
              <TextInput 
                style={styles.modernInput} 
                placeholder="Telefoni (+250...)" 
                placeholderTextColor="#999" 
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            ) : (
              <TextInput 
                style={styles.modernInput} 
                placeholder="Imeyili yawe" 
                placeholderTextColor="#999" 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ijambo ry'ibanga</Text>
            <View style={styles.passwordContainer}>
              <TextInput 
                style={[styles.modernInput, { paddingRight: 50 }]} 
                placeholder="Ijambo ry'ibanga" 
                secureTextEntry={!showPassword}
                placeholderTextColor="#999" 
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.passwordToggleText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <GradientButton
            title={loading ? 'Injira...' : 'Injira'}
            onPress={handleLogin}
            disabled={loading}
            colors={['#4facfe', '#00f2fe']}
            style={{ marginTop: 20 }}
          />
          
          <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => setIsPhoneLogin(!isPhoneLogin)}
          >
            <Text style={styles.switchButtonText}>
              {isPhoneLogin ? 'Koresha Imeyili' : 'Koresha Telefoni'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.authLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.linkText}>Funguza Konti</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.linkText}>Wibagiwe ijambo ry'ibanga?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isPhoneSignup, setIsPhoneSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      let result;
      if (isPhoneSignup) {
        if (!fullName || !phone || !password) {
          Alert.alert('Error', 'Please fill all required fields');
          setLoading(false);
          return;
        }
        result = await authAPI.registerPhone({ full_name: fullName, phone, password });
      } else {
        if (!fullName || !email || !password) {
          Alert.alert('Error', 'Please fill all required fields');
          setLoading(false);
          return;
        }
        result = await authAPI.register({ full_name: fullName, email, phone, password });
      }
      
      if (result.token) {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      Alert.alert('Signup Error', error.error || 'Failed to signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.authContainer}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.authScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.authHeader}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.authLogo} />
          </View>
          <Text style={styles.authTitle}>Funguza Konti</Text>
          <Text style={styles.authSubtitle}>Injira muri ConnectCare</Text>
        </View>

        <View style={styles.authForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amazina</Text>
            <TextInput 
              style={styles.modernInput} 
              placeholder="Amazina yawe yose" 
              placeholderTextColor="#999" 
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          
          {isPhoneSignup ? (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Telefoni</Text>
              <TextInput 
                style={styles.modernInput} 
                placeholder="Telefoni (+250...)" 
                keyboardType="phone-pad" 
                placeholderTextColor="#999" 
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Imeyili</Text>
                <TextInput 
                  style={styles.modernInput} 
                  placeholder="Imeyili yawe" 
                  keyboardType="email-address" 
                  placeholderTextColor="#999" 
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Telefoni</Text>
                <TextInput 
                  style={styles.modernInput} 
                  placeholder="Telefoni (+250...)" 
                  keyboardType="phone-pad" 
                  placeholderTextColor="#999" 
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ijambo ry'ibanga</Text>
            <View style={styles.passwordContainer}>
              <TextInput 
                style={[styles.modernInput, { paddingRight: 50 }]} 
                placeholder="Ijambo ry'ibanga" 
                secureTextEntry={!showPassword}
                placeholderTextColor="#999" 
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.passwordToggleText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <GradientButton
            title={loading ? 'Emeza...' : 'Emeza'}
            onPress={handleSignup}
            disabled={loading}
            colors={['#ff9a9e', '#fecfef']}
            style={{ marginTop: 20 }}
          />
          
          <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => setIsPhoneSignup(!isPhoneSignup)}
          >
            <Text style={styles.switchButtonText}>
              {isPhoneSignup ? 'Koresha Imeyili' : 'Koresha Telefoni'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPhoneReset, setIsPhoneReset] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        Alert.alert('Success', 'Reset link sent to your email/phone');
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset link');
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#ffecd2', '#fcb69f']} style={styles.authContainer}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.authScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.authHeader}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.authLogo} />
          </View>
          <Text style={styles.authTitle}>Wibagiwe ijambo?</Text>
          <Text style={styles.authSubtitle}>Tuzagukohereza link yo guhindura</Text>
        </View>

        <View style={styles.authForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{isPhoneReset ? 'Telefoni' : 'Imeyili'}</Text>
            {isPhoneReset ? (
              <TextInput 
                style={styles.modernInput} 
                placeholder="Telefoni yawe" 
                placeholderTextColor="#999" 
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            ) : (
              <TextInput 
                style={styles.modernInput} 
                placeholder="Imeyili yawe" 
                placeholderTextColor="#999" 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          </View>
          
          <GradientButton
            title={loading ? 'Ohereza link...' : 'Ohereza link'}
            onPress={handleReset}
            disabled={loading}
            colors={['#ffecd2', '#fcb69f']}
            style={{ marginTop: 20 }}
          />
          
          <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => setIsPhoneReset(!isPhoneReset)}
          >
            <Text style={styles.switchButtonText}>
              {isPhoneReset ? 'Koresha Imeyili' : 'Koresha Telefoni'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Garuka</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ----- Dashboard -----
function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleActionPress = (action) => {
    if (action.label === 'Emergency') {
      Alert.alert('Emergency', 'Calling emergency services...');
    } else if (action.screen) {
      navigation.navigate(action.screen);
    } else {
      Alert.alert('Info', 'This feature is not yet implemented.');
    }
  };

  const quickActions = [
    { key: '1', label: 'Book Appointment', icon: '📅', colors: ['#667eea', '#764ba2'], screen: 'Appointments' },
    { key: '2', label: 'Consult Now', icon: '💬', colors: ['#f093fb', '#f5576c'], screen: 'Consult' },
    { key: '3', label: 'Check Symptoms', icon: '🩺', colors: ['#4facfe', '#00f2fe'], screen: 'Symptoms' },
    { key: '4', label: 'Mental Health', icon: '🧠', colors: ['#43e97b', '#38f9d7'], screen: null },
    { key: '5', label: 'Health Records', icon: '📋', colors: ['#fa709a', '#fee140'], screen: null },
    { key: '6', label: 'Emergency', icon: '🚨', colors: ['#ff6b6b', '#ee5a24'], screen: null },
  ];

  const healthTips = [
    "Drink at least 8 glasses of water daily",
    "Get 7-9 hours of sleep each night",
    "Exercise for 30 minutes daily",
    "Eat 5 servings of fruits and vegetables"
  ];
  
  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }
  
  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.dashboardHeader}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Murakaza neza</Text>
              <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
            </View>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.headerLogo} />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.key} style={styles.actionCard} onPress={() => handleActionPress(action)}>
                <LinearGradient colors={action.colors} style={styles.actionGradient}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.cardTitle}>💡 Health Tips</Text>
          {healthTips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>

        {/* Emergency Button */}
        <GradientButton
          title="🚨 Emergency Contact"
          colors={['#ff6b6b', '#ee5a24']}
          style={styles.emergencyButton}
          onPress={() => Alert.alert('Emergency', 'Calling emergency services...')}
        />
      </ScrollView>
    </LinearGradient>
  );
}

import { Picker } from '@react-native-picker/picker';

// ----- Appointments -----
function AppointmentsScreen() {
  const [selectedDate, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [doctorsData, currentUser] = await Promise.all([
          doctorAPI.getAllDoctors(),
          authAPI.getCurrentUser(),
        ]);

        setDoctors(doctorsData);
        if (doctorsData.length > 0) {
          setSelectedDoctor(doctorsData[0].id);
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleBook = async () => {
    if (!user || !selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor and try again.');
      return;
    }

    const consultationData = {
      patient_id: user.id,
      doctor_id: selectedDoctor,
      consultation_date: selectedDate.toISOString().split('T')[0],
      notes: 'Appointment booked through the app',
      diagnosis: null,
      prescription: null,
      status: 'pending',
    };

    try {
      await consultationAPI.createConsultation(consultationData);
      Alert.alert('Success', 'Appointment booked successfully!');
    } catch (error) {
      Alert.alert('Error', error.error || 'Failed to book appointment');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>📅 Appointments</Text>
          <Text style={styles.screenSubtitle}>Book your next consultation</Text>
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.formLabel}>Select Doctor</Text>
          {doctors.length > 0 ? (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedDoctor}
                onValueChange={(itemValue) => setSelectedDoctor(itemValue)}
                style={styles.picker}
              >
                {doctors.map((doctor) => (
                  <Picker.Item key={doctor.id} label={doctor.full_name} value={doctor.id} />
                ))}
              </Picker>
            </View>
          ) : (
            <Text style={styles.noDataText}>No doctors available</Text>
          )}
          
          <Text style={styles.formLabel}>Select Date</Text>
          <TouchableOpacity style={styles.selectInput} onPress={() => setShowPicker(true)}>
            <Text style={styles.selectText}>{selectedDate.toLocaleDateString()}</Text>
            <Text style={styles.selectIcon}>📅</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker 
              value={selectedDate} 
              mode="date" 
              onChange={(e, d) => { setDate(d); setShowPicker(false) }} 
            />
          )}
          
          <Text style={styles.formLabel}>Select Time</Text>
          <TouchableOpacity style={styles.selectInput} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.selectText}>{time.toLocaleTimeString()}</Text>
            <Text style={styles.selectIcon}>🕐</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker 
              value={time} 
              mode="time" 
              onChange={(e, d) => { setTime(d); setShowTimePicker(false) }} 
            />
          )}
          
          <GradientButton
            title="Book Appointment"
            onPress={handleBook}
            colors={['#667eea', '#764ba2']}
            style={{ marginTop: 20 }}
          />
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

// ----- Consult -----
function ConsultScreen() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const user = await authAPI.getCurrentUser();
        if (user) {
          const data = await consultationAPI.getConsultationsByPatientId(user.id);
          setConsultations(data);
        }
      } catch (error) {
        console.error('Error fetching consultations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const startChat = () => {
    Alert.alert('Info', 'Chat functionality would start here');
  };

  const startVideoCall = () => {
    Alert.alert('Info', 'Video call functionality would start here');
  };

  return (
    <LinearGradient colors={['#ffecd2', '#fcb69f']} style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>💬 Consult Now</Text>
          <Text style={styles.screenSubtitle}>Connect with healthcare professionals</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading consultations...</Text>
          </View>
        ) : consultations.length > 0 ? (
          <View style={styles.consultationsContainer}>
            {consultations.map((consultation) => (
              <Card key={consultation.id} style={styles.consultationCard}>
                <Text style={styles.consultationTitle}>Dr. {consultation.doctor_name}</Text>
                <Text style={styles.consultationDate}>
                  {new Date(consultation.consultation_date).toLocaleDateString()}
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{consultation.status}</Text>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.noDataCard}>
            <Text style={styles.noDataText}>No consultations found</Text>
          </Card>
        )}
        
        <View style={styles.consultActions}>
          <GradientButton
            title="💬 Start Chat"
            onPress={startChat}
            colors={['#4facfe', '#00f2fe']}
            style={styles.consultButton}
          />
          
          <GradientButton
            title="📹 Video Call"
            onPress={startVideoCall}
            colors={['#43e97b', '#38f9d7']}
            style={styles.consultButton}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ----- Symptoms -----
function SymptomsScreen() {
  const [symptom, setSymptom] = useState('');
  const [loading, setLoading] = useState(false);

  const getRecommendation = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        Alert.alert('Recommendation', 'Based on your symptoms, we recommend consulting with a doctor.');
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to get recommendation');
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#fa709a', '#fee140']} style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>🩺 Symptoms Checker</Text>
          <Text style={styles.screenSubtitle}>Describe how you're feeling</Text>
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.formLabel}>Describe Your Symptoms</Text>
          <TextInput 
            style={styles.textArea} 
            placeholder="Tell us about your symptoms in detail..." 
            placeholderTextColor="#999" 
            multiline 
            numberOfLines={6}
            value={symptom} 
            onChangeText={setSymptom}
            textAlignVertical="top"
          />
          
          <GradientButton
            title={loading ? "Analyzing..." : "Get AI Recommendation"}
            onPress={getRecommendation}
            disabled={loading || !symptom.trim()}
            colors={['#667eea', '#764ba2']}
            style={{ marginTop: 20 }}
          />
        </Card>

        <Card style={styles.tipsCard}>
          <Text style={styles.cardTitle}>⚠️ Important Note</Text>
          <Text style={styles.tipText}>
            This AI analysis is for informational purposes only and should not replace professional medical advice. 
            Please consult with a healthcare provider for proper diagnosis and treatment.
          </Text>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

// ----- Chatbot -----
function ChatbotScreen() {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m your health assistant. How can I help you today?', isUser: false }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    
    const userMessage = { id: messages.length + 1, text: msg, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setMsg('');
    setLoading(true);
    
    try {
      setTimeout(() => {
        const botMessage = { 
          id: messages.length + 2, 
          text: 'I understand your concern. Based on what you\'ve described, I recommend scheduling a consultation with one of our healthcare professionals for a proper evaluation.', 
          isUser: false 
        };
        setMessages(prev => [...prev, botMessage]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      const errorMessage = { 
        id: messages.length + 2, 
        text: 'Sorry, I encountered an error. Please try again or contact support.', 
        isUser: false 
      };
      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>🤖 Health Assistant</Text>
          <Text style={styles.chatSubtitle}>AI-powered health guidance</Text>
        </View>

        <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
          {messages.map((message) => (
            <View 
              key={message.id} 
              style={[
                styles.messageBubble, 
                message.isUser ? styles.userMessage : styles.botMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.botMessageText
              ]}>
                {message.text}
              </Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.messageBubble, styles.botMessage]}>
              <Text style={styles.botMessageText}>Typing...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.chatInputContainer}>
          <TextInput 
            style={styles.chatInput} 
            placeholder="Umeze ute? Type your message..." 
            placeholderTextColor="#999" 
            value={msg} 
            onChangeText={setMsg} 
            onSubmitEditing={sendMessage}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendMessage} 
            disabled={loading || !msg.trim()}
          >
            <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.sendButtonGradient}>
              <Text style={styles.sendButtonText}>Send</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

// ----- Profile -----
function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image source={logo} style={styles.profileImage} />
          </View>
          <Text style={styles.profileName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || user?.phone || 'No contact info'}</Text>
        </View>

        <Card style={styles.profileCard}>
          <Text style={styles.cardTitle}>👤 Profile Information</Text>
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{user?.full_name || 'N/A'}</Text>
            </View>
            {user?.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            )}
            {user?.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type:</Text>
              <Text style={styles.infoValue}>{user?.user_type || 'Patient'}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.profileActions}>
          <GradientButton
            title="✏️ Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            colors={['#667eea', '#764ba2']}
            style={styles.profileButton}
          />
          
          <GradientButton
            title="🚪 Logout"
            onPress={handleLogout}
            colors={['#ff6b6b', '#ee5a24']}
            style={styles.profileButton}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ----- Edit Profile -----
function EditProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPatient = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);
        setFullName(currentUser.full_name);
        const patientData = await patientAPI.getPatientById(currentUser.id);
        setDateOfBirth(patientData.date_of_birth || '');
        setGender(patientData.gender || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPatient();
  }, []);

  const handleUpdate = async () => {
    try {
      await patientAPI.updatePatient(user.id, { full_name: fullName, date_of_birth: dateOfBirth, gender });
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#ffecd2', '#fcb69f']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#ffecd2', '#fcb69f']} style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>✏️ Edit Profile</Text>
          <Text style={styles.screenSubtitle}>Update your information</Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.formLabel}>Full Name</Text>
            <TextInput 
              style={styles.modernInput} 
              placeholder="Enter your full name" 
              placeholderTextColor="#999" 
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.formLabel}>Date of Birth</Text>
            <TextInput 
              style={styles.modernInput} 
              placeholder="YYYY-MM-DD" 
              placeholderTextColor="#999" 
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.formLabel}>Gender</Text>
            <TextInput 
              style={styles.modernInput} 
              placeholder="Enter your gender" 
              placeholderTextColor="#999" 
              value={gender}
              onChangeText={setGender}
            />
          </View>
          
          <GradientButton
            title="Update Profile"
            onPress={handleUpdate}
            colors={['#667eea', '#764ba2']}
            style={{ marginTop: 20 }}
          />
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

// ----- Main Tabs -----
function MainTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🏠</Text>
        }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>📅</Text>
        }}
      />
      <Tab.Screen 
        name="Consult" 
        component={ConsultScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>💬</Text>
        }}
      />
      <Tab.Screen 
        name="Symptoms" 
        component={SymptomsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🩺</Text>
        }}
      />
      <Tab.Screen 
        name="Chatbot" 
        component={ChatbotScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🤖</Text>
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>👤</Text>
        }}
      />
    </Tab.Navigator>
  );
}

// ----- App Container -----
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await authAPI.isAuthenticated();
        setIsLoggedIn(authenticated);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoggedIn === null) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Image source={logo} style={styles.loadingLogo} />
          <Text style={styles.loadingText}>ConnectCare</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={isLoggedIn ? "MainTabs" : "Login"}>
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Signup" component={SignupScreen}/>
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
        <Stack.Screen name="MainTabs" component={MainTabs}/>
        <Stack.Screen name="EditProfile" component={EditProfileScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ----- Styles -----
const styles = StyleSheet.create({
  // Auth Styles
  authContainer: {
    flex: 1,
  },
  authScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  authLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  authForm: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modernInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  gradientButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  switchButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  authLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  linkText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },

  // General Styles
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  // Dashboard Styles
  dashboardHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipsCard: {
    marginBottom: 30,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipBullet: {
    color: '#667eea',
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  emergencyButton: {
    marginHorizontal: 20,
    marginBottom: 30,
  },

  // Screen Header Styles
  screenHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Form Styles
  formCard: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  selectArrow: {
    color: '#999',
    fontSize: 12,
  },
  selectIcon: {
    fontSize: 18,
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  noDataText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noDataCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  // Consultation Styles
  consultationsContainer: {
    paddingHorizontal: 20,
  },
  consultationCard: {
    marginBottom: 15,
  },
  consultationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  consultationDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statusBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  consultActions: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  consultButton: {
    marginBottom: 15,
  },

  // Chat Styles
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  chatSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: '#4facfe',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  chatInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'flex-end',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Profile Styles
  profileHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  profileCard: {
    marginBottom: 20,
  },
  profileInfo: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  profileActions: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileButton: {
    marginBottom: 15,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },

  // Tab Bar Styles
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    height: 60,
    paddingBottom: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 20,
  },
});