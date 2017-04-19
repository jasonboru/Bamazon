const mysql = require("mysql");
const Table = require("cli-table");
const inquirer = require("inquirer");
const colors = require('colors');
const keys = require("./keys.js");          //where my password is stored

const connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'root',                      //change to your user name if it is not root
    password : keys.keys.password,          //change to your password or set up a keys.js file
    database : 'Bamazon'                    //import schema.sql & schema-seeds.sql to have the Bamazon db.
});

var orderTotal = 0;

connection.connect(function(err) {          //set up connection
    if (err) throw err;
    //console.log("connected as id " + connection.threadId);
});

//function that displays a title banner
function logTitle() {
  var storeName = colors.yellow("Bamazon Hydroponics");
  var tagline = colors.yellow("Customer Portal");
  var tildas = colors.cyan('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

	console.log("");
	console.log(colors.green('_______________________________________________________________________________________________________'));
	console.log("");
	console.log(`${tildas} ${storeName} ${tagline} ${tildas}`);  //Template literal enclosed by the back-tick ` allows embedded expressions wrapped with ${}
	console.log("");
	console.log(colors.green('_______________________________________________________________________________________________________'));
	console.log("");
}

logTitle();

//function that prints a table of current items available
function showItemTable() {
    connection.query('SELECT * FROM products', function(err, results) {  //query all from the products table
            if (err) throw err;
            var table = new Table({   //syntax to create table from cli-table npm
                head: [colors.cyan('id'), colors.cyan('item'), colors.cyan('price'), colors.cyan('quantity')],
                colWidths: [5, 70, 13, 10]
            });
            for (var i = 0; i < results.length; i++){   //loop through all records of the db table
            table.push(   //push each record from the bd table to the cli table
                [(JSON.parse(JSON.stringify(results))[i]["item_id"]), (JSON.parse(JSON.stringify(results))[i]["product_name"]),
                ("$ "+JSON.parse(JSON.stringify(results))[i]["price"]), (JSON.parse(JSON.stringify(results))[i]["stock_quantity"])]);
  			}
        console.log(colors.green('_______________________________________________________________________________________________________'));
        console.log("\n" + table.toString());  //prints the constructed cli-table to screen
        console.log(colors.green('_______________________________________________________________________________________________________'));
        console.log("");
    });
}

showItemTable();

//function to run through a customer purchase
function customerBuy(){
	inquirer.prompt([
			{
			  type: 'input',
			  message: 'What is the id # of the item you would like to purchase?',
			  name: 'itemID',
        validate: function(value) {       //validation to make sure user enters a number
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
			},
			{
			  type: 'input',
			  message: 'What is the quantity you would like to buy?',
			  name: 'quantity',
        validate: function(value) {      //validation to make sure user enters a number
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
			}
		]).then(function(answer){
			var quantity = answer.quantity;
			var itemID = answer.itemID;
      //connect to db and select the record from products table with an item_id = the user answer
			connection.query('SELECT * FROM products WHERE item_id=?', [itemID], function(err, results){
				if (err) throw err;
				var stock_quantity = results[0].stock_quantity;
				if (stock_quantity < quantity) {  //if user orders more than available qty give message
					console.log(colors.red("Sorry, we don't have the stock to fill that request. Please order at or below the quantity listed"));
          setTimeout(customerBuy, 1000);  //recall the CustomerBuy function
				} else{  //if user order quantity can be fullfilled...
					stock_quantity -= quantity;  //subtract the users purchase qty from the store stock qty


          var totalPrice = quantity * results[0].price;
					var totalSales = totalPrice + results[0].product_sales;
					var department = results[0].department_name;




					console.log(colors.cyan("\nYour line item total on this product: $" + (quantity * results[0].price).toFixed(2)));  //print the order total $ to the user

          orderTotal += (parseFloat(totalPrice));
          console.log(colors.cyan("\nYour order total of all products this session: ") + colors.yellow("$"+orderTotal.toFixed(2))+"\n");

          //connect to db and update the stock_quantity to the post order qty
          connection.query('UPDATE products SET ? WHERE item_id=?', [{stock_quantity: stock_quantity}, itemID], function(err, results){
						if (err) throw err;
					});

          connection.query('SELECT total_sales FROM departments WHERE department_name=?', [department], function(err, results){
            if (err) throw err;
						var departmentTotal = results[0].total_sales + totalPrice;
						connection.query('UPDATE departments SET total_sales=? WHERE department_name=?', [departmentTotal, department], function(err, results){
							if(err) throw err;
						});
					});

          //nested inquirer to keep the customer ordering
          inquirer.prompt([
            {
              type: "confirm",
              message: "Would you like to order another item?",
              name: "yesOrNo",
              default: true
            }
          ]).then(function(data) {
					       if (data.yesOrNo) {  //if the answer is true(aka yes) then...
                   showItemTable();   // show item table for refrence
                   setTimeout(customerBuy, 1500); //recall the customerBuy function
                 } else {  //if the answer is no.....
                   console.log(colors.green("Thank you for using Bamazon")); //goodbye message
                   process.exit(0);  //kills the app processes and exits to command prompt
                 }
          });
				}
			});
		});
}

setTimeout(customerBuy, 500); //initiall calls the customerBuy function giving time for the list to print.
