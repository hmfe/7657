var searchHistoryList = [];

function autocomplete(inp) {
  var currentFocus;
  inp.addEventListener("input", function(e) {
    var autocompleteListElement,
      autocompleteItemElement,
      val = this.value;
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    // fetch data from api
    if (inp.value.trim() !== "") {
      autocompleteListElement = document.createElement("section");
      autocompleteListElement.setAttribute("id", this.id + "autocomplete-list");
      autocompleteListElement.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(autocompleteListElement);
      autocompleteListElement.style.display = "block";
      getUserNamesList(inp.value, dataList => {
        if (dataList.length === 0) {
          autocompleteListElement.style.display = "none";
        }
        // create auto complete box items
        for (i = 0; i < dataList.length; i++) {
          if (
            dataList[i].substr(0, val.length).toUpperCase() == val.toUpperCase()
          ) {
            autocompleteItemElement = document.createElement("section");
            autocompleteItemElement.innerHTML =
              "<strong>" + dataList[i].substr(0, val.length) + "</strong>";
            autocompleteItemElement.innerHTML += dataList[i].substr(val.length);
            autocompleteItemElement.innerHTML +=
              "<input type='hidden' value='" + dataList[i] + "'>";
            autocompleteItemElement.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              fillHistoryList(inp.value);
              closeAllLists();
            });
            autocompleteItemElement.addEventListener("keydown", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              closeAllLists();
            });
            autocompleteListElement.appendChild(autocompleteItemElement);
          }
        }
      });
    }
  });

  // allow navigation inside auto complete box
  inp.addEventListener("keydown", function(e) {
    var autocompleteList = document.getElementById(
      this.id + "autocomplete-list"
    );
    if (autocompleteList)
      autocompleteList = autocompleteList.getElementsByTagName("section");
    // handle down key press
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(autocompleteList);
    }
    // handle up key press
    else if (e.keyCode == 38) {
      currentFocus--;
      addActive(autocompleteList);
    }
    // handle enter key press
    else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (autocompleteList) {
          autocompleteList[currentFocus].click();
        }
      }
    }
  });
  function addActive(autocompleteList) {
    if (!autocompleteList) return false;
    removeActive(autocompleteList);
    if (currentFocus >= autocompleteList.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = autocompleteList.length - 1;
    autocompleteList[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(autocompleteList) {
    for (var i = 0; i < autocompleteList.length; i++) {
      autocompleteList[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function(e) {
    closeAllLists(e.target);
  });
}

function createHistoryListGrid() {
  // create history grid UI based on items in array
  var historyGrid = document.getElementById("searchHistoryList");
  var gridTitle = document.getElementById("gridTitle");
  historyGrid.innerHTML = "";
  gridTitle.innerHTML = "";
  if (searchHistoryList.length > 0) {
    gridTitle.innerHTML =
      "<table class='grid-title'> <tr> <td style='width:50%'> <h3>Search History</h3></td><td style='width:50% ; text-align: end' > <h5><a href='#' aria-label='delete all search history' title='delete all search history' onclick='clearAllHistory()'>Clear search history</a></h5> </td></tr> </table>";
  }
  var htmlContent = "";
  searchHistoryList.forEach(function(element, index) {
    htmlContent +=
      "<tr data-label='historyRow'>" +
      "<td data-label='searchText'> <h3>" +
      element.searchText +
      "</td></h3>" +
      "<td data-label='historyDatetime'><h4>" +
      element.date +
      "," +
      element.time +
      "</td></h4>" +
      "<td data-label='removeHistory'><h4><a aria-label='delete history item' href='#' title='delete' onclick='removeHistoryItem(" +
      index +
      ")' >X</a></h4></td>" +
      "</tr>";
  });
  historyGrid.innerHTML = htmlContent;
}

function fillHistoryList(text) {
  searchHistoryList.push({
    searchText: text,
    date: new Date().toLocaleDateString(),
    time: new Date().toTimeString().split(" ")[0]
  });
  createHistoryListGrid();
}

// call Public API to get search results
function getUserNamesList(searchText, callback) {
  var data = null;

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = false;

  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      var data = JSON.parse(this.responseText);
      var items = data.result.map(function(item) {
        return item.first_name;
      });
      // filter list based on search text
      var filteredList = items.filter(item =>
        item.toUpperCase().startsWith(searchText.toUpperCase())
      );
      callback(filteredList);
    }
  });

  xhr.open(
    "GET",
    "https://gorest.co.in/public-api/users?_format=json&access-token=fz9rSqnyH9QuGHZDUNjUVFH7rSGeCrwmXF5N&first_name=" +
      searchText
  );
  xhr.send(data);
}

function clearAllHistory() {
  // clear history items and remove UI
  searchHistoryList = [];
  createHistoryListGrid();
}

function removeHistoryItem(index) {
  // remove specific history item
  searchHistoryList.splice(index, 1);
  if (searchHistoryList.length > 0) {
    createHistoryListGrid();
  } else {
    var historyGrid = document.getElementById("searchHistoryList");
    var gridTitle = document.getElementById("gridTitle");
    historyGrid.innerHTML = "";
    gridTitle.innerHTML = "";
  }
}
autocomplete(document.getElementById("searchtext"));
