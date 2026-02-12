import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { apiGet, apiPost } from "../services/api.client";
import { CreateBookingPayload, InputField } from "../types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "DynamicForm">;

function isoNowPlusHours(h: number) {
  const d = new Date(Date.now() + h * 3600 * 1000);
  return d.toISOString();
}

export default function DynamicFormScreen({ route, navigation }: Props) {
  const { categoryId, jobId, jobName } = route.params;
  const [fields, setFields] = useState<InputField[]>([]);
  const [values, setValues] = useState<Record<string, any>>({ scheduled_at: isoNowPlusHours(24) });

  useEffect(() => {
    apiGet<InputField[]>(`/categories/${categoryId}/input-fields`).then(setFields).catch(console.error);
  }, [categoryId]);

  const requiredKeys = useMemo(() => fields.filter((f) => f.required).map((f) => f.fieldKey), [fields]);
  const canSubmit = useMemo(() => requiredKeys.every((k) => values[k] !== undefined && values[k] !== ""), [requiredKeys, values]);

  async function submit() {
    const payload: CreateBookingPayload = {
      categoryId,
      jobId,
      scheduledAt: values["scheduled_at"] ?? isoNowPlusHours(24),
      addressText: values["address"] ?? undefined,
      inputs: fields.map((f) => ({
        fieldKey: f.fieldKey,
        valueText: typeof values[f.fieldKey] === "string" ? values[f.fieldKey] : undefined,
        valueJson: typeof values[f.fieldKey] !== "string" ? values[f.fieldKey] : undefined,
      })),
      priceQuoteTotal: 0,
    };

    const created = await apiPost<any>("/bookings", payload);
    navigation.replace("BookingDetail", { bookingId: created.id });
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>{jobName}</Text>

      <View style={{ gap: 6 }}>
        <Text>희망 일정(ISO)</Text>
        <TextInput value={values["scheduled_at"] ?? ""} onChangeText={(t) => setValues((p) => ({ ...p, scheduled_at: t }))} style={{ borderWidth: 1, padding: 10, borderRadius: 10 }} />
      </View>

      {fields
        .filter((f) => f.fieldKey !== "scheduled_at")
        .map((f) => (
          <View key={f.fieldKey} style={{ gap: 6 }}>
            <Text>
              {f.label} {f.required ? "(필수)" : ""}
            </Text>
            <TextInput value={values[f.fieldKey] ?? ""} onChangeText={(t) => setValues((p) => ({ ...p, [f.fieldKey]: t }))} placeholder={f.type} style={{ borderWidth: 1, padding: 10, borderRadius: 10 }} />
          </View>
        ))}

      <Pressable onPress={submit} disabled={!canSubmit} style={{ padding: 14, borderWidth: 1, borderRadius: 12, opacity: canSubmit ? 1 : 0.4 }}>
        <Text style={{ textAlign: "center", fontWeight: "700" }}>예약 생성</Text>
      </Pressable>
    </ScrollView>
  );
}
