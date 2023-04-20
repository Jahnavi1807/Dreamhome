create database new;
CREATE TABLE `branch` (
  `branch_number` int NOT NULL,
  `branch_address` varchar(255) NOT NULL,
  `telephone_number` varchar(20) NOT NULL,
  `manager_id` int DEFAULT NULL,
  `city_number` int DEFAULT NULL,
  `street_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`branch_number`) 
) ;

CREATE TABLE `city` (
  `city_number` int NOT NULL,
  `city_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`city_number`)
) ;

CREATE TABLE `client` (
  `client_number` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `branch_number` int NOT NULL,
  `type` varchar(255) NOT NULL,
  `max_rent` decimal(10,2) NOT NULL,
  `registered_by` int DEFAULT NULL,
  `date_registered` date NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`client_number`)
) ;

CREATE TABLE `lease` (
  `lease_id` int NOT NULL AUTO_INCREMENT,
  `client_number` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `property_number` int NOT NULL,
  `property_address` varchar(255) NOT NULL,
  `monthly_rent` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `deposit_paid` enum('Y','N') NOT NULL,
  `rent_start` date NOT NULL,
  `rent_finish` date NOT NULL,
  `duration` int NOT NULL,
  PRIMARY KEY (`lease_id`)
);

CREATE TABLE `owner` (
  `owner_number` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `tel_number` varchar(20) DEFAULT NULL,
  `type_of_business` varchar(50) DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`owner_number`)
) ;

CREATE TABLE `property` (
  `property_number` int NOT NULL AUTO_INCREMENT,
  `Type` varchar(255) NOT NULL,
  `Rooms` int NOT NULL,
  `Rent` decimal(10,2) NOT NULL,
  `paddress` varchar(255) DEFAULT NULL,
  `BranchNumber` int DEFAULT NULL,
  `OwnerNumber` int DEFAULT NULL,
  `managed_by_staff` int DEFAULT NULL,
  `ad_count` int DEFAULT NULL,
  `registered_date` date DEFAULT NULL,
  PRIMARY KEY (`property_number`)
);

CREATE TABLE `property_comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `property_number` int NOT NULL,
  `client_number` int NOT NULL,
  `comment_text` text,
  `comment_date` date NOT NULL,
  PRIMARY KEY (`comment_id`)
 
) ;

CREATE TABLE `staff` (
  `staff_number` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `sex` varchar(10) NOT NULL,
  `dob` date NOT NULL,
  `branch_number` int NOT NULL,
  `position` varchar(50) NOT NULL,
  `salary` decimal(10,2) NOT NULL,
  `supervisor_id` int DEFAULT NULL,
  `manager_start_date` date DEFAULT NULL,
  `manager_bonus` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`staff_number`)
);

CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ;