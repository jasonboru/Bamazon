const mysql = require("mysql");
const Table = require("cli-table");
const inquirer = require("inquirer");
const colors = require('colors');
const keys = require("./keys.js");

var connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'root',
    password : keys.keys.password,
    database : 'Bamazon'
});

var delay;
var storeName = colors.yellow("Bamazon Hydroponics");
var tagline = colors.yellow("Customer Portal");

connection.connect(function(err) {
    if (err) throw err;
    //console.log("You are connected");
});

function logTitle() {
	console.log("");
	console.log(colors.green('_______________________________________________________________________________________________________'));
	console.log("");
	var tildas = colors.cyan('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
	console.log(`${tildas} ${storeName} ${tagline} ${tildas}`);
	console.log("");
	console.log(colors.green('_______________________________________________________________________________________________________'));
	console.log("");
}

logTitle();

function showItemTable() {
    connection.query('SELECT * FROM products', function(err, results) {
            if (err) throw err;
            var table = new Table({
                head: [colors.cyan('id'), colors.cyan('item'), colors.cyan('price'), colors.cyan('quantity')],
                colWidths: [5, 75, 8, 10]
            });
            for (var i = 0; i < results.length; i++){
            table.push(
                [(JSON.parse(JSON.stringify(results))[i]["item_id"]), (JSON.parse(JSON.stringify(results))[i]["product_name"]),
                (JSON.parse(JSON.stringify(results))[i]["price"]), (JSON.parse(JSON.stringify(results))[i]["stock_quantity"])]);
  			}
        console.log("\n" + table.toString());
        console.log(colors.green('_______________________________________________________________________________________________________'));
        console.log("");
    });
}

showItemTable();

function customerBuy(){
	inquirer.prompt([
			{
			  type: 'input',
			  message: 'What is the id # of the item you would like to purchase?',
			  name: 'itemID',
        validate: function(value) {
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
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
			}
		]).then(function(answer){
			var quantity = answer.quantity;
			var itemID = answer.itemID;

			connection.query('SELECT * FROM products WHERE item_id=?', [itemID], function(err, results){
				if (err) throw err;
				var stock_quantity = results[0].stock_quantity;
				if (stock_quantity < quantity) {
					console.log(colors.red("Sorry, we don't have the stock to fill that request. Please order at or below the quantity listed"));
          setTimeout(customerBuy, 1000);
				} else{
					stock_quantity -= quantity;
					console.log(colors.cyan("Your total price is - $" + (quantity * results[0].price).toFixed(2)));
					connection.query('UPDATE products SET ? WHERE item_id=?', [{stock_quantity: stock_quantity}, itemID], function(err, results){
						if (err) throw err;
					});
          inquirer.prompt([
            {
              type: "confirm",
              message: "Would you like to order another item?",
              name: "yesOrNo",
              default: true
            }
          ]).then(function(data) {
					       if (data.yesOrNo) {
                   showItemTable();
                   setTimeout(customerBuy, 1500);
                 } else {
                   console.log(colors.green("Thank you for using Bamazon"))
                   process.exit(0);
                 }
          });
				}
			});
		});
}

setTimeout(customerBuy, 1500);

exports.showItemTable = showItemTable;
