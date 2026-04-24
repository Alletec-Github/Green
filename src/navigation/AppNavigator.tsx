import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Typography, Layout} from '../theme';
import {
  RootStackParamList,
  MainTabParamList,
  DashboardStackParamList,
  UploadStackParamList,
  ManualEntryStackParamList,
  HistoryStackParamList,
} from '../types';

// ─── Placeholder Screens (replaced by actual implementations) ────────────────

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import UploadScreen from '../screens/UploadScreen';
import ManualEntryScreen from '../screens/ManualEntryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

// ─── Navigators ──────────────────────────────────────────────────────────────

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const UploadStack = createNativeStackNavigator<UploadStackParamList>();
const ManualEntryStack = createNativeStackNavigator<ManualEntryStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();

// ─── Tab Icon Map ────────────────────────────────────────────────────────────

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  DashboardTab: 'view-dashboard',
  UploadTab: 'cloud-upload',
  ManualEntryTab: 'pencil-plus',
  HistoryTab: 'history',
  SettingsTab: 'cog',
};

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  DashboardTab: 'Dashboard',
  UploadTab: 'Upload',
  ManualEntryTab: 'New Entry',
  HistoryTab: 'History',
  SettingsTab: 'Settings',
};

// ─── Stack Navigators ────────────────────────────────────────────────────────

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: Colors.surface},
        headerTintColor: Colors.text,
        headerTitleStyle: {fontWeight: '600', fontSize: 17},
        headerShadowVisible: false,
      }}>
      <DashboardStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{headerShown: false}}
      />
      <DashboardStack.Screen
        name="ScopeDetail"
        component={DashboardScreen}
        options={({route}) => ({
          title: route.params.title,
        })}
      />
    </DashboardStack.Navigator>
  );
}

function UploadStackScreen() {
  return (
    <UploadStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: Colors.surface},
        headerTintColor: Colors.text,
        headerTitleStyle: {fontWeight: '600', fontSize: 17},
        headerShadowVisible: false,
      }}>
      <UploadStack.Screen
        name="Upload"
        component={UploadScreen}
        options={{title: 'Upload Bill'}}
      />
    </UploadStack.Navigator>
  );
}

function ManualEntryStackScreen() {
  return (
    <ManualEntryStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: Colors.surface},
        headerTintColor: Colors.text,
        headerTitleStyle: {fontWeight: '600', fontSize: 17},
        headerShadowVisible: false,
      }}>
      <ManualEntryStack.Screen
        name="ManualEntry"
        component={ManualEntryScreen}
        options={{title: 'New Entry'}}
      />
    </ManualEntryStack.Navigator>
  );
}

function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: Colors.surface},
        headerTintColor: Colors.text,
        headerTitleStyle: {fontWeight: '600', fontSize: 17},
        headerShadowVisible: false,
      }}>
      <HistoryStack.Screen
        name="History"
        component={HistoryScreen}
        options={{title: 'History'}}
      />
    </HistoryStack.Navigator>
  );
}

// ─── Main Tab Navigator ──────────────────────────────────────────────────────

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => (
          <Icon name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
        tabBarLabel: TAB_LABELS[route.name],
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: Typography.tabLabel,
        tabBarStyle: {
          height: Layout.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 4,
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        headerShown: false,
      })}>
      <Tab.Screen name="DashboardTab" component={DashboardStackScreen} />
      <Tab.Screen name="UploadTab" component={UploadStackScreen} />
      <Tab.Screen name="ManualEntryTab" component={ManualEntryStackScreen} />
      <Tab.Screen name="HistoryTab" component={HistoryStackScreen} />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Settings',
          headerStyle: {backgroundColor: Colors.surface},
          headerTitleStyle: {fontWeight: '600', fontSize: 17},
          headerShadowVisible: false,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ──────────────────────────────────────────────────────────

interface AppNavigatorProps {
  isLoggedIn: boolean;
}

export default function AppNavigator({isLoggedIn}: AppNavigatorProps) {
  return (
    <RootStack.Navigator screenOptions={{headerShown: false}}>
      {isLoggedIn ? (
        <RootStack.Screen name="Main" component={MainTabs} />
      ) : (
        <RootStack.Screen name="Login" component={LoginScreen} />
      )}
    </RootStack.Navigator>
  );
}
