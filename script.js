$(function() {
  var sudoku_cells = $(".sudoku-cell"),
    is_highlighting = false;

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

  function getHighlightedSudokuCells() {
    return sudoku_cells.filter(function() {
      if ($(this).find(".default").length === 1) {
        return false;
      }
      return $(this).hasClass("highlight");
    });
  }

  $(document).on("keydown", function(event) {
    if (event.key > 0) {
      var highlighted_cells = getHighlightedSudokuCells(),
        user_number = event.key;
      $.each(highlighted_cells, function() {
        var sudoku_cell = $(this);
        sudoku_cell.empty();
        sudoku_cell.append("<span class='centered'>" + user_number + "</span>");
      });
    } else if (event.key === "Delete" || event.key === "Backspace") {
      var highlighted_cells = getHighlightedSudokuCells();
      $.each(highlighted_cells, function() {
        var sudoku_cell = $(this);
        sudoku_cell.empty();
      });
    }
  });
});
