import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../auth/AuthContext";
import AuthScreen from "../screens/AuthScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import JobsScreen from "../screens/JobsScreen";
import DynamicFormScreen from "../screens/DynamicFormScreen";
import BookingDetailScreen from "../screens/BookingDetailScreen";

export type RootStackParamList = {
  Auth: undefined;
  Categories: undefined;
  Jobs: { category: { id: string; nameKo: string } };
  DynamicForm: { categoryId: string; jobId: string; jobName: string };
  BookingDetail: { bookingId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { token } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ title: "인증" }} />
        ) : (
          <>
            <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: "카테고리" }} />
            <Stack.Screen name="Jobs" component={JobsScreen} options={{ title: "작업 선택" }} />
            <Stack.Screen name="DynamicForm" component={DynamicFormScreen} options={{ title: "예약 정보" }} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: "예약 상세" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
