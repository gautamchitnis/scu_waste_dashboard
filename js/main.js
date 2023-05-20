// main.js code
// Google Analytics: change UA-XXXXX-Y to be your site's ID.
// window.ga = function () { ga.q.push(arguments) }; ga.q = []; ga.l = +new Date;
// ga('create', 'UA-XXXXX-Y', 'auto'); ga('set', 'anonymizeIp', true); ga('set', 'transport', 'beacon'); ga('send', 'pageview');

var grids = [
  {x: 0, y: 0, width: 100, height: 100},
  {x: 200, y: 200, width: 150, height: 150}
];

window.addEventListener('DOMContentLoaded', function () {
  resizeOverlay();
  window.addEventListener('resize', resizeOverlay);
});

function mark(event) {
  var overlayRect = document.querySelector('.overlay').getBoundingClientRect();
  var offsetX = event.clientX - overlayRect.left;
  var offsetY = event.clientY - overlayRect.top;

  var clickedGrid = findClickedGrid(offsetX, offsetY);
  if (clickedGrid) {
    var mark = document.createElement("div");
    mark.className = "mark";
    mark.style.top = offsetY + "px";
    mark.style.left = offsetX + "px";
    document.querySelector('.overlay').appendChild(mark);

    drawRectangle(clickedGrid.x, clickedGrid.y, clickedGrid.width, clickedGrid.height);
    updateTextBox();
  }
}

function resizeOverlay() {
  var overlay = document.querySelector('.overlay');
  var image = document.getElementById('map');
  overlay.style.width = image.clientWidth + 'px';
  overlay.style.height = image.clientHeight + 'px';
}

function drawRectangle(x, y, width, height) {
  var rectangle = document.createElement("div");
  rectangle.className = "rectangle";
  rectangle.style.top = y + "px";
  rectangle.style.left = x + "px";
  rectangle.style.width = width + "px";
  rectangle.style.height = height + "px";
  document.querySelector('.overlay').appendChild(rectangle);
}

function findClickedGrid(x, y) {
  for (var i = 0; i < grids.length; i++) {
    var grid = grids[i];
    if (x >= grid.x && x <= grid.x + grid.width && y >= grid.y && y <= grid.y + grid.height) {
      return grid;
    }
  }
  return null;
}

function updateTextBox() {
  var textBox = document.getElementById('textBox');
  var activeGrids = getActiveGrids();
  textBox.innerHTML = '';

  if (activeGrids.length === 0) {
    textBox.innerText = 'No grids selected.';
  } else {
    var list = document.createElement('ul');
    for (var i = 0; i < activeGrids.length; i++) {
      var grid = activeGrids[i];
      var listItem = document.createElement('li');
      listItem.innerText = 'Grid ' + (i + 1) + ': (' + grid.x + ', ' + grid.y + ')';
      list.appendChild(listItem);
    }
    textBox.appendChild(list);
  }
}

function getActiveGrids() {
  var activeGrids = [];
  var marks = document.querySelectorAll('.mark');
  for (var i = 0; i < marks.length; i++) {
    var mark = marks[i];
    var grid = findGridByCoordinates(parseInt(mark.style.left), parseInt(mark.style.top));
    if (grid) {
      activeGrids.push(grid);
    }
  }
  return activeGrids;
}

function findGridByCoordinates(x, y) {
  for (var i = 0; i < grids.length; i++) {
    var grid = grids[i];
    if (x >= grid.x && x <= grid.x + grid.width && y >= grid.y && y <= grid.y + grid.height) {
      return grid;
    }
  }
  return null;
}
