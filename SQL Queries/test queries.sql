-- (a) List the details of branches in a given city.
SELECT city_name, street_name, branch_number,branch_address,telephone_number,manager_id
FROM branch b ,city c
WHERE b.city_number=c.city_number;

-- (b) Identify the total number of branches in each city.
SELECT count(branch_number) as Number_of_branches, city_name
FROM branch b ,city c 
where b.city_number=c.city_number
Group by(b.city_number);

-- (c) List the name, position, and salary of staff at a given branch, ordered by staff name.
SELECT full_name,position, salary
FROM staff 
WHERE branch_number=1
order by full_name;

-- (d) Identify the total number of staff and the sum of their salaries.
SELECT count(staff_number) as Total_staff, sum(salary) as Total_salary
FROM staff;

-- (e) Identify the total number of staff in each position at branches in Glasgow
SELECT position,count(staff_number) as number
FROM branch b, staff s,city c
WHERE b.branch_number=s.branch_number AND b.city_number=c.city_number AND city_name='Glasgow'
GROUP BY position;

-- (f) List the name of each Manager at each branch, ordered by branch address.

SELECT full_name,s.branch_number
FROM branch b , staff s
WHERE b.manager_id=s.staff_number
order by branch_address;

-- (g) List the names of staff supervised by a named Supervisor.
SELECT full_name
FROM staff 
WHERE supervisor_id is not null;

-- (h) List the property number, address, type, and rent of all properties in Glasgow, ordered by rental amount.

SELECT property_number,paddress,type,rent
FROM branch b, city c , property p
WHERE p.branchnumber=b.branch_number And b.city_number= c. city_number and city_name='Glasgow'
order by rent;

-- (i) List the details of properties for rent managed by a named member of staff
SELECT property_number,rent,full_name
FROM property p, staff s
WHERE p.managed_by_staff= s.staff_number;

-- (j) Identify the total number of properties assigned to each member of staff at a given branch.
	SELECT s.full_name, s.branch_number, COUNT(p.property_number) as total_properties
FROM property p
JOIN staff s ON p.managed_by_staff = s.staff_number
GROUP BY s.full_name, s.branch_number order by branch_number;

-- (k) List the details of properties provided by business owners at a given branch.
SELECT o.*
FROM owner o, property p, branch b
WHERE p.ownernumber=o.owner_number and p.branchnumber=b.branch_number and o.type_of_business is not null;

-- (l) Identify the total number of properties of each type at all branches.
SELECT b.branch_Number, p.type, COUNT(DISTINCT p.property_Number) AS number_of_properties
FROM property p
JOIN branch b ON p.branchNumber = b.branch_number 
GROUP BY b.branch_Number, p.type
ORDER BY b.branch_Number;

-- (m) Identify the details of private property owners that provide more than one property for rent.
SELECT o.*
FROM owner o ,property p
WHERE p.ownerNumber=o.owner_number and type_of_business is NULL 
group by owner_number having count(*)>1;

-- (n) Identify flats with at least three rooms and with a monthly rent no higher than £500 in Aberdeen.
SELECT *
FROM property 
where rooms>=3 and type='Flat' and rent<=500 and paddress like '%Aberdeen%';
-- (o) List the number, name, and telephone number of clients and their property preferences at a given branch.
SELECT c.*
FROM client c, branch b
WHERE c.branch_number=b.branch_number 
order by c.branch_number;

-- (P) Identify the properties that have been advertised more than the average number of times.
SELECT *
FROM property
WHERE ad_count > (SELECT AVG(ad_count) FROM property);

-- (q) List the details of leases due to expire next month at a given branch.
SELECT l.*
FROM lease l, client c, property p
where l.client_number = c.client_number
and l.property_number = p.property_number
 AND MONTH(l.rent_finish) = MONTH(DATE_ADD(CURDATE(), INTERVAL 1 MONTH));
 
 -- (r) List the total number of leases with rental periods that are less than one year at branches in London
SELECT l.*
FROM lease l, property p, branch b, city c
where l.property_number=p.property_number and p.branchNumber=b.branch_number and b.city_number=c.city_number
and c.city_name='London' AND duration<12;

--  (s) List the total possible daily rental for property at each branch, ordered by branch number
SELECT BranchNumber, SUM(rent)/30/COUNT(*) as average_daily_rental  
FROM property p
JOIN branch b ON p.branchNumber = b.branch_number
GROUP BY BranchNumber
ORDER BY BranchNumber;
