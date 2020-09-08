$(function() {
  var sudoku_cells = $(".sudoku-cell"),
    is_highlighting = false,
    start_grid = [
      [1,2,3,4,5,6,7,8,9],
      [0,2,3,4,5,6,7,8,9],
      [0,0,3,4,5,6,7,8,9],
      [0,0,0,4,5,6,7,8,9],
      [0,0,0,0,5,6,7,8,9],
      [0,0,0,0,0,6,7,8,9],
      [0,0,0,0,0,0,7,8,9],
      [0,0,0,0,0,0,0,8,9],
      [0,0,0,0,0,0,0,0,9],
    ];

  /*
    Helper functions
  */
  function getHighlightedSudokuCells() {
    return sudoku_cells.filter(function() {
      if ($(this).find(".default").length === 1) {
        return false;
      }
      return $(this).hasClass("highlight");
    });
  }

  /*
    Populate grid
   */
  $.each(start_grid, function (row_index, row) {
    $.each(row, function (column_index, cell_value) {
      var cell_index = row_index * 9 + column_index;
      if (cell_value > 0) {
        $(sudoku_cells[cell_index]).append("<span class='centered default'>" + cell_value + "</span>");
      }
    })
  })

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
    if (event.key > 0) {
      var highlighted_cells = getHighlightedSudokuCells(),
        user_number = event.key;
      if (highlighted_cells.length > 1) {
        $.each(highlighted_cells, function() {
          var sudoku_cell = $(this);
          sudoku_cell.empty();
          sudoku_cell.append("<span class='pencil pencil--centered'>" + user_number + "</span>");
        });
      } else if (highlighted_cells.length === 1) {
        $.each(highlighted_cells, function() {
          var sudoku_cell = $(this);
          sudoku_cell.empty();
          sudoku_cell.append("<span class='centered'>" + user_number + "</span>");
        });
      }
    } else if (event.key === "Delete" || event.key === "Backspace") {
      var highlighted_cells = getHighlightedSudokuCells();
      $.each(highlighted_cells, function() {
        var sudoku_cell = $(this);
        sudoku_cell.empty();
      });
    }
  });
});
