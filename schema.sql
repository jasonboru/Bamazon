CREATE DATABASE Bamazon; -- because you can get virtually anything at a great price

USE Bamazon;

CREATE TABLE products (
	item_id INT AUTO_INCREMENT,
	product_name VARCHAR(35) NOT NULL,
	department_name VARCHAR(25) NOT NULL,
	price DECIMAL(10, 2),
	stock_quantity INT(5),
	PRIMARY KEY (item_id)
);
