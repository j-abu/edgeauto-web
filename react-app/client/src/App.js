import React, { Component } from 'react';
import ReactTable from "react-table";
import HashMap from 'hashmap';
import Modal from 'react-modal';
import './App.css';
import 'react-table/react-table.css'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import {Line} from 'react-chartjs-2'
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'; 
import {Map, TileLayer, Marker, Popup, Polyline} from 'react-leaflet';
import 'chartjs-plugin-annotation';

//map default zoom
const zoom= 15

//chart dropdown options
const options = []

var firstChartData = { labels: [], datasets: [{}] }

var secondChartData = { labels: [], datasets: [{}] }

var thirdChartData = { labels: [], datasets: [{}] }

//vehicle dropwdown options
const dropvehicle = []

//modal styling
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

//ReactTable columns
const columns = [{
  Header: 'Name',
  accessor: 'name',
  width: 150
},{
  Header: 'ID',
  accessor: 'aid',
  width: 100
},{
  Header: 'Bytes',
  accessor: 'bytes',
  className: 'right',
  style:{
    color: 'blue',
    paddingRight: '100px',
    fontFamily: 'courier',
    fontSize: '20px'
  }
}]

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      response: '',
      get: '',
      post: '',
      data: {},
      message: '',
      geoMap: new HashMap(),
      center: {lat: 0, lng: 0},
      time: 0,
      isOn: false,
      start: 0,
      end: 0,
      tick: 0,
      mapTick: 0,
      modalIsOpen: false,
      firstChartOption: '',
      secondChartOption: '',
      thirdChartOption: '',
      firstChart: {},
      secondChart: {},
      thirdChart: {},
      maxTime: 402000,
      vehicleOption: '',
      sessionOption: '',
      APIcallString: '',
      currentVehSess: '',
      currentHolder: [],
      lat: 42.650082,
      lng: -83.111183,
      latlng: {lat: 42.650082, lng: -83.111183},
      driverPath: [],
      messageMap: new HashMap(),
      currentData: [],
      sessionDroptions: [],
      messageTimer: '',
      chartCounter: 0,
      chartOption: '',
      rowID: '',
      sessionStartDiff: 0,
      rowSelected: [],
      chartStyleOption: {
        scales: {
            yAxes: [{
                display: false
            }],
            xAxes: [{
              gridLines: {
                display:false
            }
          }]
        },
        legend: {
          labels: {
            boxWidth: 0,
            fontSize: 20,
            fontColor: '#000000',
            fontFamily: 'courier',
            fontStyle: 'bold'
          }
         },
         annotation: {
          annotations: [
            {
              type: "line",
              mode: "vertical",
              scaleID: "x-axis-0",
              value: "0",
              borderColor: "red"
            }
          ]
        },
        tooltips: {
          enabled: false
        }
      }
  }
  this.getFirstChart = this.getFirstChart.bind(this)
  this.getSecondChart = this.getSecondChart.bind(this)
  this.loadVehicleSession = this.loadVehicleSession.bind(this)
  this.openModal = this.openModal.bind(this)
  this.afterOpenModal = this.afterOpenModal.bind(this)
  this.closeModal = this.closeModal.bind(this)
  this.startTimeInterval = this.startTimeInterval.bind(this)
  this.startTimer = this.startTimer.bind(this)
  this.stopTimer = this.stopTimer.bind(this)
  this.startMapInterval = this.startMapInterval.bind(this)
  this.startMessageInterval = this.startMessageInterval.bind(this)
  this.getRowChart = this.getRowChart.bind(this)
  this.getDataForSession = this.getDataForSession.bind(this)
}

  componentDidMount() {
    fetch('/getsessions').then(
      response => response.json()
    ).then(
	    json => {
        var sessions = json
        var sessionHolder=[]
        for(var i =0; i<sessions.length;i++){
          sessionHolder.push(sessions[i].session_id)
        }

        this.setState({sessionDroptions: sessionHolder})
      }
    );

    
  }

  getDataForSession(str){
    fetch(str).then(
      response => response.json()
    ).then(
	    json => {
        this.setState({data: json});
        var str = this.state.data

        var helperMap = new HashMap()
        var geoMapHolder = new HashMap()
        var node={lat: 0, lng: 0}
        var nodeHolder=[]

        
        var lowestTime=str[0].cantime
        var largestTime=str[0].cantime
        //set initial data
        helperMap.set(str[0].arb_id,{'name': 'undefined', 'map': new HashMap(str[0].cantime,str[0].message)})

        var currentHolder=[]
        //take all data from JSON response and store into a Hashmap
        //Hashmap has aid as key, {name, Hashmap} as value
        //nested hashmap contains time as key, data as value
        for( var i=1;i<str.length;i++){
          if(helperMap.has(str[i].arb_id)){
            helperMap.get(str[i].arb_id).map.set(str[i].cantime,str[i].message)
            if(str[i].cantime<lowestTime){
              lowestTime=str[i].cantime
            }
            if(str[i].cantime>largestTime){
              largestTime=str[i].cantime
            }
            geoMapHolder.set()
          }else{
            helperMap.set(str[i].arb_id,{'name': 'undefined', 'map': new HashMap(str[i].cantime,str[i].message)})
            if(str[i].cantime<lowestTime){
              lowestTime=str[i].cantime
            }
            if(str[i].cantime>largestTime){
              largestTime=str[i].cantime
            }
          }
        }

        for( var i=0;i<str.length;i++){
          node = {lat: str[i].latitude, lng: str[i].longitude}
          geoMapHolder.set(str[i].cantime-lowestTime,node)
          nodeHolder.push(node)
        }
        this.setState({geoMap: geoMapHolder})
        this.setState({driverPath: nodeHolder})
        this.setState({latlng: geoMapHolder.get(0)})
        this.setState({center: geoMapHolder.get(0)})       
        this.setState({messageMap: helperMap})
        this.setState({sessionStartDiff: lowestTime})

        //set initial values and push IDs to chart dropdown options
        helperMap.forEach(function(value, key) {
          currentHolder.push({'name':value.name, 'aid':key, 'bytes':value.map.get(lowestTime)})
          options.push(key)
        });
        this.setState({currentData: currentHolder})
        this.setState({maxTime: largestTime})
      }
    );
  }



  //To handle time slider change
  handleSliderOnChange = (value) => {
    this.setState({
      time: value,
      start: Date.now() - this.state.time
    })

    var currentHolder = []
    var bigMap = this.state.messageMap
    var geoMap = this.state.geoMap
    var target = this.state.time
    var minDiff = 5000;
    var nearest = 0;
    var geoNearest = 0;
    var geoMinDiff = 10000;

    bigMap.forEach(function(value, key) {
      value.map.forEach(function(innerValue, innerKey) {
        var diff = Math.abs(target - innerKey)  
        if(diff < minDiff){
          nearest = innerKey;
          minDiff = diff;
        } 
      });
      if(value.map.get(nearest)!=null){
        currentHolder.push({'name':value.name, 'aid':key, 'bytes':value.map.get(nearest)})
      }
      
    });
    this.setState({currentData: currentHolder})

    geoMap.forEach(function(value, key) {
      var diff = Math.abs(target - key)  
      if(diff < geoMinDiff){
        geoNearest = key;
        geoMinDiff = diff;
      }
    });

    this.setState({lat: this.state.geoMap.get(geoNearest).lat})
    this.setState({lng: this.state.geoMap.get(geoNearest).lng})
    var node = {lat: 0,lng:0}
    node.lat=this.state.lat
    node.lng=this.state.lng
    this.setState({latlng: node})

    //for deep copy of chart state, forces react to rerender the chart
    var chartHolder = {
      scales: {
          yAxes: [{
              display: false
          }],
          xAxes: [{
            gridLines: {
              display:false
          }
        }]
      },
      legend: {
        labels: {
          boxWidth: 0,
          fontSize: 20,
          fontColor: '#000000',
          fontFamily: 'courier',
          fontStyle: 'bold'
        }
       },
       annotation: {
        annotations: [
          {
            type: "line",
            mode: "vertical",
            scaleID: "x-axis-0",
            value: nearest,
            borderColor: "red"
          }
        ]
      }
    }

    this.setState({chartStyleOption: chartHolder})
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }
 
  afterOpenModal() {
    this.subtitle.style.color = '#01579B';
    this.subtitle.style.fontSize = '24px'
    this.subsubtitle.style.color = '#01579B';
    this.subsubtitle.style.fontSize = '20px'
  }
 
  closeModal() {
    this.setState({modalIsOpen: false});
  }

  startTimeInterval(){
    return this.setState({time: Date.now() - this.state.start})
  }

  startMapInterval(){
    var geoMap = this.state.geoMap
    var target = this.state.time
    var geoNearest = 0;
    var geoMinDiff = 10000;
    
    geoMap.forEach(function(value, key) {
      var diff = Math.abs(target - key)  
      if(diff < geoMinDiff){
        geoNearest = key;
        geoMinDiff = diff;
      }
    });
    
    this.setState({lat: this.state.geoMap.get(geoNearest).lat})
    this.setState({lng: this.state.geoMap.get(geoNearest).lng})
    var node = {lat: 0,lng:0}
    node.lat=this.state.lat
    node.lng=this.state.lng
    this.setState({latlng: node})
  }

  startMessageInterval(){
    //largest map
    var bigMap = this.state.messageMap
    var currentHolder = []

    var target = this.state.time+this.state.sessionStartDiff
    var minDiff = 9999999999999999;
    var nearest = 0;

    bigMap.forEach(function(value, key) {
      value.map.forEach(function(innerValue, innerKey) {
        var diff = Math.abs(target - innerKey)  
        if(diff < minDiff){
          nearest = innerKey;
          minDiff = diff;
        } 
      });
      if(value.map.get(nearest)!=null){
        currentHolder.push({'name':value.name, 'aid':key, 'bytes':value.map.get(nearest)})
      }
      
    });
    this.setState({currentData: currentHolder})
    
    //for deep copy of chart state, forces react to rerender the chart
    var chartHolder = {
      scales: {
          yAxes: [{
              display: false
          }],
          xAxes: [{
            gridLines: {
              display:false
          }
        }]
      },
      legend: {
        labels: {
          boxWidth: 0,
          fontSize: 20,
          fontColor: '#000000',
          fontFamily: 'courier',
          fontStyle: 'bold'
        }
       },
       annotation: {
        annotations: [
          {
            type: "line",
            mode: "vertical",
            scaleID: "x-axis-0",
            value: nearest,
            borderColor: "red"
          }
        ]
      }
    }

    this.setState({chartStyleOption: chartHolder})
  }

  startTimer() {
    this.setState({
      isOn: true,
      time: this.state.time,
      start: Date.now() - this.state.time
    })
    this.mapTimer = setInterval(this.startMapInterval, 1000)
    this.timer = setInterval(this.startTimeInterval, 1)
    this.messageTimer = setInterval(this.startMessageInterval,300)
  }

  stopTimer() {
    this.setState({isOn: false})
    clearInterval(this.timer)
    clearInterval(this.mapTimer)
    clearInterval(this.messageTimer)
  }

  getRowChart(){
    if(this.state.chartOption !== ''){
      if(this.state.chartCounter===0){
        this.setState({firstChartOption: this.state.chartOption})
        this.getFirstChart()
        this.setState({chartCounter: this.state.chartCounter+1})
      }else if(this.state.chartCounter===1){
        this.setState({secondChartOption: this.state.chartOption})
        this.getSecondChart()
        this.setState({chartCounter: this.state.chartCounter+1})
      }else if(this.state.chartCounter===2){
        this.setState({thirdChartOption: this.state.chartOption})
        this.getThirdChart()
        this.setState({chartCounter: this.state.chartCounter+1})
      }else{
        console.log("chart space maxed out")
      }
    }
  }

  //TODO abstract getchart and import it
  getFirstChart(){
    function hexToDec(s) {
      var i, j, digits = [0], carry;
      for (i = 0; i < s.length; i += 1) {
          carry = parseInt(s.charAt(i), 16);
          for (j = 0; j < digits.length; j += 1) {
              digits[j] = digits[j] * 16 + carry;
              carry = digits[j] / 10 | 0;
              digits[j] %= 10;
          }
          while (carry > 0) {
              digits.push(carry % 10);
              carry = carry / 10 | 0;
          }
      }
      return digits.reverse().join('');
    }

    firstChartData.labels = [];
    firstChartData.datasets = [];

    var map = this.state.messageMap.get(this.state.chartOption).map
    var values = [];

    var difference = this.state.sessionStartDiff
    map.forEach(function(value, key) {
      firstChartData.labels.push(key-difference);
      values.push(parseInt(hexToDec(value)));
    });

    firstChartData.datasets.push({
      label: this.state.chartOption, 
      data: values, 
      fill: false, 
      borderColor: "#FF0000",
      backgroundColor: "#FF0000",
      pointBackgroundColor: "#FF0000",
      pointBorderColor: "#FF0000",
      pointHoverBackgroundColor: "#FF0000",
      pointHoverBorderColor: "#FF0000"})
    this.setState({firstChart: firstChartData})
  }

  getSecondChart(){
    function hexToDec(s) {
      var i, j, digits = [0], carry;
      for (i = 0; i < s.length; i += 1) {
          carry = parseInt(s.charAt(i), 16);
          for (j = 0; j < digits.length; j += 1) {
              digits[j] = digits[j] * 16 + carry;
              carry = digits[j] / 10 | 0;
              digits[j] %= 10;
          }
          while (carry > 0) {
              digits.push(carry % 10);
              carry = carry / 10 | 0;
          }
      }
      return digits.reverse().join('');
    }

    secondChartData.labels = [];
    secondChartData.datasets = [];

    var map = this.state.messageMap.get(this.state.chartOption).map
    var values = [];

    map.forEach(function(value, key) {
      secondChartData.labels.push(key);
      values.push(parseInt(hexToDec(value)));
    });

    secondChartData.datasets.push({
      label: this.state.chartOption, 
      data: values, 
      fill: false,
      borderColor: "#0000FF",
      backgroundColor: "#0000FF",
      pointBackgroundColor: "#0000FF",
      pointBorderColor: "#0000FF",
      pointHoverBackgroundColor: "#0000FF",
      pointHoverBorderColor: "#0000FF"})
    this.setState({secondChart: secondChartData})
  }

  getThirdChart(){
    function hexToDec(s) {
      var i, j, digits = [0], carry;
      for (i = 0; i < s.length; i += 1) {
          carry = parseInt(s.charAt(i), 16);
          for (j = 0; j < digits.length; j += 1) {
              digits[j] = digits[j] * 16 + carry;
              carry = digits[j] / 10 | 0;
              digits[j] %= 10;
          }
          while (carry > 0) {
              digits.push(carry % 10);
              carry = carry / 10 | 0;
          }
      }
      return digits.reverse().join('');
    }

    thirdChartData.labels = [];
    thirdChartData.datasets = [];

    var map = this.state.messageMap.get(this.state.chartOption).map
    var values = [];

    map.forEach(function(value, key) {
      thirdChartData.labels.push(key);
      values.push(parseInt(hexToDec(value)));
    });

    thirdChartData.datasets.push({
      label: this.state.chartOption, 
      data: values, 
      fill: false, 
      borderColor: "#008000",
      backgroundColor: "#008000",
      pointBackgroundColor: "#008000",
      pointBorderColor: "#008000",
      pointHoverBackgroundColor: "#008000",
      pointHoverBorderColor: "#008000"})
    this.setState({thirdChart: thirdChartData})
  }

  handleFirstChart = (firstChartOption) => {
    this.setState({ firstChartOption });
  }

  handleSecondChart = (secondChartOption) => {
    this.setState({ secondChartOption });
  }

  handleChart = (chartOption) => {
    this.setState({ chartOption });
  }

  loadVehicleSession(){
    this.setState({currentVehSess: this.state.vehicleOption.value+' '+this.state.sessionOption.value})
    this.setState({firstChart: {}})
    this.setState({secondChart: {}})
    this.setState({thirdChart: {}})
    this.setState({chartStyleOption:{}})
    this.setState({chartCounter: 0})
    var str = '/session/1/'+this.state.sessionOption.value
    this.getDataForSession(str)
  }

  handleVehicle = (vehicleOption) => {
    this.setState({ vehicleOption });
  }

  handleSession = (sessionOption) => {
    this.setState({ sessionOption });
  }

  render() {
    var line =(
      
      <Polyline color={'red'} weight={6} positions={this.state.driverPath}>
      
      </Polyline>
    )

    const marker =(
      
      <Marker position={this.state.latlng}>
        <Popup >{this.state.lat},{this.state.lng}</Popup>
      
      </Marker>

    )

    let start = (this.state.time === 0) ?
      <button style={{background: '#808080', color: '#fff', padding: '10px', borderColor: '#fff', borderRadius: "5px" }} 
      onClick={this.startTimer}>play</button> :
      null

    let stop = (this.state.time === 0 || !this.state.isOn) ?
      null :
      <button style={{background: '#808080', color: '#fff', padding: '10px', borderColor: '#fff', borderRadius: "5px" }}
      onClick={this.stopTimer}>pause</button>

    let resume = (this.state.time === 0 || this.state.isOn) ?
      null :
      <button style={{background: '#808080', color: '#fff', padding: '10px', borderColor: '#fff', borderRadius: "5px" }}
      onClick={this.startTimer}>play</button>

    let load = 
      <button style={{ background: '#808080', color: '#fff', padding: '10px', borderColor: '#fff', borderRadius: "5px" }}
      onClick={this.loadVehicleSession}>load</button> 

    let help =
      <button style={{ background: '#808080', color: '#fff', padding: '10px', borderColor: '#fff', borderRadius: "5px" }}
          onClick={this.openModal}>help</button>

    return (
      <div className="App">
        <div align-items="center" className="Header">
          <h1 style={{textAlign: 'left',padding: '10px'}}>EDGE AUTO</h1>
        </div>
        <div style={{backgroundColor: '#D3D3D3'}} className="Sidebar">
          <div style={{backgroundColor: '#D3D3D3'}} className="TableHeader">
            <div style={{padding: '10px',width: '100%', float: 'left'}} className="VehicleInfo">
              <h5 style={{color: '#000000', fontSize: '16px', fontFamily: 'courier', textAlign: 'left' }}>Currently Viewing:</h5>
              <h5 style={{paddingTop: '3px',color: '#000000', fontSize: '16px', textAlign: 'left', fontFamily: 'courier', fontWeight: 'normal' }}> {this.state.currentVehSess}</h5>
            </div>
            <br />
            <div style={{padding: '10px', position: 'relative'}} className="vehDrop">
              <Dropdown options={dropvehicle}  onChange={this.handleVehicle} value={this.state.vehicleOption} placeholder="Vehicle" />
            </div>
            <div style={{padding: '10px',float: 'left'}} className="sessDrop">
              <Dropdown options={this.state.sessionDroptions} onChange={this.handleSession} value={this.state.sessionOption} placeholder="Session" />
            </div>
            <div style={{float: 'left'}} className="loadhelp">
              <div style={{padding: '10px', float: 'left'}} className="load">
                {load}
              </div>
              <div style={{paddingTop: '10px', paddingLeft: '50px',paddingBottom: '10px',paddingRight: '10px', float: 'left'}} className="help">
                {help}
              </div>
            </div>
          </div>

	        <ReactTable
	          style={{"height" : "80vh"}}
            showPagination={true}
            filterable={true}
	          data={this.state.currentData}    
            columns={columns}
            
            getTdProps={(state, rowInfo, column, instance) => {
              var rowHolder=[]
              if (rowInfo && rowInfo.row) {
                return {
                  onClick: (e, handleOriginal) => {
                    this.setState({chartOption: rowInfo.original.aid})
                    this.getRowChart()
                    rowHolder.push(rowInfo.index)
                    this.setState({rowSelected: rowHolder})
                  },
                  style:{
                    background: this.state.rowSelected.includes(rowInfo.index) ? '#00afec' : '#D3D3D3'
                  }
                };
              }else{
                return{}
              }
            }}
	        />
        </div>
        <div className="Panel">
          <div className="Slider-container">
            <Slider
              value={this.state.time}
              max = {this.state.maxTime}
              orientation="horizontal"
              onChange={this.handleSliderOnChange}
            />
          </div>
	        <h2 style={{color: '#000000', padding: '10px', fontSize: '20px', fontFamily: 'courier'}}>Time Elapsed:</h2>
          <h3 style={{color: '#000000', padding: '10px', fontSize: '20px', fontFamily: 'courier'}}>{this.state.time} ms</h3>
          <br />
          <br />
          {start}
          {resume}
          {stop}
          <br />
          <br />
          <br />

          <Modal
            isOpen={this.state.modalIsOpen}
            onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            style={customStyles}
          >
  
            <h2 ref={subtitle => this.subtitle = subtitle}>Welcome to Edge Auto!</h2>
            <br />
            <p>All data displayed on this portal was gathered following the concepts of Edge Computing.</p>
            <p>This means that all data transmitted by the vehicle was sent to and preprocessed at different</p>
            <p>"nodes" before being stored in a central database. Our implementation achieved this by sending</p>
            <p>all CAN and GPS data to different Virtual Machines(hosted on Google Cloud) depending on which</p>
            <p>predefined geofenced grid the vehicle was located in at the time of transmission.</p>
            <br />
            <p>This site lets the user replay a driving session and observe the collected data in real-time!</p>
            <br />
            <h2 ref={subsubtitle => this.subsubtitle = subsubtitle}>How to use:</h2>
            <br />
            <p>Displayed to the left is a table, which shows the name and ID of an ECU as well as the</p>
            <p>bytes an ECU was streaming to the CAN network at any given time.</p>
            <p>Displayed in the center is the control panel. Here you can control the timer(will be repalced</p>
            <p>with a time slider), choose a different vehicle/session, or reopen this dialogue box.</p>
            <p>To the top-right displays the path of which the driving session took as a function of time.</p>
            <p>Each point plotted on the map is clickable, showing the GPS coordinates and time.</p>
            <p>To the bottom-right shows a chart of any message you would like to display, plotting data</p>
            <p>as a function of time.</p>
            <br />
            <button style={{ background: '#01579B', color: '#fff', padding: '5px', display: 'block', margin: '0 auto'}}
            onClick={this.closeModal}>close</button>
            <form>
              <input />
            </form>
          </Modal>
        </div>	
        <div className="Maps" style={{ height: '55vh', width: '35%', float:  'right'}}>
          <Map center={this.state.center} zoom={zoom} style={{height: '55vh'}}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          />
          {line}
          {marker}
        </Map>
        </div>

        <div className="charts">
          <div className="canvas-first">
            <div style={{padding: '5px'}}className="chart-div1">
              <Line data={this.state.firstChart} options={this.state.chartStyleOption} />
            </div>
          </div>
          <div className="canvas-second">
            <div style={{padding:'5px'}} className="chart-div2">
              <Line data={this.state.secondChart} options={this.state.chartStyleOption}/>
            </div>
          </div>
          <div className="canvas-third">
            <div style={{padding:'5px'}} className="chart-div2">
              <Line data={this.state.thirdChart} options={this.state.chartStyleOption}/>
            </div>
          </div>
        </div>
        
      </div>
      
    );
  }
}

export default App;
