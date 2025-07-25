import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, Button, Platform, FlatList
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';

import logo from './assets/logo.png';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ----- Auth Screens -----
function LoginScreen({ navigation }) {
  return (
   <LinearGradient colors={['#FFC0CB','#ADD8E6']} style={styles.authContainer}>
      <Text style={styles.authTitle}>ConnectCare - Injira</Text>
      <TextInput style={styles.input} placeholder="Imeyili cyangwa telefoni" placeholderTextColor="#333" />
      <TextInput style={styles.input} placeholder="Ijambo ry’ibanga" secureTextEntry placeholderTextColor="#333" />
      <TouchableOpacity style={styles.authButton} onPress={() => navigation.replace('MainTabs')}>
        <Text style={styles.authButtonText}>Injira</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Funguza Konti</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Wibagiwe ijambo ry’ibanga?</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

function SignupScreen({ navigation }) {
  return (
    <LinearGradient colors={['#FFC0CB','#ADD8E6']} style={styles.authContainer}>
      <Text style={styles.authTitle}>ConnectCare - Signup</Text>
      <TextInput style={styles.input} placeholder="Amazina" placeholderTextColor="#333" />
      <TextInput style={styles.input} placeholder="Imeyili" keyboardType="email-address" placeholderTextColor="#333" />
      <TextInput style={styles.input} placeholder="Telefoni" keyboardType="phone-pad" placeholderTextColor="#333" />
      <TextInput style={styles.input} placeholder="Ijambo ry’ibanga" secureTextEntry placeholderTextColor="#333" />
      <TouchableOpacity style={styles.authButton} onPress={() => navigation.replace('MainTabs')}>
        <Text style={styles.authButtonText}>Emeza</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

function ForgotPasswordScreen({ navigation }) {
  return (
    <LinearGradient colors={['#FFC0CB','#ADD8E6']} style={styles.authContainer}>
      <Text style={styles.authTitle}>Wibagiwe ijambo?</Text>
      <TextInput style={styles.input} placeholder="Imeyili cyangwa telefoni" placeholderTextColor="#333" />
      <TouchableOpacity style={styles.authButton} onPress={() => alert('Reset link sent (mock)')}>
        <Text style={styles.authButtonText}>Ohereza link</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Garuka</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// ----- Dashboard -----
function DashboardScreen() {
  const actions = [
    { key:'1', label:'Book Appointment' },
    { key:'2', label:'Consult Now' },
    { key:'3', label:'Check Symptoms' },
    { key:'4', label:'Mental Health' },
    { key:'5', label:'Health Records' },
    { key:'6', label:'Emergency' },
  ];
  return (
    <LinearGradient colors={['#FFC0CB','#ADD8E6']} style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Murakaza neza kuri ConnectCare</Text>
      <FlatList 
        data={actions}
        numColumns={2}
        contentContainerStyle={styles.actionsContainer}
        renderItem={({item})=>(
          <TouchableOpacity style={styles.actionTile}>
            <Text style={styles.actionText}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Tip:</Text>
        <Text>Stay hydrated and rest well if feeling unwell.</Text>
      </View>
    </LinearGradient>
  );
}

// ----- Appointments -----
function AppointmentsScreen() {
  const [selectedDate,setDate]=useState(new Date());
  const [showPicker,setShowPicker]=useState(false);
  const [time,setTime]=useState(new Date());
  const [showTimePicker,setShowTimePicker]=useState(false);

  return (
    <LinearGradient colors={['#FFC0CB','#ADD8E6']} style={styles.scrollContainer}>
      <ScrollView contentContainerStyle={styles.innerScroll}>
        <Text style={styles.title}>📅 Appointments</Text>
        <TouchableOpacity style={styles.input} onPress={()=>setShowPicker(true)}>
          <Text>{selectedDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showPicker && <DateTimePicker value={selectedDate} mode="date" onChange={(e,d)=>{setDate(d);setShowPicker(false)}} />}
        <TouchableOpacity style={styles.input} onPress={()=>setShowTimePicker(true)}>
          <Text>{time.toLocaleTimeString()}</Text>
        </TouchableOpacity>
        {showTimePicker && <DateTimePicker value={time} mode="time" onChange={(e,d)=>{setTime(d);setShowTimePicker(false)}} />}
        <Button title="Book" onPress={()=>alert('Booked!')} color="#333" />
      </ScrollView>
    </LinearGradient>
  );
}

// ----- Consult -----
function ConsultScreen() {
  return (
    <LinearGradient colors={['#FFC0CB','#ADD8E6']} style={styles.container}>
      <Text style={styles.title}>💬 Consult Now</Text>
      <TouchableOpacity style={styles.authButton}>
        <Text style={styles.authButtonText}>Start Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.authButton}>
        <Text style={styles.authButtonText}>Start Video Call</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// ----- Symptoms -----
function SymptomsScreen() {
  const [symptom, setSymptom] = useState('');
  return (
    <LinearGradient colors={['#FFC0CB','#ADD8E6']} style={styles.scrollContainer}>
      <ScrollView contentContainerStyle={styles.innerScroll}>
        <Text style={styles.title}>📝 Symptoms</Text>
        <TextInput style={styles.input} placeholder="Describe your symptoms..." placeholderTextColor="#333" multiline value={symptom} onChangeText={setSymptom} />
        <Button title="Get Recommendation" onPress={() => alert('Mock result')} color="#333" />
      </ScrollView>
    </LinearGradient>
  );
}

// ----- Chatbot -----
function ChatbotScreen() {
  const [msg, setMsg] = useState('');
  return (
    <LinearGradient colors={['#FFC0CB','#ADD8E6']} style={styles.container}>
      <ScrollView style={styles.chatWindow}>
        <Text style={styles.chatBubble}>Chatbot: Hello, how are you?</Text>
      </ScrollView>
      <View style={styles.chatInputRow}>
        <TextInput style={styles.chatInput} placeholder="Umeze ute?" placeholderTextColor="#333" value={msg} onChangeText={setMsg} />
        <Button title="Send" onPress={()=>alert('Mock send')} color="#333" />
      </View>
    </LinearGradient>
  );
}

// ----- Profile -----
function ProfileScreen({ navigation }) {
  return (
    <LinearGradient colors={['#FFC0CB','#ADD8E6']} style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>
      <Text>Name: David Kayumba</Text>
      <Text>Email: d.kayumba1@alustundent.com</Text>
      <TouchableOpacity style={styles.authButton} onPress={()=>navigation.replace('Login')}>
        <Text style={styles.authButtonText}>Logout</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// ----- Main Tabs -----
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Consult" component={ConsultScreen} />
      <Tab.Screen name="Symptoms" component={SymptomsScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ----- App Container -----
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Signup" component={SignupScreen}/>
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
        <Stack.Screen name="MainTabs" component={MainTabs}/>
      </Stack.Navigator>
      <StatusBar style="dark"/>
    </NavigationContainer>
  );
}

// ----- Styles -----
const styles = StyleSheet.create({
  authContainer: { flex:1, justifyContent:'center', padding:20 },
  authTitle: { fontSize:26,fontWeight:'bold',marginBottom:20,color:'#333' },
  authButton: { backgroundColor:'#333',padding:15,borderRadius:10,alignItems:'center',marginBottom:15 },
  authButtonText:{color:'#fff',fontWeight:'bold',fontSize:16},
  link:{color:'#333',textAlign:'center',textDecorationLine:'underline',marginTop:5},

  container:{flex:1,alignItems:'center',justifyContent:'center',padding:20},
  scrollContainer:{flex:1},
  innerScroll:{flexGrow:1,alignItems:'center',justifyContent:'center',padding:20},
  logo:{width:100,height:100,marginBottom:20,resizeMode:'contain'},
  title:{fontSize:24,fontWeight:'bold',marginBottom:15,color:'#333'},
  subtitle:{fontSize:16,color:'#333',marginBottom:10},
  input:{backgroundColor:'#fff',width:'100%',padding:15,borderRadius:10,marginBottom:15,color:'#333'},
  actionsContainer:{alignItems:'center'},
  actionTile:{backgroundColor:'#fff',padding:20,margin:10,borderRadius:10,width:140,alignItems:'center'},
  actionText:{color:'#333',textAlign:'center'},
  tipCard:{backgroundColor:'#fff',padding:15,marginTop:20,borderRadius:10,width:'100%'},
  tipTitle:{fontWeight:'bold',marginBottom:5},
  chatWindow:{padding:10,flex:1,width:'100%',marginBottom:10},
  chatBubble:{backgroundColor:'#fff',padding:10,borderRadius:10,marginBottom:10},
  chatInputRow:{flexDirection:'row',padding:10,alignItems:'center'},
  chatInput:{backgroundColor:'#fff',flex:1,padding:10,borderRadius:10,marginRight:10,color:'#333'}
});
