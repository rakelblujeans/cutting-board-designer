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
    thickness: 1.5,
    boardLength: 19,
    isFlipped: false,
    layers: [{},{},{},{},{},{},{}], // Each layer is assumed to be 1 inch
    edgeGrain: {
      bladeKerf: 0.125
    },
    endGrain: {
      numStrips: 13, // TODO: why 13?
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

  // this.$scope
  // .$on('bag-layer.drop-model', function (e, el) {
    // el.removeClass('drop-model', e, el);
    // console.log(e, el, this.board && this.board.layers);
  // });

  this.addLayer = function() {
    this.board.layers.push({});
  };

  this.removeLayer = function(idx) {
    this.board.layers.splice(idx, 1);
  };

  this.endGrainLength = function() {
    return this.board.endGrain.numStrips * this.board.thickness;
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
    for (let i = 0; i < this.board.layers.length; i++) {
      if (this.board.layers[i].wood) {
        if (!materials[this.board.layers[i].wood.name]) {
          // todo: all strips are the same width right now
          materials[this.board.layers[i].wood.name] = 1;
        } else {
          materials[this.board.layers[i].wood.name] += 1 + this.board.edgeGrain.bladeKerf;
        }
      }
    }

    return materials;
  };

  this.clear = function() {
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

  // console.log(pouchDB);
  // const db = pouchDB('cuttingBoard');
  // var doc = { name: 'board1' };

  // function error(err) {
  //   $log.error(err);
  // }

  // function get(res) {
  //   if (!res.ok) {
  //     return error(res);
  //   }
  //   return db.get(res.id);
  // }

  // function bind(res) {
  //   $scope.doc = res;
  // }

}]);
