import React from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function DetailsScreen({ navigation, route }) {
  const [data, setData] = React.useState({
    loaded: false,
    id: null,
    title: null,
    thumbnail: null,
    uploader: null,
  });

  const download = (audio) => {
    navigation.navigate("Download", { id: data.id, audio: audio });
  };

  React.useEffect(() => {
    fetch(`http://127.0.0.1:8000/info?query=${route.params.query}`)
      .then((res) => res.json())
      .then((data) => {
        setData({
          loaded: true,
          id: data.id,
          title: data.title,
          thumbnail: data.thumbnail,
          uploader: data.uploader,
        });
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
          onPress={() => download(true)}
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
