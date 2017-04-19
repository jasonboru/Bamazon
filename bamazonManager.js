const mysql = require("mysql");
const Table = require("cli-table");
const inquirer = require("inquirer");
const colors = require('colors');
const keys = require("./keys.js");      //where my password is stored

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",                     //change to your user name if it is not root
    password: keys.keys.password,     //change to your password or set up a keys.js file
    database: "Bamazon"               //import schema.sql & schema-seeds.sql to have the Bamazon db.
});

connection.connect(function(err) {    //set up connection
    if (err) throw err;
    //console.log("connected as id " + connection.threadId);
});

//function that displays a title banner
function logTitle() {
  var storeName = colors.yellow("Bamazon Hydroponics");
  var portal = colors.yellow("Manager Portal");
  var tildas = colors.cyan('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

	console.log("");
	console.log(colors.red('_______________________________________________________________________________________________________'));
	console.log("");
	console.log(`${tildas} ${storeName} ${portal} ${tildas}`); //Template literal enclosed by the back-tick ` allows embedded expressions wrapped with ${}
	console.log("");
	console.log(colors.red('_______________________________________________________________________________________________________'));
	console.log("");
}

logTitle();

//function that gives the user a menu of actions
function managerMenu(){
	inquirer.prompt([
			{
			  type: 'list',
			  message: 'Please choose a Bamazon managerial task:',
			  choices: ["View Active Items for Sale", "View Low Stock Items", "Change Stock Levels", "Add New Item", "Delete an Item", "Exit"],
			  name: 'options'
			}
		]).then(function(results){
			switch(results.options){
				case "View Active Items for Sale":
				  showItemTable();
					setTimeout(managerMenu, 1000);
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
        case "Delete an Item":
          showItemTable();
          setTimeout(deleteItem, 500);
          break;
				case 'Exit':
					console.log("Thank you for using Bamazon")
					process.exit(0);   //kills the app processes and exits to command prompt
					break;
			}
	});
};

managerMenu();

//function that prints a table of current items available
function showItemTable() {
    connection.query('SELECT * from products', function(err, results) {  //query all from the products table
            if (err) throw err;
            var table = new Table({    //syntax to create table from cli-table npm
                head: ['id', 'item', 'price', 'quantity'],
                colWidths: [5, 70, 13, 10]
            });
            for (var i = 0; i < results.length; i++){  //loop through all records of the db table
            table.push(  //push each record from the bd table to the cli table
                [(JSON.parse(JSON.stringify(results))[i]["item_id"]), (JSON.parse(JSON.stringify(results))[i]["product_name"]),
								("$ "+JSON.parse(JSON.stringify(results))[i]["price"]), (JSON.parse(JSON.stringify(results))[i]["stock_quantity"])]);
  			}
        console.log(colors.red('_______________________________________________________________________________________________________'));
        console.log("\n" + table.toString());  //prints the constructed cli-table to screen
        console.log(colors.red('_______________________________________________________________________________________________________'));
        console.log("");
    });
};

//function to print a table of low stck items (below qty of 5)
function showLowStock() {
    connection.query('SELECT * from products', function(err, results) { //select all records within the products table in db
        if (err) throw err;
        var table = new Table({  //syntax to create table from cli-table npm
            head: ['id', 'item', 'price', 'quantity'],
            colWidths: [5, 70, 13, 10]
        });
        for (var i = 0; i < results.length; i++){
        	if(results[i].stock_quantity < 5) {
	            table.push(  //push each record from the bd table to the cli table
	                [(JSON.parse(JSON.stringify(results))[i]["item_id"]), (JSON.parse(JSON.stringify(results))[i]["product_name"]),
									("$ "+JSON.parse(JSON.stringify(results))[i]["price"]), (JSON.parse(JSON.stringify(results))[i]["stock_quantity"])]);
	  		}
		}
        console.log(colors.red('_______________________________________________________________________________________________________'));
        console.log("\n" + table.toString());  //prints the constructed cli-table to screen
        console.log(colors.red('_______________________________________________________________________________________________________'));
        console.log("");
    });
		setTimeout(managerMenu, 1000);
};

//function to allow user to change stock quantities within the db
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
    //connect to db and select the record from products table with an item_id = the user answer
		connection.query('SELECT stock_quantity FROM products WHERE item_id=?', [product], function(err, results){
			currentQuantity = parseInt(results[0].stock_quantity); //set var currentQuantity to value of stock_quantity of the record returned
      //connect to db and update the stock_quantity to the post adjustment qty
      connection.query('UPDATE products SET ? WHERE item_id=?',
							[
	             {stock_quantity: quantity + currentQuantity},
	             product
	            ],
            	function(err, results){
					if (err) throw err;
						if (quantity && product !== undefined) { //when var quantity & product are defined...
							console.log("\n Stock has been updated. New Item list printing...");
							setTimeout(showItemTable, 1500);
							console.log("");
							setTimeout(managerMenu, 3000);
						}
			});
		});
	});
};

//function to add a new item to the database
function addNewItem(){
  connection.query("SELECT * FROM departments", function(err, results) {
    if (err) throw err;

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
				type: 'list',
				message: 'Please choose a department for this item.',
        choices: function() {
          var choiceArray = [];
          for (var i = 0; i < results.length; i++) {
            choiceArray.push(results[i].department_name);
          }
          return choiceArray;
        },
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
      //connect to db and insert the new record with user supplied values
			connection.query('INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)', [item_name, department_name, price, stock_quantity], function(err, results){
				if(err) throw err;
			});
      //once all the answers have been supplied by the user...
			if (item_name && price && stock_quantity && department_name !== undefined) {
        setTimeout(showItemTable, 500);
				setTimeout(managerMenu, 1500);
			}

		});
  });
};

//function to delete a record from the database
function deleteItem() {
  inquirer.prompt([
      {
        type: 'input',
        message: 'What is the id # of the item you want to delete?',
        name: 'product'
      },
  ]).then(function(answer){
      var product = answer.product;  //users answer stored ar var product
        //connect to db and select the entire record WHERE the id matches users answer
        connection.query('SELECT * FROM products WHERE item_id=?', [product], function(err, res) {
          if (err) throw err;
          var item_name = String(res[0].product_name);  //store the records product name to use in a message later
            // setup a nested inquirer confirm to make sure the user does not delete without warning
            inquirer.prompt([
              {
                type: 'confirm',
                message: '\nAre you sure you want to delete '+colors.yellow(item_name)+'? This will erase this item from the database.',
                name: 'itemDelete',
                default: false    //with default as flase a user answer "y" will delete any other key will not
              },
            ]).then(function(data){
                if (data.itemDelete) {  //if the answer to the confirm is true (aka yes) then run....
                  //connect to db and delete the entire record WHERE the id matches users 1st answer
                  connection.query('DELETE FROM products WHERE item_id=?', [product], function(err, results) {
                      if (err) throw err;
                      console.log("\nThe item " + colors.yellow(item_name) + " has been "+ colors.red("DELETED")); //gives the user a message of the item that was deleted
                      console.log("\ngenerating updated item list......\n");  //continued message
                      setTimeout(showItemTable, 1000);  //Show an updated Item table to the user post deletion (1 sec after message)
                      setTimeout(managerMenu, 1500);    //bring up the menu 1.5 sec after message, .5 sec after item list
                  });
                }else {   //if the users answer to the confirm was not yes then....
                  managerMenu();  //bring up the menu
                }
            });
        });
  });
};
