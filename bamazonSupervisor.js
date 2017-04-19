const mysql = require("mysql");
const Table = require("cli-table");
const inquirer = require("inquirer");
const colors = require('colors');
const keys = require("./keys.js");          //where my password is stored

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user     : 'root',                      //change to your user name if it is not root
    password : keys.keys.password,          //change to your password or set up a keys.js file
    database : 'Bamazon'                    //import schema.sql & schema-seeds.sql to have the Bamazon db.
});

connection.connect(function(err) {
    if (err) throw err;
    //console.log("connected as id " + connection.threadId);
});

//function that displays a title banner
function logTitle() {
  var storeName = colors.yellow("Bamazon Hydroponics");
  var tagline = colors.yellow("Supervisor Portal");
  var tildas = colors.cyan('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

	console.log("");
	console.log(colors.magenta('_______________________________________________________________________________________________________'));
	console.log("");
	console.log(`${tildas} ${storeName} ${tagline} ${tildas}`);  //Template literal enclosed by the back-tick ` allows embedded expressions wrapped with ${}
	console.log("");
	console.log(colors.magenta('_______________________________________________________________________________________________________'));
	console.log("");
}

logTitle();

//function to give the user a menu of supervisor options
function supervisorMenu(){
	inquirer.prompt([
			{
			  type: 'list',
			  message: 'Please choose a Bamazon supervisor task:',
			  choices: ["View Product Sales by Department", "Create New Department", "Exit"],
			  name: 'options'
			}
		]).then(function(results){
			switch(results.options){
				case "View Product Sales by Department":
				  showDeptTable();                    //show the department table
					setTimeout(supervisorMenu, 1000);  //bring up the menu 1 sec after table display
					break;
				case "Create New Department":
					addNewDept();                      //run the new department function
					break;
				case 'Exit':
					console.log("Thank you for using Bamazon")
					process.exit(0);   //kills the app processes and exits to command prompt
					break;
			}
	});
};

supervisorMenu();  //initially calls the menu on app startup

//Function to print the department table to the user
function showDeptTable() {
    connection.query('SELECT * FROM departments', function(err, results) {        //connect to db and select all inside departments table
            if (err) throw err;
            var table = new Table({                                               //set up display table using code from the cli-table documentation
                head: [colors.magenta('id'), colors.magenta('department name'),   //set column headers
                  colors.magenta('over-head costs'), colors.magenta('total sales'), colors.magenta('total profit')],
                colWidths: [5, 23, 23, 23, 23]                                    //set column widths
            });
            for (var i = 0; i < results.length; i++){     //loop through the results of the connection.query
            table.push(                                   //push each record to the display table for each loop through
                [(JSON.parse(JSON.stringify(results))[i]["department_id"]), (JSON.parse(JSON.stringify(results))[i]["department_name"]),
                ("$ "+JSON.parse(JSON.stringify(results))[i]["over_head_costs"].toFixed(2)), ("$ "+JSON.parse(JSON.stringify(results))[i]["total_sales"].toFixed(2)),
                ("$ "+parseFloat(results[i].total_sales - results[i].over_head_costs).toFixed(2))]);
  			}
        console.log(colors.magenta('_______________________________________________________________________________________________________'));
        console.log("\n" + table.toString());              //prints the constructed cli-table to screen
        console.log(colors.magenta('_______________________________________________________________________________________________________'));
        console.log("");
    });
};

//function to allow the user to add a new record to the departments table
function addNewDept(){
	inquirer.prompt([
			{
				type: 'input',
				message: 'Please enter the department name.',
				name: 'dept_name'
			},
			{
				type: 'input',
				message: 'Please enter the over-head costs.',
				name: 'costs'
			}
		]).then(function(answers){
			var dept_name = answers.dept_name;   //stare the users answer for name as the var dept_name
			var costs = answers.costs;           //store the users answer for over-head costs as the var costs
      var totalSales = 0;
      //connect to db and insert the new record with user supplied values
			connection.query('INSERT INTO departments (department_name, over_head_costs, total_sales) VALUES (?, ?, ?)', [dept_name, costs, totalSales], function(err, results){
				if(err) throw err;
			});
      //once all the answers have been supplied by the user...
			if (dept_name && costs !== undefined) {
        setTimeout(showDeptTable, 500);
				setTimeout(supervisorMenu, 1500);
			}

		});

};
