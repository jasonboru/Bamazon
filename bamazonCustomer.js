var mysql = require("mysql");
var Table = require("cli-table");
var inquirer = require("inquirer");
const keys = require("./keys.js");

var connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'root',
    password : keys.keys.password,
    database : 'Bamazon'
});

var delay;

connection.connect(function(err) {
    if (err) throw err;
    //console.log("You are connected");
});

function showItemTable() {
    connection.query('SELECT * FROM products', function(err, results) {
            if (err) throw err;
            var table = new Table({
                head: ['id', 'item', 'price', 'quantity']
            });
            for (var i = 0; i < results.length; i++){
            table.push(
                [(JSON.parse(JSON.stringify(results))[i]["item_id"]), (JSON.parse(JSON.stringify(results))[i]["product_name"]),
                (JSON.parse(JSON.stringify(results))[i]["price"]), (JSON.parse(JSON.stringify(results))[i]["stock_quantity"])]);
  			}
        console.log("\n" + table.toString());
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
					console.log("Sorry, we don't have the stock to fill that request. Please order at or below the quantity listed");
				} else{
					stock_quantity -= quantity;
					console.log("Your total price is - " + quantity * results[0].price);
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
                   delay = setTimeout(customerBuy, 1500);
                 } else {
                   console.log("Thank you for using Bamazon")
                   process.exit(0);
                 }
          });

				}

			});
		});
}

delay = setTimeout(customerBuy, 1500);

exports.showItemTable = showItemTable;
