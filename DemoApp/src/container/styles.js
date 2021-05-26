import { StyleSheet } from 'react-native';

var styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "white",
    },
    controls: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    progressText: {
      paddingTop: 50,
      fontSize: 50,
      color: "black"
    },
    button: {
      padding: 10,
      backgroundColor:'red',
      margin:10
    },
    disabledButtonText: {
      color: '#eee'
    },
    buttonText: {
      fontSize: 20,
      color: "#fff"
    },
    activeButtonText: {
      fontSize: 20,
      color: "#B81F00"
    }

  });

  export default styles;