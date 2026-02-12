import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { apiGet } from "../services/api.client";
import { Category } from "../types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Categories">;

export default function CategoriesScreen({ navigation }: Props) {
  const [items, setItems] = useState<Category[]>([]);

  useEffect(() => {
    apiGet<Category[]>("/categories").then(setItems).catch(console.error);
  }, []);

  return (
    <View style={{ padding: 16 }}>
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("Jobs", { category: { id: item.id, nameKo: item.nameKo } })}
            style={{ padding: 12, borderWidth: 1, marginBottom: 10, borderRadius: 10 }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.nameKo}</Text>
            <Text>Tier {item.tier}</Text>
            {item.description ? <Text>{item.description}</Text> : null}
          </Pressable>
        )}
      />
    </View>
  );
}
