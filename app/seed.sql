CREATE TABLE departments (
  dept_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT
);
INSERT INTO departments VALUES
 (1,'Engineering','Bangalore'),(2,'Sales','Mumbai'),(3,'HR','Pune'),
 (4,'Finance','Mumbai'),(5,'Marketing','Delhi'),(6,'Research','Chennai');

CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER REFERENCES departments(dept_id),
  manager_id INTEGER REFERENCES employees(emp_id),
  salary INTEGER NOT NULL,
  hire_date TEXT NOT NULL,
  gender TEXT,
  city TEXT,
  email TEXT
);
INSERT INTO employees VALUES
 (1,'Asha Rao',1,NULL,250000,'2015-03-01','F','Bangalore','asha@corp.com'),
 (2,'Vikram Shah',1,1,180000,'2016-07-15','M','Bangalore','vikram@corp.com'),
 (3,'Neha Gupta',1,2,120000,'2019-01-10','F','Pune','neha@corp.com'),
 (4,'Rohit Verma',1,2,115000,'2020-05-20','M','Bangalore','rohit@corp.com'),
 (5,'Kiran Kumar',1,2,95000,'2021-09-01','M','Hyderabad','kiran@corp.com'),
 (6,'Priya Nair',1,3,88000,'2022-02-14','F','Bangalore','priya@corp.com'),
 (7,'Arjun Mehta',1,3,88000,'2022-06-30','M','Pune',NULL),
 (8,'Sara Khan',2,1,160000,'2016-11-11','F','Mumbai','sara@corp.com'),
 (9,'Manoj Patil',2,8,90000,'2018-04-04','M','Mumbai','manoj@corp.com'),
 (10,'Divya Iyer',2,8,72000,'2020-08-18','F','Chennai','divya@corp.com'),
 (11,'Rahul Das',2,8,72000,'2021-12-01','M','Kolkata','rahul@corp.com'),
 (12,'Anita Joshi',2,9,55000,'2023-03-15','F','Mumbai','anita@corp.com'),
 (13,'Suresh Reddy',3,1,110000,'2017-02-20','M','Pune','suresh@corp.com'),
 (14,'Meera Pillai',3,13,65000,'2019-10-05','F','Pune','meera@corp.com'),
 (15,'Imran Ali',3,13,48000,'2024-01-08','M','Delhi','imran@corp.com'),
 (16,'Lakshmi Menon',4,1,170000,'2015-09-09','F','Mumbai','lakshmi@corp.com'),
 (17,'Gaurav Singh',4,16,98000,'2018-06-25','M','Delhi','gaurav@corp.com'),
 (18,'Pooja Bansal',4,16,98000,'2019-07-07','F','Mumbai','pooja@corp.com'),
 (19,'Tarun Malhotra',4,17,61000,'2022-11-21','M','Mumbai','tarun@corp.com'),
 (20,'Nisha Agarwal',5,1,140000,'2017-05-05','F','Delhi','nisha@corp.com'),
 (21,'Deepak Chopra',5,20,76000,'2020-02-29','M','Delhi','deepak@corp.com'),
 (22,'Kavya Hegde',5,20,67000,'2021-04-12','F','Bangalore','kavya@corp.com'),
 (23,'Farhan Qureshi',5,21,52000,'2023-08-01','M','Delhi','farhan@corp.com'),
 (24,'Ritu Saxena',1,2,150000,'2018-12-12','F','Bangalore','ritu@corp.com'),
 (25,'Ajay Thakur',1,24,101000,'2020-10-10','M','Pune','ajay@corp.com'),
 (26,'Sneha Kulkarni',2,8,83000,'2019-03-03','F','Pune','sneha@corp.com'),
 (27,'Varun Bhat',NULL,1,70000,'2024-06-01','M','Bangalore','varun@corp.com'),
 (28,'Isha Kapoor',4,16,115000,'2016-01-25','F','Mumbai','isha@corp.com'),
 (29,'Nikhil Jain',3,13,58000,'2022-09-19','M','Pune','nikhil@corp.com'),
 (30,'Sana Mirza',5,20,145000,'2018-08-08','F','Delhi','sara@corp.com');

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT,
  signup_date TEXT
);
INSERT INTO customers VALUES
 (1,'Acme Corp','Mumbai','India','2022-01-05'),
 (2,'Globex','Delhi','India','2022-02-11'),
 (3,'Initech','Bangalore','India','2022-03-20'),
 (4,'Umbrella','London','UK','2022-04-01'),
 (5,'Hooli','San Jose','USA','2022-05-15'),
 (6,'Stark Ind','New York','USA','2022-06-30'),
 (7,'Wayne Ent','Chicago','USA','2022-08-08'),
 (8,'Tyrell','London','UK','2022-09-09'),
 (9,'Soylent','Pune','India','2023-01-01'),
 (10,'Cyberdyne','Berlin','Germany','2023-02-14'),
 (11,'Wonka','Paris','France','2023-03-03'),
 (12,'Oscorp','New York','USA','2023-05-05'),
 (13,'Vandelay','Mumbai','India','2023-07-07'),
 (14,'Massive Dyn','Berlin','Germany','2023-09-09'),
 (15,'Pied Piper','San Jose','USA','2024-01-10');

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL
);
INSERT INTO products VALUES
 (1,'Laptop','Electronics',1200.0),(2,'Phone','Electronics',800.0),
 (3,'Tablet','Electronics',450.0),(4,'Headphones','Electronics',150.0),
 (5,'Desk','Furniture',300.0),(6,'Chair','Furniture',180.0),
 (7,'Lamp','Furniture',45.0),(8,'Notebook','Stationery',5.0),
 (9,'Pen','Stationery',2.0),(10,'Backpack','Accessories',60.0),
 (11,'Monitor','Electronics',350.0),(12,'Bookshelf','Furniture',220.0),
 (13,'Webcam','Electronics',90.0),(14,'Stapler','Stationery',8.0);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  order_date TEXT NOT NULL,
  status TEXT NOT NULL,
  amount REAL NOT NULL
);
INSERT INTO orders VALUES
 (101,1,'2023-01-05','DELIVERED',2400.0),(102,2,'2023-01-12','DELIVERED',800.0),
 (103,1,'2023-02-03','DELIVERED',605.0),(104,3,'2023-02-17','CANCELLED',450.0),
 (105,4,'2023-02-28','DELIVERED',1550.0),(106,5,'2023-03-09','DELIVERED',3600.0),
 (107,6,'2023-03-21','SHIPPED',180.0),(108,1,'2023-04-02','DELIVERED',150.0),
 (109,7,'2023-04-15','DELIVERED',1200.0),(110,8,'2023-04-29','RETURNED',800.0),
 (111,2,'2023-05-06','DELIVERED',920.0),(112,9,'2023-05-19','DELIVERED',60.0),
 (113,10,'2023-06-01','DELIVERED',2000.0),(114,5,'2023-06-14','DELIVERED',1200.0),
 (115,3,'2023-06-30','DELIVERED',525.0),(116,11,'2023-07-11','SHIPPED',300.0),
 (117,12,'2023-07-25','DELIVERED',1600.0),(118,6,'2023-08-08','DELIVERED',950.0),
 (119,1,'2023-08-19','DELIVERED',1245.0),(120,13,'2023-09-02','CANCELLED',220.0),
 (121,4,'2023-09-16','DELIVERED',700.0),(122,5,'2023-10-01','DELIVERED',800.0),
 (123,14,'2023-10-20','DELIVERED',350.0),(124,2,'2023-11-05','DELIVERED',2600.0),
 (125,7,'2023-11-18','SHIPPED',90.0),(126,10,'2023-12-01','DELIVERED',1500.0),
 (127,1,'2023-12-24','DELIVERED',480.0),(128,6,'2024-01-07','DELIVERED',1200.0),
 (129,3,'2024-01-21','DELIVERED',950.0),(130,5,'2024-02-02','PENDING',450.0),
 (131,9,'2024-02-14','DELIVERED',310.0),(132,12,'2024-03-01','DELIVERED',800.0),
 (133,2,'2024-03-15','RETURNED',150.0),(134,4,'2024-03-30','DELIVERED',2450.0),
 (135,1,'2024-04-12','DELIVERED',1800.0),(136,8,'2024-04-26','DELIVERED',360.0),
 (137,11,'2024-05-10','DELIVERED',45.0),(138,5,'2024-05-24','DELIVERED',1550.0),
 (139,13,'2024-06-07','PENDING',600.0),(140,6,'2024-06-21','DELIVERED',2000.0);

