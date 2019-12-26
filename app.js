// Budget Controller
var budgetController = (function() {

  // Expense Function Constructor
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  // Calculates the new percentages
  Expense.prototype.calcPercentage = function(totalIncome) {

    if (totalIncome > 0) {

      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  // Gets the new percentages
  Expense.prototype.getPercentage = function() {

    return this.percentage;
  };
  // Income Function Constructor
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Calculates the sum of income and expenses by looping among the items
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    // Stores the sum of income and expenses
    data.totals[type] = sum;
  };

  // Stores expenses, income, budget and percentage
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {

    // addItem function for adding income or expense
    addItem: function(type, des, val) {

      var newItem, ID;

      // ID = lastID + 1
      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      // Push it into the data structure
      data.allItems[type].push(newItem);
      // Return the new element
      return newItem;
    },
    // Deletes the item from income or expenses
    deleteItem: function(type, id) {

      var ids, index;

      ids = data.allItems[type].map(function(current) {

        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    // Calculates total income and expenses, budget and the percentage
    calculateBudget: function() {

      // Calculate total income and expenses
      calculateTotal('inc');
      calculateTotal('exp');

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // Prevents the infinity value when there is expense and not income
      if (data.totals.inc > 0) {
        // Calculate the percentage of income that is spent
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    // Calculates the percentages of expenses
    calculatePercentages: function() {

      data.allItems.exp.forEach(function(cur) {

        cur.calcPercentage(data.totals.inc);
      });
    },
    // Returns the new percentages
    returnPercentages: function() {

      var allPercentages = data.allItems.exp.map(function(cur) {

        return cur.getPercentage();
      });

      return allPercentages;
    },

    // Returns the budget, total income and expenses, percentage
    returnBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };

}) ();

// UI Controller
var UIController = (function() {

  // Keeping all classes in an object to be able to make changes easily
  var DOMstrings = {
    inputType: '.add-type',
    inputDescription: '.add-description',
    inputValue: '.add-value',
    inputBttn: '.add-bttn',
    incomeList: '.income-list',
    expensesList: '.expenses-list',
    budgetValue: '.budget-amount',
    incomeValue: '.budget-income-amount',
    expensesValue: '.budget-expenses-amount',
    percentageValue: '.budget-expenses-percentage',
    container: '.container',
    expensesPerc: '.item-percentage',
    date: '.month'
  };

  // Formatting the look of numbers
  var formatNumber = function(num, type) {

    var numSplit, int, dec, type;

    // 2 decimal points
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];

    // Comma separating the thousands
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    // '+' or '-' before number and returns the formatted number
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {

    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  // Reading input data
  return {
    getInput: function() {

      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {

      var html, newHTML, element;

      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeList;

        html = '<div class="item clearfix" id="inc-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-delete"><button class="item-delete-bttn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

      } else if ( type === 'exp') {
        element = DOMstrings.expensesList;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-percentage">20%</div><div class="item-delete"><button class="item-delete-bttn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace placeholder text with actual data
      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

    },
    // Deletes the item from the UI
    deleteListItem: function(selectorID) {

      var el = document.getElementById(selectorID);

      el.parentNode.removeChild(el);

    },

    // Clears the input fields
    clearFields: function() {
      var fields, fieldsArr;

      // Creating a list and selecting the inputs
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      // Converting 'fields' list to an array
      fieldsArr = Array.prototype.slice.call(fields);

      // Iterating in 'fieldsArr' and clearing the inputs
      fieldsArr.forEach(function(cur, i, arr) {
        cur.value = "";
      });
      // Goes back automatically to 'Add description'
      fieldsArr[0].focus();
    },
    // Displays the budget values on the UI
    displayBudget: function(obj) {

      var type;

      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeValue).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesValue).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageValue).textContent = obj.percentage + ' %';
      } else {
        document.querySelector(DOMstrings.percentageValue).textContent = '---';
      }
    },
    // Displays the percentage of every item that is added to expenses list
    displayPercentages: function(percentages) {

      var percFields = document.querySelectorAll(DOMstrings.expensesPerc);

      nodeListForEach(percFields, function(current, index) {

        if (percentages[index] > 0) {

          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },
    // Displays the current date (month and year)
    displayDate: function() {

      var now, year, month, months;

      now = new Date();

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.date).textContent = months[month] + ' ' + year;
    },
    // Changes the color of the input fields according to the type
    typeChange: function() {

      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);

      nodeListForEach(fields, function(cur) {

        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBttn).classList.toggle('red');
    },

    // Making 'DOMstrings' object open to public from private condition
    getDOMstrings: function() {
      return DOMstrings;
    }
  };

}) ();

// Global App Controller
var controller = (function(budgetCtrl, UICtrl) {

  // Keeping event listeners in one function
  var setupEventListeners = function() {

    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBttn).addEventListener('click',  ctrlAddItem);

    // Provides entering an input by ENTER key.
    document.addEventListener('keypress', function(event) {

      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      };
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.typeChange);
  };
  // Calculates and returns the budget, income and expenses, percentage
  var updateBudget = function() {

    // Calculates the budget, income and expenses, percentage
    budgetCtrl.calculateBudget();

    // Returns the budget, income and expenses, percentage
    var budget = budgetCtrl.returnBudget();

    // Displays the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {

    // Calculates the percentages
    budgetCtrl.calculatePercentages();

    // Reads the percentages from the budget controller
    var percentages = budgetCtrl.returnPercentages();

    // Updates the UI with new percentages
    UICtrl.displayPercentages(percentages);

  };

  // Function for getting input data, adding items and calculating-displaying the budget
  var ctrlAddItem = function() {

    var input, newItem;

    // Gets the field input data
    input = UICtrl.getInput();

    // Prevents empty, NaN and 0 inputs to be processed
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

      // Adds the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // Adds the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // Clears the input fields
      UICtrl.clearFields();

      // Calculates and updates the budget
      updateBudget();

      // Calculates and updates the percentages
      updatePercentages();

    }
  };
  // Deletes item using event delegation
  var ctrlDeleteItem = function(event) {

    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
      // Deletes the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // Deletes the item from the UI
      UICtrl.deleteListItem(itemID);

      // Update and show the new budget
      updateBudget();
    }
  };

  // Creating an initialization function
  return {
    init: function() {
      console.log('STARTED');
      // Displays the current date (month and year)
      UICtrl.displayDate();
      // Resets the values to 0 at the beginning
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };

}) (budgetController, UIController);

// Calling initialization function from the outside
controller.init();