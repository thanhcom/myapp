import { Link, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ModalScreen() {
  const { step, title, id, name, phone, email } = useLocalSearchParams<{
    step?: string;
    title?: string;
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
  }>();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
      <ThemedText
        type="defaultSemiBold"
        style={{ marginTop: 20, color: "blue" }}
      >
        Step : {step} - Title : {title}
      </ThemedText>
      <ThemedView
        style={{
          marginTop: 20,
          backgroundColor: "#f0f0f0",
          padding: 10,
          borderRadius: 8,
        }}
      >
        <ThemedText style={{ color: "#1d3b56" }} type="defaultSemiBold">
          User Details : {name}
        </ThemedText>
        <ThemedText style={{ color: "red" }} type="default">
          ID: {id}
        </ThemedText>
        <ThemedText style={{ color: "red" }} type="default">
          Name: {name}
        </ThemedText>
        <ThemedText style={{ color: "red" }} type="default">
          Phone: {phone}
        </ThemedText>
        <ThemedText style={{ color: "red" }} type="default">
          Email: {email}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
