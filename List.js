import React, {Component} from 'react';
import {Dimensions, FlatList, StyleSheet, Text, View, Modal, AsyncStorage, Image, Alert, TouchableOpacity, KeyboardAvoidingView,} from 'react-native';
import {RNCamera} from 'react-native-camera';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';
import ViewShot from 'react-native-view-shot'
import ImageEditor from "@react-native-community/image-editor";
import Icon from 'react-native-vector-icons/MaterialIcons';

var AWS = require('aws-sdk');
var s3 = new AWS.S3({accessKeyId:'AKIA3BSGO4O2CBIRNSMG', secretAccessKey:'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', region:'us-east-1'});


export default class List extends Component
{
    constructor(props) {
        super(props);
        this.state = {
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
    
    render() {
        return (
          <View style = {{flex: 1, backgroundColor: 'black', height: Dimensions.get('window').height}}>
              <FlatList 
                value = {this.state}
                data={this.state.data}
                renderItem={({item}) => {
                    return (
                        <View style = {{backgroundColor: 'gray', marginVertical: 2}}>
                            <Text style = {{color: '#fff', margin: 5, fontWeight: '700'}}>{item.food}</Text>
                            <Text style = {{color: '#fff', margin: 5}}>Calories: {item.calories}</Text>
                            <Text style = {{color: '#fff', margin: 5}}>Carbs: {item.carbs}</Text>
                            <Text style = {{color: '#fff', margin: 5}}>Protein: {item.protein}</Text>
                            <Text style = {{color: '#fff', margin: 5}}>Fat: {item.fat}</Text>
                            <Text style = {{color: '#fff', margin: 5}}>{new Date(item.timestamp).toDateString()}</Text>
                        </View>
                    )
                }}
                keyExtractor={item => item.timestamp}
                horizontal = {false}
                showsVerticalScrollIndicator = {true}
                ListHeaderComponent = {(
                    <Text style = {{textAlign: 'center', fontWeight: '700', fontSize: 24, color: '#fff', marginTop: 30}}>Nutrition Log</Text>
                )}
                />
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
