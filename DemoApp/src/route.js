import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Recording } from './container/index';
import firebase from '@react-native-firebase/app'

const Stack = createStackNavigator();


class App extends React.Component {
  constructor(props) {
    super(props);
  }


  componentDidMount(){
    firebase.initializeApp();

  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Recording" component={Recording} />
        </Stack.Navigator>
      </NavigationContainer >
    );
  }
}


export default App;