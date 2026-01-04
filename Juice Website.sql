--create db
create database Juice_db;
use Juice_db
EXEC sp_help 'Customers';

--Create Schema 

--Cutomer table 
create table Customers(
c_id int Not null,
c_name varchar(30) Not null,
Email varchar(100) UNIQUE not null ,
Address NVARCHAR(500) DEFAULT ('Not Provided'),
Primary key (c_id)

)

--Aleter
ALTER TABLE Customers
DROP CONSTRAINT UQ__Customer__A9D10534906C40FA;

--alter table column email with type varhchar
alter table Customers alter column Email varchar(255) 


alter table Customers alter column Address 


alter table Customers add  phone_no BIGINT
-- Order table

create table orders(
Order_id int Primary key ,
Order_Status VARCHAR(20) CHECK (Order_Status IN ('Pending', 'Processing', 'Delivered', 'Cancelled')),
total_amount decimal(10,2) not null ,
Order_Date DATETIME DEFAULT GETDATE(),
c_id int not null Foreign key (c_id) references Customers(c_id),
)

--category table

CREATE TABLE Category (
    Category_ID INT PRIMARY KEY IDENTITY(1,1),  -- Primary Key
    Category_Name NVARCHAR(100) NOT NULL,      -- Name of the category
    Description NVARCHAR(500)                  -- Optional description
);


--table product 

CREATE TABLE Product (
    Product_ID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Price DECIMAL(10,2),
    Image_URL NVARCHAR(255),   -- store file path or URL
    Category_ID INT,
    FOREIGN KEY (Category_ID) REFERENCES Category(Category_ID)
);



--table order_details

CREATE TABLE Order_Details (
    Order_Detail_ID INT PRIMARY KEY IDENTITY(1,1), -- Primary Key
    Order_ID INT NOT NULL,                          -- Foreign Key to Order
    Product_ID INT NOT NULL,                        -- Foreign Key to Product
    Quantity INT NOT NULL CHECK (Quantity > 0),    -- Quantity must be positive
    Price DECIMAL(10,2) NOT NULL CHECK (Price >= 0), -- Price must be non-negative

    -- Foreign Key Constraints
    CONSTRAINT FK_Order FOREIGN KEY (Order_ID)
        REFERENCES [Orders](Order_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT FK_Product FOREIGN KEY (Product_ID)
        REFERENCES Product(Product_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


--create table contact 

create table Contact(
contanct_id int primary key ,
contact_name varchar(10) not null,
contact_email varchar(50) not null,
message varchar(255) not null,
date datetime default GETDATE()

)

DROP TABLE Contact;

CREATE TABLE Contact (
    contanct_id INT IDENTITY(1,1) PRIMARY KEY,     -- ✅ AUTO-INCREMENT FIXED
    contact_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    date DATETIME DEFAULT GETDATE()
);



select * from Contact

--create feedback 

CREATE TABLE Feedback (
    Feedback_ID INT PRIMARY KEY IDENTITY(1,1),  -- Primary Key
    Customer_ID INT NOT NULL,                   -- FK to Customer
    Product_ID INT NULL,                        -- Optional FK if feedback is product-specific
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),  -- Rating 1–5
    Comment NVARCHAR(1000),                     -- Feedback comment
    Feedback_Date DATETIME DEFAULT GETDATE(),   -- Date of feedback

-- Foreign Keys
    CONSTRAINT FK_Feedback_Customer FOREIGN KEY (Customer_ID)
        REFERENCES Customers(c_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT FK_Feedback_Product FOREIGN KEY (Product_ID)
        REFERENCES Product(Product_ID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
CREATE TABLE Users (
    User_ID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Password_Hash NVARCHAR(255) NOT NULL,
    Created_At DATETIME DEFAULT GETDATE()
);

select * from Feedback
ALTER TABLE Customers
ADD User_ID INT UNIQUE;


ALTER TABLE Customers
ADD CONSTRAINT FK_Customer_User
FOREIGN KEY (User_ID)
REFERENCES Users(User_ID)
ON DELETE CASCADE;



select * from  Users
select * from Feedback
select * from Product

USE Juice_db;

-- 1. FORCE DROP THE BROKEN CONSTRAINT
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'UQ__Customer__206D91912F95B027' AND type='UQ')
    ALTER TABLE Customers DROP CONSTRAINT UQ__Customer__206D91912F95B027;

-- 2. Fix ALL existing NULLs
UPDATE Customers SET Email = CONCAT('customer', c_id, '@juicycart.com') WHERE Email IS NULL OR Email = '';

-- 3. Verify NO NULLs left
SELECT * FROM Customers WHERE Email IS NULL OR Email = '';

-- 4. Check constraint gone
SELECT name FROM sys.objects WHERE name LIKE '%Customer%' AND type='UQ';



-- Create default customer ID 1
IF NOT EXISTS (SELECT 1 FROM Customers WHERE c_id = 1)
INSERT INTO Customers (c_id, c_name, Email, Address, phone_no) 
VALUES (1, 'Default Customer', 'default@juicycart.com', 'Default Address', 1234567890);


select * from orders



