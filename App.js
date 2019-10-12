import React, {Component} from 'react';
import {Dimensions, ActivityIndicator, StyleSheet, Text, View, TextInput, TouchableWithoutFeedback, Keyboard, Image, Alert, TouchableOpacity, KeyboardAvoidingView,} from 'react-native';
import {RNCamera} from 'react-native-camera';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';

export default class App extends Component
{
    constructor(props) {
        super(props);
        this.state = {
          bestMatch: null
        };
      }
    
    render() {
        return (
          <View style={styles.container}>
            <RNCamera
              ref={ref => {
                this.camera = ref;
              }}
              style={styles.preview}
              type={RNCamera.Constants.Type.back}
              flashMode={RNCamera.Constants.FlashMode.on}
            />

            <SketchCanvas
            style={{position: 'relative', height: Dimensions.get('window').height - 100}}
            strokeColor={'red'}
            strokeWidth={7}
            />

            <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', height: 100}}>
              <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
                <Text style={{ fontSize: 14 }}> SNAP </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }
    
      takePicture = async() => {
        if (this.camera) {
          const options = { quality: 0.5, base64: true };
          const data = await this.camera.takePictureAsync(options);
          console.log(data.uri);
        }
      };
    }
    
    const styles = StyleSheet.create({
      container: {
        flexDirection: 'column',
        backgroundColor: 'black',
      },
      preview: {
        justifyContent: 'flex-end',
        alignItems: 'center',
      },
      capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
      },
      info: {
        fontSize: 20,
        color: "#ffffff",
        textAlign: 'center',
        fontWeight: "900",
        margin: 10,
      }
    })
