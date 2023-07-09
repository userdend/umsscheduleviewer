import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  BackHandler,
  Linking,
} from 'react-native';
import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import database from '@react-native-firebase/database';
import {WebView} from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import Swiper from 'react-native-swiper';
import SplashScreen from 'react-native-splash-screen';
import AwesomeLoading from 'react-native-awesome-loading';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storeList: [{currentSchedule: '', path: '', subject: ''}],
      list: [],
      subjectLink: '',
      currentItem: '',
      screenWidth: Dimensions.get('screen').width,
      screenHeight: Dimensions.get('screen').height,
      statusType: 'Fetching data.',
      statusBackgroundColor: '#85929E',
      displayFlatList: 'none',
      webViewImageZindex: 2,
      loadingIsActive: true,
      showsButtons: false,
      editableTextInput: false,
      opacityTextInput: 1,
    };
  }
  // Load data to state.
  componentDidMount() {
    SplashScreen.hide();
    let temp = {tempList: []};
    this.setState({storeList: []});
    // Get network info.
    NetInfo.addEventListener((state) => {
      if (state.type === 'none' || state.type === 'unknown') {
        this.setState({
          statusType: 'No Network Connection.',
          statusBackgroundColor: '#CD6155',
          loadingIsActive: false,
        });
      }
    });
    // Get data from firebase.
    database()
      .ref('semester')
      .on('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          temp.tempList = [...temp.tempList, childSnapshot.val()];
        });
        // Set list value as storeList, filter storeList to be display in list.
        this.setState({storeList: temp.tempList});
        this.setState({
          list: this.state.storeList,
          statusType:
            'Current Schedule: ' + this.state.storeList[0].currentSchedule,
          statusBackgroundColor: '#5DADE2',
          loadingIsActive: false,
          editableTextInput: true,
          subjectLink: this.state.storeList[0].subjectLink,
        });
      });
  }

  render() {
    return (
      <View style={[style.body, {height: this.screenHeight}]}>
        <StatusBar backgroundColor={'#303F9F'} barStyle={'light-content'} />
        <View style={style.header}>
          <Text style={style.title}>UMS SCHEDULE FINDER</Text>
          <TextInput
            style={[style.textInput, {opacity: this.state.opacityTextInput}]}
            placeholder="search."
            onChangeText={(value) => {
              let getResult = this.state.storeList.filter((item) => {
                return (
                  item.subject.toUpperCase().indexOf(value.toUpperCase()) > -1
                );
              });
              this.setState({list: getResult, displayFlatList: 'flex'});
              if (value.length === 0) {
                this.setState({
                  displayFlatList: 'none',
                  webViewImageZindex: 2,
                });
              }
            }}
            editable={this.state.editableTextInput}
          />
          <Text
            style={[
              style.status,
              {backgroundColor: this.state.statusBackgroundColor},
            ]}>
            {this.state.statusType}
          </Text>
        </View>
        <Swiper
          index={0}
          loop={false}
          scrollEnabled={false}
          showsButtons={this.state.showsButtons}
          ref={(swiper) => (this.swiper = swiper)}
          onIndexChanged={(index) => {
            if (index == 0) {
              this.setState({
                editableTextInput: true,
                opacityTextInput: 1.0,
              });
            }
            if (index == 1) {
              this.setState({
                editableTextInput: false,
                opacityTextInput: 0.5,
              });
            }
          }}>
          <View
            style={[
              style.majorComponent,
              {
                width: this.state.screenWidth,
              },
            ]}>
            <View
              style={[
                style.imageContainer,
                {
                  width: this.state.screenWidth,
                },
              ]}>
              <AwesomeLoading
                indicatorId={1}
                size={100}
                isActive={this.state.loadingIsActive}
                text="Connecting, please wait."
              />
              <ImageBackground
                style={[style.imageBg, {top: '5%'}]}
                source={require('./assets/bg_image/bg_flatlist.png')}>
                <View
                  style={{
                    width: this.state.screenWidth / 1.75,
                    height: this.state.screenWidth / 1.75,
                  }}></View>
              </ImageBackground>
            </View>
            <View style={style.stackedComponent}>
              <FlatList
                style={{display: this.state.displayFlatList}}
                data={this.state.list}
                initialNumToRender={11}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={style.touchableComponent}
                    onPress={() => {
                      // this.swiper.scrollBy(1, true);
                      // this.setState({
                      //   currentItem: item.path,
                      //   subjectLink: item.subjectLink,
                      //   webViewImageZindex: 0,
                      //   showsButtons: true,
                      //   statusType: item.subjectLink + item.path,
                      // });
                      Linking.openURL(item.subjectLink + item.path);
                    }}>
                    <Text style={style.subjectName}>{item.subject}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.subjectLink + item.path}
              />
            </View>
          </View>
          {/* <View style={[style.majorComponent, {width: this.state.screenWidth}]}>
            <View
              style={[
                style.imageContainer,
                {
                  width: this.state.screenWidth,
                  height: this.state.screenHeight,
                  backgroundColor: '#fff',
                  zIndex: this.state.webViewImageZindex,
                },
              ]}>
              <ImageBackground
                style={style.imageBg}
                source={require('./assets/bg_image/bg_webview.png')}>
                <View
                  style={{
                    width: this.state.screenWidth / 1.75,
                    height: this.state.screenWidth / 1.75,
                  }}></View>
              </ImageBackground>
            </View>
            <View
              style={[
                style.stackedComponent,
                {
                  width: this.state.screenWidth,
                  zIndex: 1,
                },
              ]}>
              <WebView
                source={{uri: this.state.subjectLink + this.state.currentItem}}
              />
            </View>
          </View> */}
        </Swiper>
      </View>
    );
  }
}

const style = StyleSheet.create({
  body: {
    flex: 1,
  },
  header: {
    backgroundColor: '#3F51B5',
  },
  title: {
    marginLeft: 20,
    marginTop: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    margin: 20,
    marginTop: 10,
  },
  status: {
    textAlign: 'center',
    padding: 5,
    color: '#FFF',
  },
  touchableComponent: {
    borderColor: '#D5D8DC',
    borderBottomWidth: 1,
    backgroundColor: '#FFF',
  },
  subjectName: {
    margin: 10,
  },
  imageContainer: {
    position: 'absolute',
    height: '75%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBg: {
    display: 'flex',
    resizeMode: 'cover',
    top: '-20%',
    opacity: 0.5,
  },
  stackedComponent: {
    position: 'absolute',
    height: '100%',
  },
  majorComponent: {
    height: '100%',
    backgroundColor: '#FFF',
  },
});
