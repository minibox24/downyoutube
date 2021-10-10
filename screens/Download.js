import React from "react";
import { StyleSheet, View, Text } from "react-native";

export default function DownloadScreen({ navigation, route }) {
  console.log(route);
  return (
    <View style={styles.main}>
      <Text>{route.params.id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
