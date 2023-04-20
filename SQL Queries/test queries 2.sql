--  List details of staff supervised by a named Supervisor at the branch
-- already done in the first series

-- (b) List details of all Assistants alphabetically by name at the branch.
SELECT *
FROM branch b, staff s 
where b.branch_number=s.branch_number and s.position='Assistant'
order by b.branch_number,full_name;

-- (c) List the details of property (including the rental deposit) available for rent at the branch, along with the owner’s details.
SELECT *
FROM property p , owner o 
where p.ownernumber=o.owner_number;

-- (c) List the details of property (including the rental deposit) available for rent at the branch, along with the owner’s details.
SELECT p.*
FROM property p, branch b
WHERE p.branchNumber=b.branch_Number
order by branch_number;

-- (d) List the details of properties managed by a named member of staff at the branch.
SELECT  p.*
FROM property p, staff s
WHERE  p.managed_by_staff=s.staff_number and s.full_name='Clara Bennet';

-- (e) List the clients registering at the branch and the names of the members of staff who registered the clients
SELECT s.branch_number,c.full_name,client_number,s.full_name, staff_number
FROM client c, staff s
WHERE c.registered_by=s.staff_number 
order by s.branch_Number;

-- (f) Identify properties located in Glasgow with rents no higher than £450.
SELECT p.*
FROM property p,branch b,city c
WHERE p.branchnumber=b.branch_number and b.city_number=c.city_number and city_name='Glasgow' and p.rent<450;

-- (g) Identify the name and telephone number of an owner of a given property.
SELECT name,o.tel_number,p.*
FROM property p, owner o
where p.ownernumber=o.owner_number ;

-- (h) List the details of comments made by clients viewing a given property
SELECT *
FROM property_comments
WHERE comment_text is not null;

-- (i) Display the names and phone numbers of clients who have viewed a given property but not supplied comments.
SELECT full_name,phone_number
FROM property_comments p, client c 
where p.client_number=c.client_number and comment_text is null;


-- (j) Display the details of a lease between a named client and a given property.
SELECT *
FROM lease
where full_name='Jerry Seinfeld';

-- (k) Identify the leases due to expire next month at the branch.
 -- done before
 
 -- (l) List the details of properties that have not been rented out for more than three months
SELECT * -- Select all columns from the property table
FROM property p -- Alias the property table as p
WHERE p.registered_date <= DATE_SUB(CURDATE(), INTERVAL 3 MONTH) -- Filter properties registered within the last 3 months
AND NOT EXISTS ( -- Exclude properties that have active leases
  SELECT *
  FROM lease l
  WHERE l.property_number = p.property_number
);

-- (m) Produce a list of clients whose preferences match a particular property
SELECT *
FROM client c, property p
where c.Branch_Number=p.branchnumber
and c.type=p.type
and c.max_rent>=p.Rent;