import { Image } from "expo-image";
import { Button, Platform, StyleSheet, Switch, Text, View } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { connectMqtt, publishMQTT } from "@/lib/mqtt";
import { RootState } from "@/store";
import { Account } from "@/types/account";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { supabase } from "../../lib/supabase";

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const [isOn, setIsOn] = useState(false);
  const [users, setUsers] = useState<Account[]>([]);
  const { connected, temp, humi, rssid, checkStatus } = useSelector(
    (state: RootState) => state.mqtt,
  );
  useEffect(() => {
    loadUsers();
    connectMqtt();
  }, []);

  async function loadUsers() {
    const { data, error } = await supabase.from("account").select("*");

    if (error) {
      console.log("ERROR:", error);
    } else {
      setUsers(data);
    }
  }
  const thanh = (data: string) => data + "Hello from arrow function!";
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedText style={{ marginBottom: 16, fontWeight: "bold" }}>
        This is Number : {count} {"\n"}Edit this screen to start customizing
        your app!
      </ThemedText>
      <ThemedText style={{ marginBottom: 16, fontWeight: "bold" }}>
        This is Test Function : {thanh("Thành Com")}
      </ThemedText>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction
              title="Action"
              icon="cube"
              onPress={() => alert("Action pressed")}
            />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert("Share pressed")}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert("Delete pressed")}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">
            npm run reset-project
          </ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
      <Button title="Press me" onPress={() => setCount(count + 1)}></Button>
      <Button
        title={`Temp : ${temp} °C`}
        onPress={() => publishMQTT("test/topic", "Hello from Expo")}
      />
      <Switch
        value={isOn}
        disabled={!connected}
        onValueChange={(value) => {
          setIsOn(value);
          publishMQTT("blynk/control", value ? "ON" : "OFF");
        }}
      />

      <View style={{ padding: 16 }}>
        {users.map((item) => (
          <View
            key={item.id}
            style={{
              padding: 12,
              marginBottom: 10,
              borderRadius: 8,
              backgroundColor: "#eee",
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Full Name : {item.fullname}
            </Text>

            <Text>Email : {item.email}</Text>
            <Text>Phone : {item.phone}</Text>

            <Text style={{ color: item.active ? "green" : "red" }}>
              Status : {item.active ? "ACTIVE" : "INACTIVE"}
            </Text>
          </View>
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
