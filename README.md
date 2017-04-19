# Bamazon CLI Store App

## UCF Coding Bootcamp Week 12 Project (Node.js & MySQL)

---

### Overview

In this activity, I created an Amazon-like storefront with the MySQL methods I've learned in the last week. The app takes in orders from customers and depletes stock from the store's inventory. As a bonus task, I programed the app to track product sales across the store's departments and then provides a summary of the highest-grossing departments in the store.

## Installation Instructions

1. Fork this repo and clone the forked repo to your computer.
2. Run `npm install`, this will install the npm dependencies from the package.json file.
3. Install mysql on your machine, if necessary -> https://www.mysql.com/
4. Set up your own localhost connection. In each of the `.js` files in this repo, update the connection settings as follows:

```javascript
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : <enter your user information>,
  password : <enter your password>,
  database : 'Bamazon'
});
```

5. In mysql Workbench, import `schema.sql` and `schema-seeds.sql` from this repo and run them to upload the db onto your localhost.
6. From the command-line,
	* To interact as a customer, run `node bamazonCustomer.js` to enter the Customer Portal, and follow the prompts on-screen.
	* To update items and adjust stock, as would a manager, run `node bamazonManager.js` and follow the prompts on-screen.
	* To evaluate whole departments and to add new departments, as would a supervisor, run `node bamazonSupervisor.js` and follow the prompts on-screen.

---

## Screenshots

### Customer Portal

1. typing `node bamazonCustomer.js` brings up the available items list and starts the prompts.

![customer_portal_01](images/customer_portal_01.jpg)

2. Answer the prompt with the id of the item you want to buy, then the quantity. Bamazon will give you your order total cost and then ask if you want to order another item. Answering `y` will bring up an updated item list and reprompt for another sale, answering `n` will exit the app.

![customer_portal_02](images/customer_portal_02.jpg)

3. If the customer keeps ordering the order total will show the cost of all different products ordered within the session.

![customer_portal_03](images/customer_portal_03.jpg)

4. If the customer tries to order more than the current stock level a message appears and then the customer is asked to re-enter their order request.

![customer_portal_04](images/customer_portal_04.jpg)

---

### Manager Portal

1. typing `node bamazonManager.js` brings up the menu of managerial task options.

      * View Active Items for Sale
      * View Low Stock Items
      * Change Stock Levels
      * Add New Item
      * Delete an item
      * Exit

![manager_portal_01](images/manager_portal_01.jpg)

2. Choosing _View Active Items for Sale_ will bring up the updated list of active items showing id, name, price & quantity of each item in the products table.

![manager_portal_02](images/manager_portal_02.jpg)

3. Choosing _View Low Stock Items_ will show a table of all items whose stock level has gone below 5.

![manager_portal_03](images/manager_portal_03.jpg)

4. Choosing _Change Stock levels_ will show an updated item list and ask for the id of the item you want to change. You can use negative or positive numbers.

![manager_portal_04](images/manager_portal_04.jpg)

when finished Bamazon will show the updated Item list with the stock change taken into effect.

![manager_portal_05](images/manager_portal_05.jpg)

5. Choosing _Add New Item_ will prompt the user for the new products name, retail price, department & initial stock quantity. It will then display an updated Item list with the new item included.

![manager_portal_06](images/manager_portal_06.jpg)

6. Choosing _Delete an Item_ will prompt the user for the item id of the product to delete, then it asks for a confirm since delete is permanent. If `Y` then the delete goes through, if `n` then it takes the user back to the menu.

![manager_portal_07](images/manager_portal_07.jpg)

6. Choosing _Exit_ will exit the application and bring the user back to the command prompt.

---

### Supervisor Portal

1. typing `node bamazonSupervisor.js` brings up the menu of Supervisor task options.

      * View Product Sales by Department
      * Create New Department
      * Exit

![supervisor_portal_01](images/supervisor_portal_01.jpg)

2. Choosing _View Product Sales by Department_ will bring up the department table showing department name, over-head costs, total sales, total profit.

![supervisor_portal_02](images/supervisor_portal_02.jpg)

3. Choosing _Create New Department_ will allow the user to add a new department to the table. Bamazon will ask for a name & over-head costs. The other two columns will update with product sales.

![supervisor_portal_03](images/supervisor_portal_03.jpg)

Then, if a Manager adds a product with the new Department...

![supervisor_portal_04](images/supervisor_portal_04.jpg)

And then, if a customer purchases that item...

![supervisor_portal_05](images/supervisor_portal_05.jpg)

The next time the a supervisor pulls up the Department Table the total sales & total profit fields will have been updated.

![supervisor_portal_06](images/supervisor_portal_06.jpg)

6. Choosing _Exit_ will exit the application and bring the user back to the command prompt.

- - -
## Known Issues & TODO Items

  * Add shopping cart functionality to the customer portal.

  * Add a wholesale cost column to the products table which then can be used to place item purchase orders and could also be used to compute/update over_head_costs.

- - -

## Copyright

Jason O'Brien (C) 2017.
