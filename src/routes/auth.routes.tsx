import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Signup from '../pages/Signup';
import Signin from '../pages/Signin';

const Auth = createStackNavigator();

const AuthRoutes: React.FC = () => (
  <Auth.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#312e38' },
    }}
  >
    <Auth.Screen name="Signin" component={Signin} />
    <Auth.Screen name="Signup" component={Signup} />
  </Auth.Navigator>
);

export default AuthRoutes;
