ALTER TABLE branch
ADD FOREIGN KEY (city_number) references city(city_number);

ALTER TABLE branch
ADD FOREIGN KEY  (manager_id) references staff(staff_number);

ALTER TABLE client
ADD FOREIGN KEY (branch_number) references branch(branch_number);

ALTER TABLE client
ADD FOREIGN KEY (registered_by) REFERENCES staff(staff_Number);

ALTER TABLE lease
ADD foreign key (property_number) references property(property_number);

ALTER TABLE lease
ADD FOREIGN KEY(client_number) REFERENCES client(client_number);

ALTER TABLE property
ADD FOREIGN KEY (ownerNumber) references owner(owner_number);

ALTER TABLE property
ADD FOREIGN KEY (managed_by_staff) references owner(owner_number);

ALTER TABLE property
ADD FOREIGN KEY(branchnumber) references branch(branch_number);

ALTER TABLE property_comments
ADD FOREIGN KEY (property_number) REFERENCES property(property_number);

ALTER TABLE property_comments
ADD FOREIGN KEY (client_number) REFERENCES client(client_Number);

ALTER TABLE staff
ADD FOREIGN KEY (branch_number) references branch(branch_number);

