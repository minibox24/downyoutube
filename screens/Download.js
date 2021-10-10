import React from "react";
import { StyleSheet, View, Text } from "react-native";

export default function DownloadScreen({ navigation, route }) {
  let [key, setKey] = React.useState(null);
  let [loop, setLoop] = React.useState(null);
  const [data, setData] = React.useState({ progress: 0, status: "created" });

  React.useEffect(() => {
    (async () => {
      const response = await fetch(`http://127.0.0.1:8000/download`, {
        method: "POST",
        body: JSON.stringify({
          url: `https://youtu.be/${route.params.id}`,
          audio: route.params.audio,
        }),
      });

      const responseJson = await response.json();

      setKey(responseJson.key);
      key = responseJson.key;
    })();

    const intervalId = setInterval(async () => {
      if (!key) return;

      const response = await fetch(`http://127.0.0.1:8000/status?key=${key}`);
      const responseJson = await response.json();

      setData(responseJson);

      if (responseJson.status === "finished") {
        clearInterval(loop);
      }
    }, 1000);

    setLoop(intervalId);
    loop = intervalId;

    return () => {
      clearInterval(loop);
    };
  }, []);

  return (
    <View style={styles.main}>
      <Text>{route.params.id}</Text>
      <Text>{key}</Text>
      <Text>{data.progress}</Text>
      <Text>{data.status}</Text>
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
