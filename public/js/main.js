
$(document).ready(function(){
    $('.sidenav').sidenav();
    $('.modal').modal();

    $('button.modal-trigger').click((evt) => {
        const el = evt.target;
        const text = $(el).text();
        const heading = $('.modal h4');
        const inputType = $('.modal .add__type');
        heading.text(`Add ${text}`)
        if(text == 'Income'){
            
            inputType.val('inc')
        }
        else if(text == 'Expense'){
            inputType.val('exp')
        }
    })
});

if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
}

self.addEventListener('beforeinstallprompt', e => {
    console.log('beforeinstallprompt invoked')
    e.preventDefault();
    e.prompt();
    e.userChoice.then(res => {
        console.log(res)
    })
})

$('#incomeBtn').click(evt => {
    // console.log(evt);
    evt.preventDefault();
    $(`.container .income`).css('display', 'block');
    $(`.container .expenses`).css('display', 'none');
    $('.add__type').val('inc');
    if($(window).width() < 993){
        $('.sidenav-overlay').click();
    }
    
})

$('#expensesBtn').click(evt => {
    // console.log(evt);
    evt.preventDefault();
    $(`.container .income`).css('display', 'none');
    $(`.container .expenses`).css('display', 'block');
    $('.add__type').val('exp');
    if($(window).width() < 993){
        $('.sidenav-overlay').click();
    }
})

$('.btn-floating-add').click(() => {
    $('.btn-floating-add').toggleClass('clicked')
    $('section').toggleClass('add-btn-clicked')
    $('.floating').toggleClass('active')
})


//from lec
// BUDGET CONTROLLER

var budgetController = (function() {
    
    var Expense = function(id, description, value, percentage = -1) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = percentage;
    };
    
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    
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
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1
            
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
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        
        
        deleteItem: function(type, id) {
            var ids, index;
            
            // id = 6
            //data.allItems[type][id];
            // ids = [1 2 4  8]
            //index = 3
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        
        calculateBudget: function() {
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }            
            
            // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
        },
        
        calculatePercentages: function() {
            
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc);
            });
        },
        
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            console.log(allPerc)
            return allPerc;
        },
        
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        setData: function(newData){
            data = newData;
            let incomes = [];
            data.allItems.inc.forEach((income, index) => {
                income = new Income(income.id, income.description, income.value);
                incomes.push(income)
            })
            data.allItems.inc = incomes

            data.allItems.exp = data.allItems.exp.map((expense, index) => {
                expense = new Expense(expense.id, expense.description, expense.value, expense.percentage);
                return expense
            })
        },
        
        getData: function() {
            // console.log(data);
            return data;
        }
    };
    
})();


//DATABASE CONTROLLER
var dbController = (function(budgetCtrl) {
    
    
    return {
        loadData: async function(){
            const time = getTime();
            const url = `/data/${time.year}/${time.month}`;
            const res = await fetch(url);
            const data = await res.json();
            budgetCtrl.setData(data);
            // fetch(url)
            // .then(res => res.json())
            // .then(doc => {
            //     budgetCtrl.setData(doc);
            // })
            // .catch(err => console.log(err))
        },
        uploadData: function(){
            const time = getTime();
            fetch('/data', {
                method: 'post',
                body: JSON.stringify({
                    year: time.year,
                    month: time.month,
                    data: budgetCtrl.getData()
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.log(err))
        }
    }


})(budgetController);


// UI CONTROLLER
var UIController = (function() {

    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add .add__btn',
        inputBtnModal: '.modal .add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    
    return {
        getInput: function() {
            let MOBILE_WIDTH = 993;
            let prefix;
            if($(window).width() > MOBILE_WIDTH){
                prefix = '.add ';
            }
            else{
                prefix = '.modal ';
            }
            return {
                type: document.querySelector(prefix + DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(prefix + DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(prefix + DOMstrings.inputValue).value)
            };
        },
        
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                console.log(percentages);
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        getTime: function(){
            let now = new Date();
            let monthIndex = now.getMonth();
            let year = now.getFullYear();

            return {
                month: monthIndex,
                year: year
            }
        },
        
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        init: function(budgetCtrl){
            var budget = budgetCtrl.getBudget();
            
            this.displayBudget(budget);

            // display all items to income and expenses list
            let incomes = budgetCtrl.getData().allItems.inc;
            incomes.forEach(income => {
                
                this.addListItem(income, 'inc');
            })

            let expenses = budgetCtrl.getData().allItems.exp;
            expenses.forEach(exp => {
                this.addListItem(exp, 'exp');
            })

            let percentages = budgetCtrl.getPercentages();
            this.displayPercentages(percentages);


        },
        
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();




// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl, dbCtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.querySelector(DOM.inputBtnModal).addEventListener('click', () => {
            $('.modal-overlay').click();
            $('.btn-floating-add').click();
            ctrlAddItem();
        });

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        // document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);        
    };
    
    
    var updateBudget = function() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    
    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the field input data
        input = UICtrl.getInput();   
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Calculate and update percentages
            updatePercentages();

            // 7. Update values in database
            dbCtrl.uploadData();
        }
    };
    
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and update percentages
            updatePercentages();

            // 5. Update values in database
            dbCtrl.uploadData();
        }
    };
    
    
    return {
        init: async function() {
            try{
                console.log('Application has started.');
                UICtrl.displayMonth();
                // console.log(budgetCtrl.getData())
                await dbCtrl.loadData();//data is also set in budgetCtrl
                // console.log(budgetCtrl.getData())

                UICtrl.init(budgetCtrl);

                
                setupEventListeners();
            }
            catch(e){
                console.log(e);
            }

            
        }
    };
    
})(budgetController, UIController, dbController);


controller.init();





function getTime(){
    let now = new Date();
    let monthIndex = now.getMonth();
    let year = now.getFullYear();

    return {
        month: monthIndex,
        year: year
    }
}