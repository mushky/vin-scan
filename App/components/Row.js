import React from "react";
import { View, StyleSheet, Text } from "react-native";

import colors from "../constants/colors";

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
    borderRadius: 5,
    padding: 12,
  },
  textRowTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.blue,
  },
  textRowValue: {
    fontSize: 12,
    fontWeight: "normal",
    color: colors.text,
  },
});

export const Row = ({ titleText, valueText }) => (
  <View style={styles.container}>
    <Text style={styles.textRowTitle}>{titleText.toUpperCase()}</Text>
    <Text style={styles.textRowValue}>{valueText}</Text>
  </View>
);
// const Square = ({ text, bgColor = "#7ce0f9" }) => (
//   <View style={[styles.box, { backgroundColor: bgColor }]}>
//     <Text>{text}</Text>
//   </View>
// );
