import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { apiGet } from "../services/api.client";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "BookingDetail">;

export default function BookingDetailScreen({ route }: Props) {
  const { bookingId } = route.params;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiGet<any>(`/bookings/${bookingId}`).then(setData).catch(console.error);
  }, [bookingId]);

  if (!data) return <View style={{ padding: 16 }}><Text>Loading...</Text></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>예약 #{data.id}</Text>
      <Text>상태: {data.status}</Text>
      <Text>카테고리: {data.category?.nameKo}</Text>
      <Text>작업: {data.job?.name}</Text>

      <Text style={{ marginTop: 10, fontWeight: "700" }}>입력</Text>
      {data.inputs?.map((x: any) => (
        <Text key={x.id}>- {x.fieldKey}: {x.valueText ?? JSON.stringify(x.valueJson)}</Text>
      ))}
    </ScrollView>
  );
}
