import React from "react";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/Home";
import DetailsScreen from "./screens/Details";
import DownloadScreen from "./screens/Download";

function App() {
  const Stack = createNativeStackNavigator();
  const [isReady, setIsReady] = React.useState(false);

  const LoadFonts = async () => {
    await Font.loadAsync({
      pretendard: require("./assets/fonts/Pretendard-Black.otf"),
    });
  };

  if (!isReady) {
    return (
      <AppLoading
        startAsync={LoadFonts}
        onFinish={() => setIsReady(true)}
        onError={console.warn}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen
          name="Download"
          component={DownloadScreen}
          options={{ headerLeft: () => null }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
