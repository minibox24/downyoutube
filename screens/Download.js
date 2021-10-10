import React from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";

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

      if (
        responseJson.progress == 100 &&
        responseJson.status === "downloading"
      ) {
        responseJson.status = "converting";
      }

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

  const status = {
    created: "준비 중",
    downloading: "다운로드 중",
    converting: "변환 중",
    finished: "완료",
  }[data.status];

  return (
    <View style={styles.main}>
      {data.status !== "finished" ? (
        <ActivityIndicator
          size="large"
          color="#00ccff"
          style={{ marginBottom: 10 }}
        />
      ) : null}

      <Text>{status}</Text>

      {data.status !== "finished" ? (
        <Text>{data.progress.toFixed(2)}%</Text>
      ) : null}
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
