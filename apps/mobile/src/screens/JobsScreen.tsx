import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { apiGet } from "../services/api.client";
import { Job } from "../types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Jobs">;

export default function JobsScreen({ route, navigation }: Props) {
  const { category } = route.params;
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    apiGet<Job[]>(`/categories/${category.id}/jobs`).then(setJobs).catch(console.error);
  }, [category.id]);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>{category.nameKo}</Text>
      <FlatList
        data={jobs}
        keyExtractor={(x) => x.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("DynamicForm", { categoryId: category.id, jobId: item.id, jobName: item.name })}
            style={{ padding: 12, borderWidth: 1, marginBottom: 10, borderRadius: 10 }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.name}</Text>
            <Text>가격모델: {item.priceModel?.type}</Text>
            <Text>기본소요: {item.baseDurationMin}분</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
