import React from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import { openBrowserAsync } from "expo-web-browser";

export default function DetailsScreen({ navigation, route }) {
  const [data, setData] = React.useState({
    loaded: false,
    id: null,
    title: null,
    thumbnail: null,
    uploader: null,
    m4aUrl: null,
  });

  const audioAlert = () => {
    Alert.alert("음성", "포맷을 선택해주세요.", [
      {
        text: "mp3",
        onPress: () => download(true),
      },
      {
        text: "m4a",
        onPress: () => openBrowserAsync(data.m4aUrl),
      },
    ]);
  };

  const download = (audio) => {
    navigation.navigate("Download", { id: data.id, audio: audio });
  };

  React.useEffect(() => {
    fetch(
      `https://c82a-58-123-152-78.ngrok.io/info?query=${route.params.query}`
    )
      .then((res) => res.json())
      .then((data) => {
        setData({
          loaded: true,
          id: data.id,
          title: data.title,
          thumbnail: data.thumbnail,
          uploader: data.uploader,
          m4aUrl: data.m4a_url,
        });
      })
      .catch((_) => {
        Alert.alert("오류 발생", "영상을 불러오던 중 오류가 발생했습니다.");
        navigation.goBack();
      });
  }, []);

  if (!data.loaded) {
    return (
      <View style={styles.main}>
        <ActivityIndicator size="large" color="#00ccff" />
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <Image
        source={{ uri: data.thumbnail }}
        style={{
          width: 320,
          height: 180,
          resizeMode: "contain",
        }}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {data.title}
        </Text>
        <Text numberOfLines={1}>{data.uploader}</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          onPress={() => download(false)}
          style={styles.buttonContainer}
        >
          <Text style={styles.buttonText}>영상</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => audioAlert(true)}
          style={styles.buttonContainer}
        >
          <Text style={styles.buttonText}>음성</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    width: 320,
    marginTop: 15,
  },
  title: {
    fontSize: 17,
  },
  buttons: {
    marginTop: 30,
    width: 320,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  buttonContainer: {
    margin: 5,
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
