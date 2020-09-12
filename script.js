$(function() {
  // TODO: Tidy up js
  // TODO: Add touch support

  var sudoku_cells = $(".sudoku-cell"),
    button_numbers = $(".button-number"),
    button_delete = $("#button-delete"),
    is_highlighting = false,
    start_grid = [
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

  /*
    Helper functions
  */
  function getSelectedSudokuCells() {
    return sudoku_cells.filter(function() {
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

    $.each(sudoku_cells, function() {
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
    $(sudoku_cells[newCellIndex]).addClass("highlight");
  }

  /*
    Populate grid
   */
  $.each(start_grid, function(row_index, row) {
    $.each(row, function(column_index, cell_value) {
      var cell_index = row_index * 9 + column_index;
      if (cell_value > 0) {
        $(sudoku_cells[cell_index]).append(
          "<span class='centered default'>" + cell_value + "</span>"
        );
      }
    });
  });

  /*
  Sudoku Grid Highlighting functionality
  Hold down left mouse to highlight multiple
  Hold down ctrl to select multiple as well
  */
  $.each(sudoku_cells, function() {
    var sudoku_cell = $(this);

    sudoku_cell.on("mousedown", function(event) {
      event.preventDefault();
      if (!event.ctrlKey) {
        $.each(sudoku_cells, function() {
          $(this).removeClass("highlight");
        });
      }
      sudoku_cell.addClass("highlight");
      is_highlighting = true;
    });

    sudoku_cell.on("mouseover", function(event) {
      if (is_highlighting) {
        sudoku_cell.addClass("highlight");
      }
    });
  });

  $(document).on("mouseup", function(event) {
    if (is_highlighting) {
      is_highlighting = false;
    }
  });

  /*
  Number pressed on keyboard add value to selected
  */
  $(document).on("keydown", function(event) {
    var isShift = event.shiftKey,
      keyPressed = event.key,
      keyCodePressed = event.code,
      selectedCells = getSelectedSudokuCells();

    if (!isShift && keyPressed > 0) {
      if (selectedCells.length > 1) {
        var existingNotes = selectedCells.find(
          "[data-sudoku-value=" + keyPressed + "]"
        ).length;
        $.each(selectedCells, function() {
          if (existingNotes < selectedCells.length) {
            addPencilCentered($(this), keyPressed);
          } else {
            removePencilCentered($(this), keyPressed);
          }
        });
      } else {
        $.each(selectedCells, function() {
          addNumber($(this), keyPressed);
        });
      }
    } else if (isShift && keyCodePressed.startsWith("Digit")) {
      var numberPressed = keyCodePressed.substr(keyCodePressed.length - 1);
      if (numberPressed > 0) {
        var existingNotes = selectedCells.find(
          "[data-sudoku-value=" + numberPressed + "]"
        ).length;
        $.each(selectedCells, function() {
          if (existingNotes < selectedCells.length) {
            addPencilCentered($(this), numberPressed);
          } else {
            removePencilCentered($(this), numberPressed);
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

  /*
  Number button pressed
   */
  $.each(button_numbers, function() {
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

  /*
  Clear button pressed
   */
  button_delete.on("click", function() {
    $.each(getSelectedSudokuCells(), function() {
      if ($(this).find(".default").length !== 1) {
        $(this).empty();
      }
    });
  });
});
