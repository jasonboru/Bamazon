const mysql = require("mysql");
const Table = require("cli-table");
const inquirer = require("inquirer");
const colors = require('colors');
var keys = require("./keys.js");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: keys.keys.password,
    database: "Bamazon"
});

var storeName = colors.yellow("Bamazon Hydroponics");
var tagline = colors.yellow("Manager Portal");

connection.connect(function(err) {
    if (err) throw err;
});

function logTitle() {
	console.log("");
	console.log(colors.red('_______________________________________________________________________________________________________'));
	console.log("");
	var tildas = colors.cyan('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
	console.log(`${tildas} ${storeName} ${tagline} ${tildas}`);
	console.log("");
	console.log(colors.red('_______________________________________________________________________________________________________'));
	console.log("");
}

logTitle();

function managerMenu(){
	inquirer.prompt([
			{
			  type: 'list',
			  message: 'Please choose a Bamazon managerial task:',
			  choices: ["View Active Items for Sale", "View Low Stock Items", "Change Stock Levels", "Add New Item", "Exit"],
			  name: 'options'
			}
		]).then(function(results){
			switch(results.options){
				case "View Active Items for Sale":
				  showItemTable();
					setTimeout(managerMenu, 1500);
					break;
				case "View Low Stock Items":
					showLowStock();
					break;
				case "Change Stock Levels":
					showItemTable();
					setTimeout(changeStockQty, 500);
					break;
				case "Add New Item":
					addNewItem();
					break;
				case 'Exit':
					console.log("Thank you for using Bamazon")
					process.exit(0);
					break;
			}
	});
};

managerMenu();

function showItemTable() {
    connection.query('SELECT * from products', function(err, results) {
            if (err) throw err;
            var table = new Table({
                head: ['id', 'item', 'price', 'quantity'],
                colWidths: [5, 75, 8, 10]
            });
            for (var i = 0; i < results.length; i++){
            table.push(
                [(JSON.parse(JSON.stringify(results))[i]["item_id"]), (JSON.parse(JSON.stringify(results))[i]["product_name"]),
								(JSON.parse(JSON.stringify(results))[i]["price"]), (JSON.parse(JSON.stringify(results))[i]["stock_quantity"])]);
  			}
        console.log("\n" + table.toString());
        console.log(colors.red('_______________________________________________________________________________________________________'));
        console.log("");
    });
};

function showLowStock() {
    connection.query('SELECT * from products', function(err, results) {
        if (err) throw err;
        var table = new Table({
            head: ['id', 'item', 'price', 'quantity'],
            colWidths: [5, 75, 8, 10]
        });
        for (var i = 0; i < results.length; i++){
        	if(results[i].stock_quantity < 5) {
	            table.push(
	                [(JSON.parse(JSON.stringify(results))[i]["item_id"]), (JSON.parse(JSON.stringify(results))[i]["product_name"]),
									(JSON.parse(JSON.stringify(results))[i]["price"]), (JSON.parse(JSON.stringify(results))[i]["stock_quantity"])]);
	  		}
		}
        console.log("\n" + table.toString());
        console.log(colors.red('_______________________________________________________________________________________________________'));
        console.log("");
    });
		delay = setTimeout(managerMenu, 1000);
};

function changeStockQty() {


	inquirer.prompt([
		{
		  type: 'input',
		  message: 'What is the id # of the item you want to adjust stock on?',
		  name: 'product'
		},
		{
		  type: 'input',
		  message: 'What is the quantity of items you are adding to stock?',
		  name: 'quantity'
		}
	]).then(function(answer){
		var quantity = parseInt(answer.quantity);
		var product = answer.product;
		var currentQuantity;
		connection.query('SELECT stock_quantity FROM products WHERE item_id=?', [product], function(err, results){
			currentQuantity = parseInt(results[0].stock_quantity);
			connection.query('UPDATE products SET ? WHERE item_id=?',
							[
	             {stock_quantity: quantity + currentQuantity},
	             product
	            ],
            	function(err, results){
					if (err) throw err;
						if (quantity && product !== undefined) {
							console.log("\n Stock has been updated. New Item list printing...");
							setTimeout(showItemTable, 1500);
							console.log("");
							setTimeout(managerMenu, 3000);
						}
			});

		});

	});

};

function addNewItem(){
	inquirer.prompt([
			{
				type: 'input',
				message: 'Please enter the item name.',
				name: 'item_name'
			},
			{
				type: 'input',
				message: 'Please enter the retail price.',
				name: 'price'
			},
			{
				type: 'input',
				message: 'Please enter this item\'s department.',
				name: 'department_name'
			},
			{

				type: 'input',
				message: 'Please enter initial stock quantity.',
				name: 'stock_quantity'
			}
		]).then(function(answers){
			var item_name = answers.item_name;
			var price = answers.price;
			var stock_quantity = answers.stock_quantity;
			var department_name = answers.department_name;

			connection.query('INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)', [item_name, department_name, price, stock_quantity], function(err, results){
				if(err) throw err;
			});
			if (item_name && price && stock_quantity && department_name !== undefined) {
        setTimeout(showItemTable, 500)
				setTimeout(managerMenu, 1500);
			}

		});

};
