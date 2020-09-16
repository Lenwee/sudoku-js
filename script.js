$(function() {
  var sudokuCells = $(".sudoku-cell"),
    btnNumbers = $(".btn-number"),
    btnDelete = $("#btn-delete"),
    isHighlighting = false,
    startingGrid = [
      [3, 0, 6, 5, 0, 8, 4, 0, 0],
      [5, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 8, 7, 0, 0, 0, 0, 3, 1],
      [0, 0, 3, 0, 1, 0, 0, 8, 0],
      [9, 0, 0, 8, 6, 3, 0, 0, 5],
      [0, 5, 0, 0, 9, 0, 6, 0, 0],
      [1, 3, 0, 0, 0, 0, 2, 5, 0],
      [0, 0, 0, 0, 0, 0, 0, 7, 4],
      [0, 0, 5, 2, 0, 6, 3, 0, 0]
    ];

  // Populate Starting Grid
  $.each(startingGrid, function(rowIndex, row) {
    $.each(row, function(columnIndex, cellValue) {
      var cellIndex = rowIndex * 9 + columnIndex;
      if (cellValue > 0) {
        $(sudokuCells[cellIndex]).append(
          "<span class='centered default'>" + cellValue + "</span>"
        );
      }
    });
  });

  // Helper Functions
  function getSelectedSudokuCells() {
    return sudokuCells.filter(function() {
      return $(this).hasClass("highlight");
    });
  }

  function addPencilCentered(cell, number) {
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

  function addNumber(cell, number) {
    if (cell.find(".default").length !== 1) {
      cell.empty();
      cell.append("<span class='centered'>" + number + "</span>");
    }
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
  }

  function onMouseDown(sudokuCell, event) {
    event.preventDefault();
    $.each(sudokuCells, function() {
      $(this).removeClass("highlight-same");
    });
    if (!event.ctrlKey) {
      $.each(sudokuCells, function() {
        $(this).removeClass("highlight");
      });
    }
    sudokuCell.addClass("highlight");
    isHighlighting = true;
  }

  function onMouseOver(sudokuCell, event) {
    event.preventDefault();
    if (isHighlighting) {
      sudokuCell.addClass("highlight");
    }
  }

  function onMouseUp(event) {
    if (isHighlighting) {
      isHighlighting = false;
    }
    var selectedCells = getSelectedSudokuCells();
    if (selectedCells.length === 1) {
      var number = selectedCells.find("span.centered").text();

      $.each(sudokuCells.find("span.centered"), function() {
        if ($(this).text() === number) {
          $(this)
            .parent()
            .addClass("highlight-same");
        }
      });
    }
  }

  // Events
  $.each(sudokuCells, function() {
    var sudokuCell = $(this);

    sudokuCell.on("mousedown touchstart", function(event) {
      onMouseDown(sudokuCell, event);
    });

    sudokuCell.on("mouseover", function(event) {
      onMouseOver(sudokuCell, event);
    });

    sudokuCell.on("touchmove", function(event) {
      var location = event.originalEvent.changedTouches[0],
        newSudokuCell = document.elementFromPoint(
          location.clientX,
          location.clientY
        );
      onMouseOver($(newSudokuCell), event);
    });
  });

  $(document).on("mouseup touchend", function(event) {
    onMouseUp(event);
  });

  $(document).on("keydown", function(event) {
    var isShift = event.shiftKey,
      keyPressed = event.key,
      keyCodePressed = event.code,
      selectedCells = getSelectedSudokuCells();

    if (!isShift && keyPressed > 0) {
      $.each(selectedCells, function() {
        addNumber($(this), keyPressed);
      });
    } else if (isShift && keyCodePressed.startsWith("Digit")) {
      var numberPressed = keyCodePressed.substr(keyCodePressed.length - 1);
      if (numberPressed > 0) {
        var existingNotes = selectedCells.find(
          "[data-sudoku-value=" + numberPressed + "]"
        ).length;
        $.each(selectedCells, function() {
          if ($(this).find(".centered").length !== 1) {
            if (existingNotes < selectedCells.length) {
              addPencilCentered($(this), numberPressed);
            } else {
              removePencilCentered($(this), numberPressed);
            }
          }
        });
      }
    } else if (keyPressed === "Delete" || keyPressed === "Backspace") {
      $.each(selectedCells, function() {
        if ($(this).find(".default").length !== 1) {
          $(this).empty();
        }
      });
    } else if (keyPressed.startsWith("Arrow")) {
      moveSelected(selectedCells[0], keyPressed);
    }
  });

  $.each(btnNumbers, function() {
    var button = $(this);
    button.on("click", function(event) {
      var number = button.data("number"),
        action = $('[name="action"]:checked').val(),
        selectedCells = getSelectedSudokuCells();

      if (action === "confirm") {
        $.each(selectedCells, function() {
          addNumber($(this), number);
        });
      } else if (action === "pencil") {
        var existingNotes = selectedCells.find(
          "[data-sudoku-value=" + number + "]"
        ).length;
        $.each(selectedCells, function() {
          if (existingNotes < selectedCells.length) {
            addPencilCentered($(this), number);
          } else {
            removePencilCentered($(this), number);
          }
        });
      }
    });
  });

  btnDelete.on("click", function() {
    $.each(getSelectedSudokuCells(), function() {
      if ($(this).find(".default").length !== 1) {
        $(this).empty();
      }
    });
  });
});
