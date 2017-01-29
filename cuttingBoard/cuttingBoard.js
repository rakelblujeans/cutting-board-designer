'use strict';

/** Board defintion
  * - layers
  * - thickness
  * - length
  * - blade kerf
  *
  * Layer definition
  * - woodBlock
  *
  * API:
  * - save/load board design to/from text file
  *
  */

angular.module('myApp.cuttingBoard', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/cuttingBoard', {
    templateUrl: 'cuttingBoard/cuttingBoard.html',
    controller: 'CuttingBoardCtrl',
    controllerAs: 'designer'
  });
}])

.controller('CuttingBoardCtrl',
    ['$log', '$scope', 'dragulaService', 'pouchDB',
    function($log, $scope, dragulaService, pouchDB) {
  // import woods from 'data/woods.js!text';
  this.$log = $log;
  this.$scope = $scope;
  this.dragulaService = dragulaService;
  this.pouchDB = pouchDB;

  const db = this.pouchDB('boards');

  const defaultBoard = {
    measurementSystem: 'imperial',
    showBorders: true,
    bladeKerf: 0.125,
    isFlipped: false,
    layers: [{},{},{},{},{},{},{},{},{}], // Each layer is assumed to be 1 inch
    edgeGrain: {
      boardLength: 19,
      thickness: 1.5,
    },
    endGrain: {
      // numStrips: 13,
      crosscutWidth: 1.25
    }
  };

  this.board = Object.assign({}, defaultBoard);
  this.woodTypes = [
    {
      name: 'Maple',
      color: '#f5c48b',
    },
    {
      name: 'Cherry',
      color: '#a44124',
    },
    {
      name: 'Poplar',
      color: '#e4d4b5',
    },
    {
      name: 'Bamboo',
      color: '#fcd481',
    },
    {
      name: 'Oak',
      color: '#b27c44',
    },
    {
      name: 'Walnut',
      color: '#62432f',
    },
    {
      name: 'Purple Heart',
      color: '#3e0616',
    },
  ];

  dragulaService.options(this.$scope, 'bag-layer', {
    revertOnSpill: true,
    // moves: function(el, container, handle) {
    //   return handle.className === 'handle';
    // }
  });

  this.addLayer = function() {
    this.board.layers.push({});
    this.calcEndGrainDimensions();
  };

  this.removeLayer = function(idx) {
    this.board.layers.splice(idx, 1);
    this.calcEndGrainDimensions();
  };

  this.endGrainLength = function() {
    return this.board.endGrain.numStrips * this.board.edgeGrain.thickness;
  }

  this.calcEndGrainDimensions = function() {
    const stripWidth = this.board.endGrain.crosscutWidth + this.board.bladeKerf;
    this.board.endGrain.numStrips = Math.floor(this.board.edgeGrain.boardLength / stripWidth);
    this.board.endGrain.boardLength = this.board.endGrain.numStrips * this.board.edgeGrain.thickness;
  }

  this.getEndGrainStrips = function() {
    return new Array(this.board.endGrain.numStrips);
  }

  this.getEndGrainStripColor = function(i, j, isOddRow) {
    const isFlipped = this.board.isFlipped && isOddRow;

    if (isFlipped) {
      const woodBlock = this.board.layers[this.board.layers.length - i - 1].wood;
      return woodBlock ? woodBlock.color : null;
    } else {
      const woodBlock = this.board.layers[i].wood;
      return woodBlock ? woodBlock.color : null;
    }
  };

  this.getMaterialList = function() {
    const materials = {};
    if (!this.board || !!this.board.layers) {
      return materials;
    }

    for (let i = 0; i < this.board.layers.length; i++) {
      if (this.board.layers[i].wood) {
        if (!materials[this.board.layers[i].wood.name]) {
          // todo: all strips are the same width right now
          materials[this.board.layers[i].wood.name] = 1;
        } else {
          materials[this.board.layers[i].wood.name] += 1 + this.board.bladeKerf;
        }
      }
    }

    return materials;
  };

  this.onClearClick = function() {
    this.board = Object.assign({}, defaultBoard);
    this.board.layers = [];
  };

  this.showLicense = function(event) {
    this.licenseVisible = !this.licenseVisible;
    event.preventDefault();
  };

  this.closeLicense = function() {
    this.licenseVisible = false;
  }

  this.onSaveClick = function() {
    var jsonData = JSON.stringify(this.board);
    download(jsonData, 'boardDesign.txt', 'text/plain');
  };

  function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
  }


  /**
   * Check for the various File API support.
   */
  this.checkFileAPI = function() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      this.reader = new FileReader();
      return true;
    } else {
      alert('The File APIs are not fully supported by your browser. Fallback required.');
      return false;
    }
  }

  /**
   * read text input
   */
  this.readText = function(filePath) {
    var output = ''; // placeholder for text output
    if(filePath.files && filePath.files[0]) {
      var self = this;
      this.reader.onload = function (e) {
        output = e.target.result;
        self.board = JSON.parse(output);
        self.$scope.$applyAsync();
      }; // end onload()
      this.reader.readAsText(filePath.files[0]);
    } // end if html5 filelist support
    else if (ActiveXObject && filePath) { //fallback to IE 6-8 support via ActiveX
      try {
        this.reader = new ActiveXObject('Scripting.FileSystemObject');
        var file = this.reader.OpenTextFile(filePath, 1); //ActiveX File Object
        output = file.ReadAll(); //text contents of file
        file.Close(); //close file "input stream"
        self.board = JSON.parse(output);
        self.$scope.$applyAsync();
      } catch (e) {
        if (e.number == -2146827859) {
          alert('Unable to access local files due to browser security settings. ' +
           'To overcome this, go to Tools->Internet Options->Security->Custom Level. ' +
           'Find the setting for "Initialize and script ActiveX controls not marked as safe" and ' +
           'change it to "Enable" or "Prompt"');
        }
      }
    }
    else { // this is where you could fallback to Java Applet, Flash or similar
      return false;
    }

    return true;
  }

  // finish initialization
  this.calcEndGrainDimensions();
  this.checkFileAPI();
}]);
