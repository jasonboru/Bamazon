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

//Function to print the department table to the user
function showDeptTable() {
    connection.query('SELECT * FROM departments', function(err, results) {
            if (err) throw err;
            var table = new Table({
                head: [colors.magenta('id'), colors.magenta('depart name'),
                  colors.magenta('over-head costs'), colors.magenta('total sales'), colors.magenta('total profit')],
                colWidths: [5, 23, 23, 23, 23]
            });
            for (var i = 0; i < results.length; i++){
            table.push(
                [(JSON.parse(JSON.stringify(results))[i]["department_id"]), (JSON.parse(JSON.stringify(results))[i]["department_name"]),
                ("$ "+JSON.parse(JSON.stringify(results))[i]["over_head_costs"].toFixed(2)), ("$ "+JSON.parse(JSON.stringify(results))[i]["total_sales"].toFixed(2)),
                ("$ "+parseFloat(results[i].total_sales - results[i].over_head_costs).toFixed(2))]);
  			}
        console.log("\n" + table.toString());
        console.log(colors.magenta('_______________________________________________________________________________________________________'));
        console.log("");
    });
};

showDeptTable();
