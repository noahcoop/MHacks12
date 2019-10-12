import React, {Component} from 'react';
import {Dimensions, ImageBackground, StyleSheet, Text, View, TextInput, TouchableWithoutFeedback, Keyboard, Image, Alert, TouchableOpacity, KeyboardAvoidingView,} from 'react-native';
import {RNCamera} from 'react-native-camera';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import ViewShot from 'react-native-view-shot'

export default class App extends Component
{
    constructor(props) {
        super(props);
        this.state = {
          camera: true,
          uri: "",
          base64: "",
          draw: false,
          minX: 0,
          minY: 0,
          maxX: Dimensions.get('window').width,
          maxY: Dimensions.get('window').height - 100
        };
      }

    getNums = (str) => {
      var i = 0;
      tempStrX = ""
      tempStrY = ""
      while (str[i] != ",")
      {
        tempStrX += str[i]
        i++
      }
      i++
      while (i != str.length)
      {
        tempStrY += str[i]
        i++
      }
      var coords = {
        x: parseInt(tempStrX),
        y: parseInt(tempStrY)
      }
      return coords
    }

    clear = () => {
      this.pad.clear()
      this.setState({minX: 0, minY: 0, maxX: Dimensions.get('window').width, maxY:  Dimensions.get('window').height - 100 })
    }

    captureScreen = () => {
      this.refs.viewShot.capture().then(uri => {
        console.log("do something with ", uri);
      });
    }
    
    render() {
        return (
          <View style={styles.container}>
          {this.state.camera && <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
          />}
          {!this.state.camera && 
          <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>
            <ImageBackground
             source = {{uri: this.state.uri}}
             style = {{width: Dimensions.get('window').width, height: Dimensions.get('window').height - 100}}>
            <SketchCanvas
              ref={ref => {
                this.pad = ref;
              }}
              eraseComponent={<View style={styles.functionButton}><Text style={{color: 'white'}}>Eraser</Text></View>}
              style={{position: 'relative', height: Dimensions.get('window').height - 100, opacity: 0.5}}
              strokeColor={'blue'}
              strokeWidth={5}
              onStrokeEnd = {(path) => {
                var maxX = this.getNums(path.path.data[0]).x
                var minX = this.getNums(path.path.data[0]).x
                var maxY = this.getNums(path.path.data[0]).y
                var minY = this.getNums(path.path.data[0]).y
                
                for (var i = 0; i < path.path.data.length; i++)
                {
                  if (this.getNums(path.path.data[i]).x < minX)
                  {
                    minX = this.getNums(path.path.data[i]).x
                  }
                  if (this.getNums(path.path.data[i]).x > maxX)
                  {
                    maxX = this.getNums(path.path.data[i]).x
                  }
                  if (this.getNums(path.path.data[i]).y < minY)
                  {
                    minY = this.getNums(path.path.data[i]).y
                  }
                  if (this.getNums(path.path.data[i]).y > maxY)
                  {
                    maxY = this.getNums(path.path.data[i]).y
                  }
                }

                this.setState({minX: minX, minY: minY, maxX: maxX, maxY: maxY})

                console.log(minX, minY, maxX, maxY)

              }}
            />  
            <View style = {{width: this.state.minX, height: Dimensions.get('window').height - 100, backgroundColor: 'red', position: 'absolute'}}>
            </View>
            <View style = {{width: Dimensions.get('window').width - this.state.maxX, height: Dimensions.get('window').height - 100, backgroundColor: 'red', position: 'absolute', alignSelf: 'flex-end'}}>
            </View>
            <View style = {{width: Dimensions.get('window').width, height: this.state.minY, backgroundColor: 'red', position: 'absolute'}}>
            </View>
            <View style = {{width: Dimensions.get('window').width, height: Dimensions.get('window').height - 100 - this.state.maxY, backgroundColor: 'red', position: 'absolute', marginTop: this.state.maxY}}>
            </View>
            <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>
              
            </ViewShot>

            </ImageBackground> 
            </ViewShot>
          }


        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', flexDirection: 'row' }}>
          <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
            <Text style={{ fontSize: 14 }}> SNAP </Text>
          </TouchableOpacity>
          {
            !this.state.camera &&
            <TouchableOpacity onPress={this.uploadPicture.bind(this)} style={styles.capture}>
            <Text style={{ fontSize: 14 }}> ANALYZE </Text>
            </TouchableOpacity>
          }
        </View>
      </View>
        );
      }
    
    
      takePicture = async() => {
        if (this.state.camera) {
          const options = { quality: 0.5, base64: true };
          const data = await this.camera.takePictureAsync(options);
          this.setState({camera: false, uri: data.uri, base64: data.base64})

          var uploadUri = Platform.OS === 'ios' ? data.uri.replace('file://', '') : uri
        }
          else
          {
            this.setState({camera: true})
          }
        }

      uploadPicture = async() => {
        this.clear()
        this.captureScreen()
      };
    }
  

    

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
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
  functionButton: {
    marginHorizontal: 2.5, marginVertical: 8, height: 30, width: 60,
    backgroundColor: '#39579A', justifyContent: 'center', alignItems: 'center', borderRadius: 5,
  }
});
