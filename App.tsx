/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { loadTensorflowModel, useTensorflowModel } from 'react-native-fast-tflite';
import { Camera, Frame, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';


function App() {
  const { resize } = useResizePlugin()
  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice('back')
  const objectDetection = useTensorflowModel(require('./src/assets/models/mobilenet_v1_1.0_224_quant.tflite'))
  const model = objectDetection.state === "loaded" ? objectDetection.model : undefined
  // 640 x 640
  useEffect(() => {
    const fetch = async () => {
      if (!hasPermission) {
        await requestPermission();
      }
    }
    fetch()
  }, [])

  // User can look for specific objects
const targetObject = 'banana'

const frameProcessor = useFrameProcessor((frame) => {
  'worklet'
   
  //console.log(frame.toString())

  const data = resize(frame, {
    scale: {
      width: 640,
      height: 640,
    },
    pixelFormat: 'rgb',
    dataType: 'uint8'
  })

  const input = new Uint8Array(data)
  const outputs = model?.runSync([input])
  console.log(outputs?.toString())
  
  //const bananas = objects.filter((o) => o.type === targetObject)
  //console.log(`Detected ${bananas} bananas!`)
}, [])

  if (device == null) return <View><Text>aa</Text></View>
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
      
    />
  )
}

export default App;

