import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { apiPost } from "../services/api.client";
import { useAuth } from "../auth/AuthContext";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

export default function AuthScreen({ navigation }: Props) {
  const { setToken } = useAuth();
  const [phoneOrEmail, setPhoneOrEmail] = useState("demo@demo.com");
  const [password, setPassword] = useState("demo1234");
  const [mode, setMode] = useState<"login" | "signup">("signup");

  async function run() {
    if (mode === "signup") {
      const r = await apiPost<any>("/auth/signup", {
        role: "CUSTOMER",
        email: phoneOrEmail.includes("@") ? phoneOrEmail : undefined,
        phone: phoneOrEmail.includes("@") ? undefined : phoneOrEmail,
        password,
        name: "Demo Customer",
      });
      setToken(r.accessToken, "CUSTOMER");
    } else {
      const r = await apiPost<any>("/auth/login", { phoneOrEmail, password });
      setToken(r.accessToken, "CUSTOMER");
    }
    navigation.replace("Categories");
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>FieldHub 데모</Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable onPress={() => setMode("signup")} style={{ padding: 10, borderWidth: 1, borderRadius: 10, opacity: mode === "signup" ? 1 : 0.4 }}>
          <Text>회원가입</Text>
        </Pressable>
        <Pressable onPress={() => setMode("login")} style={{ padding: 10, borderWidth: 1, borderRadius: 10, opacity: mode === "login" ? 1 : 0.4 }}>
          <Text>로그인</Text>
        </Pressable>
      </View>

      <View style={{ gap: 6 }}>
        <Text>이메일 또는 전화</Text>
        <TextInput value={phoneOrEmail} onChangeText={setPhoneOrEmail} style={{ borderWidth: 1, padding: 10, borderRadius: 10 }} />
      </View>

      <View style={{ gap: 6 }}>
        <Text>비밀번호</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 10, borderRadius: 10 }} />
      </View>

      <Pressable onPress={run} style={{ padding: 14, borderWidth: 1, borderRadius: 12 }}>
        <Text style={{ textAlign: "center", fontWeight: "800" }}>{mode === "signup" ? "회원가입 후 시작" : "로그인 후 시작"}</Text>
      </Pressable>
    </View>
  );
}
