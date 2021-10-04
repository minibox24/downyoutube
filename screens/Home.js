import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = React.useState("");

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
        onPress={() => navigation.navigate("Details")}
        style={styles.buttonContainer}
      >
        <Text style={styles.buttonText}>검색</Text>
      </TouchableOpacity>
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
});
