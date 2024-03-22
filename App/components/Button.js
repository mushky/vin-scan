import React from "react";
import { View,TouchableOpacity, Text, StyleSheet } from "react-native";

import colors from "../constants/colors";

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.orange,
        marginVertical: 10,
        marginHorizontal: 20,
        flexDirection: "row",
        borderRadius: 5,
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center"
        // alignItems: "center",
        // justifyContent: "center",
        //paddingHorizontal: 40
    },
    button: {
        flex: 1,
        padding: 10,


    //   flexDirection: "row",
    //   alignItems: "center",

    //   marginVertical: 12,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.white,
      textAlign: "center",
    //   backgroundColor: colors.white
    },
  })
  

export const Button = ({ onPress, text, backgroundColor = colors.orange }) => {
    return (
        <View style={[styles.container, {backgroundColor}]} >      
            <TouchableOpacity onPress={onPress} style={styles.button}>
            <Text style={styles.buttonText}>{text}</Text>
            </TouchableOpacity>
        </View>
    );
}