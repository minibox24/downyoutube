import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";

import { openBrowserAsync } from "expo-web-browser";

export default function HomeScreen({ navigation, route }) {
  const [query, setQuery] = React.useState("");

  const appDownload = () => {
    openBrowserAsync("about:blank");
  };

  React.useEffect(() => {
    if (Platform.OS === "web") {
      if (window.location.pathname === "/watch") {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());

        if (params.v) {
          navigation.navigate("Details", { query: params.v });
        }
      }
    }
  }, []);

  return (
    <View style={styles.main}>
      <Text style={styles.title}>다운youtube</Text>
      <TextInput
        style={[
          styles.input,
          Platform.OS === "web" ? { outline: "none", maxWidth: 400 } : {},
        ]}
        value={query}
        onChangeText={setQuery}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("Details", { query })}
        style={styles.buttonContainer}
      >
        <Text style={styles.buttonText}>검색</Text>
      </TouchableOpacity>

      {Platform.OS === "web" ? (
        <Text onPress={() => appDownload()} style={styles.appDownloadButton}>
          안드로이드 앱 다운로드
        </Text>
      ) : (
        <View style={{ marginTop: "auto" }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontFamily: "pretendard",
    marginBottom: 10,
    marginTop: "auto",
  },
  input: {
    width: "90%",
    maxWidth: 300,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    marginBottom: 10,
    textAlign: "center",
  },
  buttonContainer: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "#747F8D",
    borderRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
  },
  appDownloadButton: {
    marginTop: "auto",
    marginBottom: 10,
    color: "#0074CC",
    fontWeight: "bold",
  },
});
