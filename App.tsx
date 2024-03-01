import React, { useEffect } from 'react';

import {
  StyleSheet,
  Text,
  View 
} from 'react-native';
import { loadTensorflowModel, useTensorflowModel } from 'react-native-fast-tflite';
import { useSharedValue } from 'react-native-reanimated';
import { Camera, Frame, runAsync, runAtTargetFps, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import encoding from 'text-encoding';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';

function App() {
  const { resize } = useResizePlugin()
  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice('back')
  const objectDetection = useTensorflowModel(require('./src/assets/models/best_saved_model/best_full_integer_quant.tflite'))
  const model = objectDetection.state === "loaded" ? objectDetection.model : undefined
  const decoder = new encoding.TextDecoder();
  const slide = useSharedValue(sliceArrayIntoGroups);

  // 640 x 640
  useEffect(() => {
    const fetch = async () => {
      if (!hasPermission) {
        await requestPermission();
      }
    }
    fetch()
  }, [])

  function sliceArrayIntoGroups(arr: any, size: Int32) {
    var step = 0, sliceArr = [], len = arr.length;
    while (step < len) {
      sliceArr.push(arr.slice(step, step += size));
    }
    return sliceArr;
  }

const frameProcessor = useFrameProcessor((frame) => {
  'worklet'
 
  // const input = new Uint8Array(data)
  // const outputs = model?.runSync([input])
  // if (outputs) {
    
  //   const isHotDogProb = data[935];
  //   const isHotDog = isHotDogProb > 0.2 ? "HotDog" : "Not HotDog";
  //   const output = isHotDog;
  //   console.log(output)
  // }
  // runAsync(frame, () => {
  //   'worklet'
  //   console.log("I'm running asynchronously, possibly at a lower FPS rate!")
  // })
  //const bananas = objects.filter((o) => o.type === targetObject)
  //console.log(`Detected ${bananas} bananas!`)


  runAtTargetFps(10, () => {
    'worklet'
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
    if (outputs) {
      // const output = new Uint8Array(outputs[0])
      
      // const buffer = Buffer.from(output);

      // // Convert Buffer to string
      // const jsonString = buffer.toString('utf8');
      console.log("0: " + outputs.length);

      console.log("1: "+ outputs[0].length);

      //var output = slide sliceArrayIntoGroups(outputs[0], 8400)

      var step = 0, sliceArr = [], len = outputs[0].length;
      while (step < len) {
        sliceArr.push(outputs[0].slice(step, step += 8400));
      }
      console.log("2: "+ sliceArr);

      //console.log("2"+ outputs[1].length);
      //console.log("3"+ outputs[2].length);
    }
  })
}, [model])

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