CREATE TABLE order_items (
  order_id INTEGER REFERENCES orders(order_id),
  product_id INTEGER REFERENCES products(product_id),
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
INSERT INTO order_items VALUES
 (101,1,2,1200.0),(102,2,1,800.0),(103,8,1,5.0),(103,4,4,150.0),
 (104,3,1,450.0),(105,1,1,1200.0),(105,11,1,350.0),(106,1,3,1200.0),
 (107,6,1,180.0),(108,4,1,150.0),(109,1,1,1200.0),(110,2,1,800.0),
 (111,3,1,450.0),(111,6,2,180.0),(111,9,5,2.0),(111,10,1,60.0),(111,8,10,5.0),
 (112,10,1,60.0),(113,2,2,800.0),(113,11,1,350.0),(113,9,25,2.0),
 (114,1,1,1200.0),(115,6,2,180.0),(115,7,1,45.0),(115,4,1,120.0),
 (116,5,1,300.0),(117,2,2,800.0),(118,3,1,450.0),(118,5,1,300.0),(118,12,1,200.0),
 (119,1,1,1200.0),(119,7,1,45.0),(120,12,1,220.0),(121,11,2,350.0),
 (122,2,1,800.0),(123,11,1,350.0),(124,1,2,1200.0),(124,12,1,200.0),
 (125,8,18,5.0),(126,5,5,300.0),(127,6,2,180.0),(127,4,1,120.0),
 (128,1,1,1200.0),(129,3,1,450.0),(129,5,1,300.0),(129,12,1,200.0),
 (130,3,1,450.0),(131,4,2,150.0),(131,8,2,5.0),(132,2,1,800.0),
 (133,4,1,150.0),(134,1,2,1200.0),(134,10,1,50.0),(135,2,1,800.0),(135,1,1,1000.0),
 (136,6,2,180.0),(137,7,1,45.0),(138,1,1,1200.0),(138,11,1,350.0),
 (139,5,2,300.0),(140,2,2,800.0),(140,3,1,400.0);

CREATE TABLE logins (
  user_id INTEGER NOT NULL,
  login_date TEXT NOT NULL
);
INSERT INTO logins VALUES
 (1,'2024-01-01'),(1,'2024-01-02'),(1,'2024-01-03'),(1,'2024-01-05'),
 (2,'2024-01-01'),(2,'2024-01-03'),(2,'2024-01-04'),(2,'2024-01-05'),(2,'2024-01-06'),
 (3,'2024-01-02'),(3,'2024-01-02'),(3,'2024-01-09'),
 (4,'2024-01-01'),(4,'2024-01-02'),(4,'2024-01-03'),(4,'2024-01-04'),(4,'2024-01-05'),(4,'2024-01-06'),
 (5,'2024-01-10');
