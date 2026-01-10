import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { SignupScreen } from '../../features/auth/screens/SignupScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator
      id="auth-stack"
      screenOptions={{
        headerStyle: { backgroundColor: '#FFF' },
        headerTintColor: '#007AFF',
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          title: 'Create Account',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
    </Stack.Navigator>
  );
}
