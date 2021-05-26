import React, { Component } from 'react';

import {
  Text,
  View,
  TouchableHighlight,
  Platform,
  Alert,
} from 'react-native';

import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import Database from '@react-native-firebase/database';
import moment from 'moment';
import styles from './styles'

const date  = new Date();
const fileName = `${moment(date).format(
  'hh-mm-ss-DD-MM-YYYY',
)}.mp4`;


class AudioExample extends Component {

    state = {
      currentTime: 0.0,
      recording: false,
      paused: false,
      stoppedRecording: false,
      finished: false,
      audioPath: AudioUtils.DocumentDirectoryPath+'/'+fileName,
      hasPermission: undefined,
    };

    prepareRecordingPath(audioPath){
      AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "Low",
        AudioEncoding: "aac",
        AudioEncodingBitRate: 32000
      });
    }

    componentDidMount() {
      AudioRecorder.requestAuthorization().then((isAuthorised) => {
        this.setState({ hasPermission: isAuthorised });

        if (!isAuthorised) return;

        this.prepareRecordingPath(this.state.audioPath);

        AudioRecorder.onProgress = (data) => {
          this.setState({currentTime: Math.floor(data.currentTime)});
        };

        AudioRecorder.onFinished = (data) => {
          if (Platform.OS === 'ios') {
            this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
          }
        };
      });
    }

    _renderButton(title, onPress, active) {
      var style = (active) ? styles.activeButtonText : styles.buttonText;

      return (
        <TouchableHighlight style={styles.button} onPress={onPress}>
          <Text style={style}>
            {title}
          </Text>
        </TouchableHighlight>
      );
    }

    _renderPauseButton(onPress, active) {
      var style = (active) ? styles.activeButtonText : styles.buttonText;
      var title = this.state.paused ? "RESUME" : "PAUSE";
      return (
        <TouchableHighlight style={styles.button} onPress={onPress}>
          <Text style={style}>
            {title}
          </Text>
        </TouchableHighlight>
      );
    }

 
    _renderUploadSongButton(active) {
      var style = (active) ? styles.activeButtonText : styles.buttonText;
      return (
        <TouchableHighlight style={styles.button} onPress={()=> this._uploadSong(this.state.audioPath)}>
          <Text style={style}>
            {'Upload'}
          </Text>
        </TouchableHighlight>
      );
    }

    async _pause() {
      if (!this.state.recording) {
        Alert.alert('Can\'t pause, not recording!');
        return;
      }

      try {
        const filePath = await AudioRecorder.pauseRecording();
        this.setState({paused: true});
      } catch (error) {
        console.error(error);
      }
    }

    async _resume() {
      if (!this.state.paused) {
        Alert.alert('Can\'t resume, not paused!');
        return;
      }

      try {
        await AudioRecorder.resumeRecording();
        this.setState({paused: false});
      } catch (error) {
        console.error(error);
      }
    }

    async _stop() {
      if (!this.state.recording) {
        Alert.alert('Can\'t stop, not recording!');
        return;
      }

      this.setState({stoppedRecording: true, recording: false, paused: false});

      try {
        const filePath = await AudioRecorder.stopRecording();

        if (Platform.OS === 'android') {
          this._finishRecording(true, filePath);
        }
        return filePath;
      } catch (error) {
        console.error(error);
      }
    }

    async _play() {
      if (this.state.recording) {
        await this._stop();
      }
      
      setTimeout(() => {
        var sound = new Sound(this.state.audioPath, '', (error) => {
          if (error) {
            console.log('failed to load the sound', error);
          }
        });

        setTimeout(() => {
          sound.play((success) => {
            if (success) {
              console.log('successfully finished playing');
            } else {
              console.log('playback failed due to audio decoding errors');
            }
          });
        }, 100);
      }, 100);
    }

    async _record() {
      if (this.state.recording) {
        Alert.alert('Already recording!');
        return;
      }

      if (!this.state.hasPermission) {
        Alert.alert('Can\'t record, no permission granted!');
        return;
      }

      if(this.state.stoppedRecording){
        this.prepareRecordingPath(this.state.audioPath);
      }

      this.setState({recording: true, paused: false});

      try {
        const filePath = await AudioRecorder.startRecording();
      } catch (error) {
        console.error(error);
      }
    }

    _finishRecording(didSucceed, filePath, fileSize) {
      this.setState({ finished: didSucceed });
      console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`);
    }
    
   async _uploadSong(filePath) {
      var playersRef = Database().ref("audio/");
      playersRef.push({filePath});
      Alert.alert('Uploaded Sucessfully');
      this.setState({stoppedRecording: true, recording: false, paused: false});
      await AudioRecorder.stopRecording();
     }
    


    render() {

      return (
        <View style={styles.container}>
          <View style={styles.controls}>
            {this._renderButton("RECORD", () => {this._record()}, this.state.recording )}
            {this._renderButton("PLAY", () => {this._play()} )}
            {this._renderButton("STOP", () => {this._stop()} )}
            {this._renderPauseButton(() => {this.state.paused ? this._resume() : this._pause()})}
            {this._renderUploadSongButton()}
            <Text style={styles.progressText}>{this.state.currentTime}s</Text>
          </View>
        </View>
      );
    }
  }

  // var styles = StyleSheet.create({
  //   container: {
  //     flex: 1,
  //     backgroundColor: "white",
  //   },
  //   controls: {
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     flex: 1,
  //   },
  //   progressText: {
  //     paddingTop: 50,
  //     fontSize: 50,
  //     color: "black"
  //   },
  //   button: {
  //     padding: 10,
  //     backgroundColor:'red',
  //     margin:10
  //   },
  //   disabledButtonText: {
  //     color: '#eee'
  //   },
  //   buttonText: {
  //     fontSize: 20,
  //     color: "#fff"
  //   },
  //   activeButtonText: {
  //     fontSize: 20,
  //     color: "#B81F00"
  //   }

  // });

export default AudioExample;