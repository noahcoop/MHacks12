import React, {Component} from 'react';
import {Dimensions, ImageBackground, StyleSheet, Text, View, Modal, AsyncStorage, Image, Alert, TouchableOpacity, KeyboardAvoidingView,} from 'react-native';
import {RNCamera} from 'react-native-camera';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import ViewShot from 'react-native-view-shot'
import ImageEditor from "@react-native-community/image-editor";
import Icon from 'react-native-vector-icons/MaterialIcons';



var AWS = require('aws-sdk');
var s3 = new AWS.S3({accessKeyId:'AKIA3BSGO4O2CBIRNSMG', secretAccessKey:'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', region:'us-east-1'});


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
          maxY: Dimensions.get('window').height - 200,
          nutrition: {},
          food: "",
          viewModal: false,
          data: []
        };
      }

    componentDidMount = async () => {
      try {
        const value = await AsyncStorage.getItem('data');
        if (value !== null) {
          this.setState({data: JSON.parse(value)})
        }
      } catch (error) {
        // Error saving data
      }
    }

    _storeData = async (obj) => {
      try {
        var value = await AsyncStorage.getItem('data');
        if (value !== null) {
          value = JSON.parse(value)
          value.push(obj)
          await AsyncStorage.setItem('data', JSON.stringify(value));
        }
        else
        {
          await AsyncStorage.setItem('data', JSON.stringify([obj]));
        }
      } catch (error) {
        // Error saving data
      }
    };

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
      this.setState({minX: 0, minY: 0, maxX: Dimensions.get('window').width, maxY:  Dimensions.get('window').height - 200 })
    }

    captureScreen = async (x, y) => {
      const height = this.state.maxY - this.state.minY
      const width = this.state.maxX - this.state.minX
      const cropData = {
        offset: {x: x, y: y},
        size: {width: Dimensions.get('window').width, height: Dimensions.get('window').height - 200},
        resizeMode: 'contain',
      }

      console.log(x, y)
      await this.refs.viewShot.capture().then(async uri => {
        var tempImage = uri
          const urlKey = parseInt(Date.now())
          var params = {Bucket: 'flip-storage', Key: 'mhacks12/'+ urlKey + '/image.jpg', ContentType: 'image/jpeg'};
          s3.getSignedUrl('putObject', params, (err, url) => {
            const xhr = new XMLHttpRequest()
            xhr.open('PUT', url)
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log("Success")
                        fetch("https://mhacks-12.herokuapp.com/checkFood", {
                          method: 'POST',
                          body: JSON.stringify({
                            imageURL: "https://www.thespruceeats.com/thmb/xZU__qGyThuUAq8mTosBd1cmLAs=/1333x1000/smart/filters:no_upscale()/juicy-baked-burgers-3052097-7-5b1054308e1b6e0036bc6cd1.jpg"
                          })
                        })
                        .then(response => response.json())
                        .then(async data => {
                          this.setState({
                            nutrition: data.nutrition,
                            food: data.food,
                            viewModal: true
                          })
                        })
                  } else {
                    alert('Error while sending the image to S3')
                } 
              } 
            }
          xhr.setRequestHeader('Content-Type', 'image/jpeg')
          xhr.send({ uri: uri, type: 'image/jpeg', name: 'profile.jpg'})
        });   
        });
    }
    
    render() {
        return (
          <View style={styles.container}>
    
          <View style={{flexDirection: 'row', width: Dimensions.get('window').width}}>
            <TouchableOpacity onPress={() => {}} style={styles.capture}>
              <Icon size = {24} color = {'black'} name="star"></Icon>
            </TouchableOpacity>
            <View style = {{width: Dimensions.get('window').width - 210}}></View>
            <TouchableOpacity onPress={() => {}} style={styles.capture}>
              <Icon size = {24} color = {'black'} name="list"></Icon>
            </TouchableOpacity>
          </View>

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
           
            <Modal 
            animationType="slide"
            transparent = {true}
            visible = {this.state.viewModal}
           >
            <View  style = {{width: 250, height: 250, justifyContent: 'center', alignSelf: 'center', backgroundColor: '#fff', borderRadius: 10, marginTop: 100}}>
              <Text style = {{fontWeight: '700', textAlign: 'center', margin: 10}}>{this.state.food}</Text>
              <Text style = {{fontWeight: '500', textAlign: 'center', margin: 10}}>Calories: {this.state.nutrition.calories}</Text>
              <Text style = {{fontWeight: '500', textAlign: 'center', margin: 10}}>Carbs: {this.state.nutrition.carbs}</Text>
              <Text style = {{fontWeight: '500', textAlign: 'center', margin: 10}}>Protein: {this.state.nutrition.protein}</Text>
              <Text style = {{fontWeight: '500', textAlign: 'center', margin: 10}}>Fat: {this.state.nutrition.fat}</Text>
              <View style = {{flexDirection: 'row', width: 250, height: 40}}>
                  <TouchableOpacity style = {{width: 125, height: 40, backgroundColor: '#1261a0'}}
                  onPress = {() => this.setState({viewModal: false})}> 
                      <Text style = {{fontWeight: '500', textAlign: 'center', margin: 15}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style = {{width: 125, height: 40, backgroundColor: 'lightgray'}}
                   onPress = {() => {
                     this.setState({viewModal: false})
                     this._storeData({
                       food: this.state.food,
                       calories: this.state.nutrition.calories,
                       carbs: this.state.nutrition.carbs,
                       protein: this.state.nutrition.protein,
                       fat: this.state.nutrition.fat,
                       timestamp: Date.now()
                     })
                     }}>
                     <Text style = {{fontWeight: '500', textAlign: 'center', margin: 15}}>Add</Text>
                  </TouchableOpacity>
              </View>
              </View>
            </Modal>

            <ImageBackground
             source = {{uri: this.state.uri}}
             style = {{width: Dimensions.get('window').width, height: Dimensions.get('window').height - 200}}>
            <SketchCanvas
              ref={ref => {
                this.pad = ref;
              }}
              eraseComponent={<View style={styles.functionButton}><Text style={{color: 'white'}}>Eraser</Text></View>}
              style={{position: 'relative', height: Dimensions.get('window').height - 200, opacity: 0.5}}
              strokeColor={'#1261a0'}
              strokeWidth={4}
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
            <View style = {{width: this.state.minX, height: Dimensions.get('window').height - 200, backgroundColor: 'gray', position: 'absolute', opacity: 0.8}}>
            </View>
            <View style = {{width: Dimensions.get('window').width - this.state.maxX, height: Dimensions.get('window').height - 200, backgroundColor: 'gray', position: 'absolute', alignSelf: 'flex-end', opacity: 0.8}}>
            </View>
            <View style = {{width: Dimensions.get('window').width, height: this.state.minY, backgroundColor: 'gray', position: 'absolute', opacity: 0.8}}>
            </View>
            <View style = {{width: Dimensions.get('window').width, height: Dimensions.get('window').height - 200 - this.state.maxY, backgroundColor: 'gray', position: 'absolute', marginTop: this.state.maxY, opacity: 0.8}}>
            </View>
            <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>
              
            </ViewShot>

            </ImageBackground> 
            </ViewShot>
          }


        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', flexDirection: 'row' }}>
          <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
            <Icon size = {24} color = {'black'} name="camera-alt"></Icon>
          </TouchableOpacity>
          {
            !this.state.camera &&
            <TouchableOpacity onPress={this.uploadPicture.bind(this)} style={styles.capture}>
            <Icon size = {24} color = {'black'} name="cloud-upload"></Icon>
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
        await this.captureScreen(this.state.minX, this.state.minY)
        await this.clear() 
      };
    }
  

    

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
    position: 'relative'
  },
  preview: {
    //flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height - 200
  },
  capture: {
    flex: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
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
