import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Keyboard
} from "react-native";
import {Entypo} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition, {
  TextRecognitionResult,
} from '@react-native-ml-kit/text-recognition';


import colors from "../constants/colors";
import { api } from "../util/api";
import { VINInput } from "../components/VINInput";
import { Button } from "../components/Button";
import { Row } from "../components/Row";

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.blue,
    flex: 1,
    alignItems: "center",
    paddingTop: 100,
  },
  textHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 12,
  },
  box: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
});

export default () => {
  const [value, _setValue] = useState(""); //11111111111111111
  const [isValidVIN, setIsValidVIN] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();
  const screen = Dimensions.get("screen");

  const dataArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  useEffect(() => {}, []);


  const setValue = text => {
    _setValue(text);
    if (validateVin(text) == true) {
      setIsValidVIN(true);
    } else {
      setData(null);
      setIsValidVIN(false);
    }


  };

  // Api calling from separate file with Async/Awaits
  const fetchCarDailFromAPI = async () => {
    try {
      setIsLoading(true);
      console.log('going to fetch data from new method....');
      const myData = await api.fetchCarDetailFromAPI(value);
      setData(myData);
    } catch (error) {
      console.log(error); 
    } finally {
      setIsLoading(false);
    }
  };

    // Api calling from separate file with Promises
  const fetchCarDetailFromAPIUsingPromises = () => {
    setIsLoading(true);
    api.fetchCarDetailFromAPI(value).then( (myData) => {
      console.log('myData: ', myData);
      setData(myData);
    }).finally( () => {
      setIsLoading(false);
    });
  };

  // Direct API calling inside code
  const fetchCarDetail = async () => {
    try {
      console.log("going to fetch vin: ", value);
      setIsLoading(true);

      const response = await fetch(
        `https://api.api-ninjas.com/v1/vinlookup?vin=${value}`,
        {
          method: "GET",
          headers: new Headers({
            "X-Api-Key": "hqCrlYgoMZN7erSy1+qjpA==FNqgB7SOfEFbRwJg",
          }),
        }
      );

      setData(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    

    if (!result.canceled) {

      setValue("")

      setSelectedImage(result.assets[0].uri);
      console.log(result);
      
      const _result = await TextRecognition.recognize(result.assets[0].uri);      
      //console.log('Recognized text:', _result.text);
      
      for (let block of _result.blocks) {
        const _vin  = block.text.replace(/\s/g, "");
        console.log('Block text:', _vin);
        //console.log('Block frame:', block.frame);


        if (_vin.length == 17) {
          setValue(_vin);
          break;
        }

      
        // for (let line of block.lines) {
        //   console.log('Line text:', line.text);
        //   console.log('validate vin: ', validate_vin(line.text))
        //   //console.log('Line frame:', line.frame);
        // }
      }


    } else {
      alert('You did not select any image.');
    }
  };
  const takePhoto = async () => {
    try {
      const cameraResp = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });

      if (!cameraResp.canceled) {
        setValue("")
        setSelectedImage(cameraResp.assets[0].uri);
        console.log(cameraResp);

        const _result = await TextRecognition.recognize(cameraResp.assets[0].uri);      
        
        for (let block of _result.blocks) {
          const _vin  = block.text.replace(/\s/g, "");
          console.log('Block text:', _vin);  
  
          if (_vin.length == 17) {
            setValue(_vin);
            break;
          }
        }


      } else {
        alert('You did not select any image.');
      }
    } catch (e) {
      alert("Error Uploading Image " + e.message);
    }
  };

  function validateVin(vin) {
    return validate(vin);
  
  
    // source: https://en.wikipedia.org/wiki/Vehicle_identification_number#Example_Code
    // ---------------------------------------------------------------------------------
    function transliterate(c) {
      return '0123456789.ABCDEFGH..JKLMN.P.R..STUVWXYZ'.indexOf(c) % 10;
    }
  
    function get_check_digit(vin) {
      var map = '0123456789X';
      var weights = '8765432X098765432';
      var sum = 0;
      for (var i = 0; i < 17; ++i)
        sum += transliterate(vin[i]) * map.indexOf(weights[i]);
      return map[sum % 11];
    }
  
    function validate(vin) {
        if (vin.length !== 17) return false;
        return get_check_digit(vin) === vin[8];
      }
      // ---------------------------------------------------------------------------------
  }
    // permission check
    if (permission?.status !== ImagePicker.PermissionStatus.GRANTED) {
      return (
        <View style={styles.container}>
          <Text style={styles.textHeader}>Permission Not Granted - {permission?.status}</Text>
          <StatusBar style="auto" />
          <Button text="Request Permission" onPress={requestPermission}></Button>
        </View>
      );
    }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.blue} />
      <Text style={styles.textHeader}>Enter or Scan VIN Number</Text>
      <VINInput
        leftIcon={<Entypo name="camera" size={24} color="black" />}
        value={value}
        onButtonPress={takePhoto}
        rightIcon={<Entypo name="images" size={24} color="black" />}
        onRightButtonPress={pickImageAsync}
        // keyboardType="numeric"
        onChangeText={(text) => {
          setValue(text);
        }}
      />
      {/* {isValidVIN && (
        <Button
          onPress={() => {
            Keyboard.dismiss();
            fetchCarDetail();
          }}
          text="Fetch VIN Information"
          backgroundColor={colors.blue}
        />
      )} */}
        <Button
          onPress={() => {
            Keyboard.dismiss();
            fetchCarDailFromAPI();
            //fetchCarDetail();
          }}
          text="Fetch VIN Information"
          backgroundColor={isValidVIN ? colors.green : colors.orange}
        />

      {isLoading && <ActivityIndicator color={colors.white} size="large" />}
      {data !== null && (
        <ScrollView style={{ width: screen.width * 0.9, marginTop: 12 }}>
          {Object.keys(data).map((item, index) => (
            <Row key={item} titleText={item} valueText={data[item]} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};
