import { Stack, withLayoutContext } from "expo-router";
import {
  createStackNavigator,
  StackNavigationEventMap,
  StackNavigationOptions,
  TransitionPresets,
} from "@react-navigation/stack";
import { ParamListBase, StackNavigationState } from "@react-navigation/native";

const { Navigator } = createStackNavigator();

export const JsStack = withLayoutContext<
  StackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  StackNavigationEventMap
>(Navigator);
