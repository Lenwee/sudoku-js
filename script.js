$(function() {
  var sudokuCells = $(".sudoku-cell"),
    btnNumbers = $(".btn-number"),
    btnDelete = $("#btn-delete"),
    btnUndo = $("#btn-undo"),
    btnRedo = $("#btn-redo"),
    chkPencil = $("#chk-pencil")
    isHighlighting = false,
    startingGrid = [
      [{type: 'D', value: 3}, 0, {type: 'D', value: 6}, {type: 'D', value: 5}, 0, {type: 'D', value: 8}, {type: 'D', value: 4}, 0, 0],
      [{type: 'D', value: 5}, {type: 'D', value: 2}, 0, 0, 0, 0, 0, 0, 0],
      [0, {type: 'D', value: 8}, {type: 'D', value: 7}, 0, 0, 0, 0, {type: 'D', value: 3}, {type: 'D', value: 1}],
      [0, 0, {type: 'D', value: 3}, 0, {type: 'D', value: 1}, 0, 0, {type: 'D', value: 8}, 0],
      [{type: 'D', value: 9}, 0, 0, {type: 'D', value: 8}, {type: 'D', value: 6}, {type: 'D', value: 3}, 0, 0, {type: 'D', value: 5}],
      [0, {type: 'D', value: 5}, 0, 0, {type: 'D', value: 9}, 0, {type: 'D', value: 6}, 0, 0],
      [{type: 'D', value: 1}, {type: 'D', value: 3}, 0, 0, 0, 0, {type: 'D', value: 2}, {type: 'D', value: 5}, 0],
      [0, 0, 0, 0, 0, 0, 0, {type: 'D', value: 7}, {type: 'D', value: 4}],
      [0, 0, {type: 'D', value: 4}, {type: 'D', value: 2}, 0, {type: 'D', value: 6}, {type: 'D', value: 3}, 0, 0]
    ],
    gridUndoHistory = [],
    gridRedoHistory = [];

  // Cell Functions
  function addDefaultNumber(cell, number) {
    cell.empty();
    cell.append("<span class='centered default'>" + number + "</span>");
  }

  function addUserNumber(cell, number) {
    if (cell.find(".default").length !== 1) {
      cell.empty();
      cell.append("<span class='centered'>" + number + "</span>");
    }
  }

  function addPencilNumber(cell, number) {
    if (cell.find(".default").length !== 1) {
      if (cell.find("[data-sudoku-value=" + number + "]").length === 0) {
        if (cell.find(".centered").length > 0) {
          cell.empty();
        }
        if (cell.find("span").length === 0) {
          cell.append(
            "<span class='pencil pencil--centered' data-sudoku-value='" +
            number +
            "'>" +
            number +
            "</span>"
          );
        } else {
          var spanAdded = false;
          $.each(cell.find("span"), function() {
            if ($(this).data("sudoku-value") > number) {
              if (!spanAdded) {
                spanAdded = true;
                $(
                  "<span class='pencil pencil--centered' data-sudoku-value='" +
                  number +
                  "'>" +
                  number +
                  "</span>"
                ).insertBefore($(this));
              }
            }
          });
          if (!spanAdded) {
            cell.append(
              "<span class='pencil pencil--centered' data-sudoku-value='" +
              number +
              "'>" +
              number +
              "</span>"
            );
          }
        }
      }
    }
  }

  function removePencilCentered(cell, number) {
    cell.find('[data-sudoku-value="' + number + '"]').remove();
  }

  function emptyCell(cell) {
    if (cell.find(".centered.default").length === 0) {
      cell.empty();
    }
  }

  // Grid Functions
  function setGridState(grid) {
    $.each(grid, function(rowIndex, row) {
      $.each(row, function(columnIndex, cellValue) {
        var cellIndex = rowIndex * 9 + columnIndex,
          cell = $(sudokuCells[cellIndex])
        cell.empty();
        if (cellValue !== 0) {
          if (cellValue['type'] === 'D') {
            addDefaultNumber(cell, cellValue['value'])
          } else if (cellValue['type'] === 'U') {
            addUserNumber(cell, cellValue['value'])
          } else if (cellValue['type'] === 'P') {
            cellValue['value'].forEach(function (value, index) {
              addPencilNumber(cell, value)
            })
          }
        }
      });
    });
  }

  function getGridState() {
    var gridState = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    $.each(gridState, function(rowIndex, row) {
      $.each(row, function(columnIndex) {
        var cellIndex = rowIndex * 9 + columnIndex,
          cell = $(sudokuCells[cellIndex]);
        if (cell.find(".centered.default").length > 0) {
          gridState[rowIndex][columnIndex] = {
            type: 'D',
            value: parseInt(cell.find(".centered").text())
          };
        } else if (cell.find(".centered").length > 0) {
          gridState[rowIndex][columnIndex] = {
            type: 'U',
            value: parseInt(cell.find(".centered").text())
          };
        } else if (cell.find(".pencil").length > 0) {
          var pencil = [];
          $.each(cell.find(".pencil"), function() {
            pencil.push(parseInt($(this).text()));
          });
          gridState[rowIndex][columnIndex] = {
            type: 'P',
            value: pencil
          };
        }
      });
    });
    return gridState;
  }

  function checkGridsDifferent(grid1, grid2){
    var isDifferent = false;
    $.each(grid1, function(rowIndex, row) {
      $.each(row, function(columnIndex) {
        if(grid1[rowIndex][columnIndex] !== grid2[rowIndex][columnIndex]) {
          var grid1Value = grid1[rowIndex][columnIndex],
            grid2Value = grid2[rowIndex][columnIndex];

          if (grid1Value === 0 && typeof grid2Value === "object") {
            isDifferent = true;
          } else if (grid2Value === 0 && typeof grid1Value === "object"){
            isDifferent = true;
          } else {
            if (grid1Value['type'] !== grid2Value['type'] || grid1Value['value'] !== grid2Value['value']) {
              if (typeof grid1Value['value'] === 'object' && typeof grid2Value['value'] === 'object') {
                if (grid1Value['value'].length !== grid2Value['value'].length) {
                  isDifferent = true;
                  return
                }
                var grid1Array = grid1Value['value'].concat().sort(),
                  grid2Array = grid2Value['value'].concat().sort();

                for (var i = 0; i < grid1Array.length; i ++) {
                  if (grid1Array[i] !== grid2Array[i]) {
                    isDifferent = true
                    return
                  }
                }
              } else {
                isDifferent = true;
              }
            }
          }
        }
      });
    });
    return isDifferent;
  }

  function updateGridHistory() {
    var currentGridState = getGridState(),
      previousGridState = gridUndoHistory[gridUndoHistory.length-1];
    gridRedoHistory = [];

    if (checkGridsDifferent(currentGridState, previousGridState)) {
      gridUndoHistory.push(currentGridState);
    }
  }

  function getSelectedCells() {
    return sudokuCells.filter(function() {
      return $(this).hasClass("highlight");
    });
  }

  function highlightNumber(number) {
    sudokuCells.each(function() {
      $(this).removeClass("highlight-same");
    });
    if (getSelectedCells().length > 1) {
      return
    }
    $.each(sudokuCells.find("span.centered"), function() {
      if ($(this).text() === number) {
        $(this).parent().addClass("highlight-same");
      }
    });
  }

  function moveSelected(cell, direction) {
    var cellIndex = $(cell).index(".sudoku-cell"),
      row = Math.floor(cellIndex / 9),
      col = cellIndex % 9;

    $.each(sudokuCells, function() {
      $(this).removeClass("highlight");
    });

    switch (direction) {
      case "ArrowUp":
        row = row - 1;
        if (row < 0) {
          row = 8;
        }
        break;
      case "ArrowRight":
        col = col + 1;
        if (col >= 9) {
          col = 0;
        }
        break;
      case "ArrowLeft":
        col = col - 1;
        if (col < 0) {
          col = 8;
        }
        break;
      case "ArrowDown":
        row = row + 1;
        if (row >= 9) {
          row = 0;
        }
        break;
    }
    var newCellIndex = row * 9 + col;
    $(sudokuCells[newCellIndex]).addClass("highlight");
    if ($(sudokuCells[newCellIndex]).find("span.centered")) {
      highlightNumber($(sudokuCells[newCellIndex]).find("span.centered").text());
    }
  }

  // Mouse/Touch Events
  sudokuCells.on('mousedown touchstart', function(event) {
    event.preventDefault();
    var sudokuCell = $(this);
    if (!event.ctrlKey) {
      $.each(sudokuCells, function () {
        $(this).removeClass("highlight");
      })
    }
    sudokuCell.addClass("highlight");
    isHighlighting = true;
  });

  sudokuCells.on('mouseover', function (event) {
    event.preventDefault();
    var sudokuCell = $(this);
    if (isHighlighting) {
      sudokuCell.addClass("highlight");
      if (sudokuCell.find("span.centered")) {
        highlightNumber(sudokuCell.find("span.centered").text());
      }
    }
  });

  sudokuCells.on('touchmove', function (event) {
    event.preventDefault();
    var location = event.originalEvent.changedTouches[0],
      sudokuCell = document.elementFromPoint(
        location.clientX,
        location.clientY
      );
    if (isHighlighting) {
      $(sudokuCell).addClass("highlight");
      if ($(sudokuCell).find("span.centered")) {
        highlightNumber($(sudokuCell).find("span.centered").text());
      }
    }
  })

  $(document).on("mouseup touchend", function(event) {
    if (isHighlighting) {
      isHighlighting = false
    }
    if (getSelectedCells().length === 1) {
      var sudokuCell = $(getSelectedCells()[0])
      if (sudokuCell.find("span.centered")) {
        highlightNumber(sudokuCell.find("span.centered").text());
      }
    }
  });

  // Keyboard Controls
  $(document).on('keydown', function (event) {
    var isShift = event.shiftKey,
      keyPressed = event.key,
      codePressed = event.code,
      selectedCells = getSelectedCells();

    if (!isShift && keyPressed > 0) {
      updateGridHistory();
      $.each(selectedCells, function () {
        addUserNumber($(this), keyPressed);
      })
    } else if (isShift && codePressed.startsWith('Digit')) {
      var number = codePressed.substr(codePressed.length - 1);
      if (number > 0) {
        var existingNotes = selectedCells.find(
          "[data-sudoku-value=" + number + "]"
        ).length;
        updateGridHistory();
        $.each(selectedCells, function () {
          if (existingNotes < selectedCells.length) {
            addPencilNumber($(this), number);
          } else {
            removePencilCentered($(this), number);
          }
        })
      }
    } else if (keyPressed === 'Delete' || keyPressed === 'Backspace'){
      updateGridHistory();
      $.each(getSelectedCells(), function() {
        emptyCell($(this))
      });
    } else if (keyPressed.startsWith("Arrow")) {
      event.preventDefault();
      moveSelected(selectedCells[0], keyPressed);
    }
  });

  // Button Controls
  btnNumbers.on('click', function (event) {
    updateGridHistory();
    var number = $(this).data('number'),
      selectedCells = getSelectedCells();

    if (chkPencil.is(':not(:checked)')) {
      $.each(selectedCells, function () {
        addUserNumber($(this), number);
      });
    } else if (chkPencil.is(':checked')) {
      var existingNotes = selectedCells.find(
        "[data-sudoku-value=" + number + "]"
      ).length;
      $.each(selectedCells, function () {
        if (existingNotes < selectedCells.length) {
          addPencilNumber($(this), number);
        } else {
          removePencilCentered($(this), number);
        }
      })
    }
  });

  btnDelete.on("click", function() {
    updateGridHistory();
    $.each(getSelectedCells(), function() {
      emptyCell($(this))
    });
  });

  btnUndo.on('click', function () {
    if (gridUndoHistory.length >= 1) {
      var newGridState = gridUndoHistory.pop();
      gridRedoHistory.push(getGridState());
      setGridState(newGridState);
    }
  })

  btnRedo.on('click', function () {
    if (gridRedoHistory.length > 0) {
      var newGridState = gridRedoHistory.pop();
      gridUndoHistory.push(getGridState());
      setGridState(newGridState);
    }
  });

  setGridState(startingGrid);
  gridUndoHistory.push(startingGrid);
});
