
(function () {
  'use strict';
     
   function ItemsController($scope, $http, $location, $routeParams, getStations, getStationDetail, SETTINGS) {

     var stations = [];
     $scope.station = 'Please click on left markers or stations bellow to check departures';
    
     var mapOptions = {
        zoom: 16,
        center: new google.maps.LatLng( SETTINGS.defaultLat, SETTINGS.defaultLong),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    $scope.SETTINGS = SETTINGS;
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    $scope.markers = [];
    google.maps.event.addListener($scope.map, 'idle', function() {
                  var bounds =  $scope.map.getBounds();
                  var nelng = bounds.getNorthEast().lng();
                  var nelat = bounds.getNorthEast().lat();
                  var swlng = bounds.getSouthWest().lng();
                  var swlat = bounds.getSouthWest().lat();

                  $scope.getItems = getItems(swlng,swlat, nelng, nelat, SETTINGS.transportApiKey, SETTINGS.transportAppId);
                  
    });

    
    var infoWindow = new google.maps.InfoWindow();
    var createMarker = function (info){

        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.long),
            title: info.place,
            atcocode: info.atcocode,
            transportApiKey: $scope.SETTINGS.transportApiKey,
            transportAppId: $scope.SETTINGS.transportAppId

        });
        marker.content = '<div class="infoWindowContent">' + info.desc + '<br />' + info.lat + ' E,' + info.long +  ' N, </div>';

        google.maps.event.addListener(marker, 'click', function(){
          $scope.station = 'Please wait, data for '+marker.title+ ' station is loading ...' ;
          $scope.stationBuses = '';
          getStationDetail.httpGet(marker.atcocode, marker.transportApiKey, marker.transportAppId).then(function(response) {
            $scope.station = ''+marker.title+ ' departure times and lines' ;
          
            var obj =  response.departures;
            var arrBuses = [];
            var arrBusesVal = [];
            var resultarrBuses = [];
            var tmpObj, tmpVal, tmpIndex;
            for (var key in obj) {
              if (obj.hasOwnProperty(key)) {
                arrBuses.push(obj[key]);
                arrBusesVal.push(key);
              }
            }
            
            if (obj) {
                    for (var i=0 ; i < arrBuses.length ; i++) {
                         tmpObj = "";
                         resultarrBuses.push({busno: arrBusesVal[i], departures: arrBuses[i]} );
                    }
            }
            $scope.stationBuses = resultarrBuses;
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);

           }) ;

            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
        });

        $scope.markers.push(marker);

    }



    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }




    function getItems(minlon,minlat, maxlon, maxlat, apikey, apiid){

      getStations.httpGet(minlon,minlat, maxlon, maxlat,apikey, apiid).then(function(response) {
         $scope.items = response.stops;
         stations = [];
          for (var i=0 ; i < $scope.items.length ; i++) {
                stations.push($scope.items[i]);
          }
          var ObjMarker='';
          for (var i = 0; i < stations.length; i++) {
              ObjMarker = {place: stations[i]['name'], desc: stations[i]['mode'], lat: stations[i]['latitude'], long: stations[i]['longitude'], atcocode: stations[i]['atcocode'] };
              createMarker(ObjMarker );
          }
       }) ;
     }

     $scope.getItems = getItems('-0.0938','51.5207', '-0.074', '51.528', SETTINGS.transportApiKey, SETTINGS.transportAppId);
     $scope.printStationDetails = function (atcocode, title){
          $scope.station = 'Please wait, data for '+title+ ' station is loading ...' ;
          $scope.stationBuses = '';
          getStationDetail.httpGet(atcocode, $scope.SETTINGS.transportApiKey, $scope.SETTINGS.transportAppId).then(function(response) {
            $scope.station = ''+title+ ' departure times and lines' ;
            var obj =  response.departures;
            var arrBuses = [];
            var arrBusesVal = [];
            var resultarrBuses = [];
            var tmpObj, tmpVal, tmpIndex;
            for (var key in obj) {
              if (obj.hasOwnProperty(key)) {
                arrBuses.push(obj[key]);
                arrBusesVal.push(key);
              }
            }
            if (obj) {
                    for (var i=0 ; i < arrBuses.length ; i++) {
                         tmpObj = "";
                         resultarrBuses.push({busno: arrBusesVal[i], departures: arrBuses[i]} );
                    }
              }
              $scope.stationBuses = resultarrBuses;
           }) ; 
            
     };

   }

    angular.module('angularjstest').factory('getStations', function($http) {
          var getStations = {
            httpGet: function(minlon,minlat, maxlon, maxlat, api_key, app_id) {
              var urlGet = 'http://transportapi.com/v3/uk/bus/stops/bbox.json?minlon='+minlon+'&minlat='+minlat+'&maxlon='+maxlon+'&maxlat='+maxlat+'&api_key='+api_key+'&app_id='+app_id;
              var promise = $http.get(urlGet).then(function(response){
                return response.data;
              });
              return promise;
            }
          };
          return getStations;
        });

    angular.module('angularjstest').factory('getStationDetail', function($http) {
          var getStations = {
            httpGet: function(atcocode, api_key, app_id) {
              var urlGet = 'http://transportapi.com/v3/uk/bus/stop/'+atcocode+'/live.json?group=route&api_key='+api_key+'&app_id='+app_id;
              var promise = $http.get(urlGet).then(function(response){
                console.log("getStationDetail",response);
                return response.data;
              });
              return promise;
            }
          };
          return getStations;
        }); 

     angular.module('angularjstest').factory('SETTINGS', function() {
          // GLOBAL TRANSPORT API SETTINGS 
          var transportApiSettings = {  
            transportAppId : '915f5f01',
            transportApiKey : '6c790cc8b20f0b394dedf8ba0ff8353c',
            defaultLat : 51.522386, 
            defaultLong : -0.080682
          
          };
          
          return transportApiSettings;
        });       

    ItemsController.$inject = ['$scope', '$http', '$location', '$routeParams', 'getStations', 'getStationDetail','SETTINGS'];

    angular
    .module('angularjstest')
    .controller('ItemsController', ItemsController);



})();
