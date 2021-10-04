import React from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";

export default function DetailsScreen({ navigation, route }) {
  const [data, setData] = React.useState({
    loaded: false,
    id: null,
    title: null,
    thumbnail: null,
    uploader: null,
  });

  React.useEffect(() => {
    fetch(`https://dyapi.loca.lt/info?query=${route.params.query}`)
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
      <Text>{data.id}</Text>
      <Text>{data.title}</Text>
      <Text>{data.uploader}</Text>
      <Image
        source={{ uri: data.thumbnail }}
        style={{ width: 305, height: 159 }}
      />
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
