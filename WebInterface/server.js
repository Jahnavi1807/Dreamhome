import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const port = 3000;


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Alohomora@123',
  database: 'dreamhome'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as id ' + connection.threadId);
});




app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'admin.html'));
});

app.get('/property', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'property.html'));
});

app.get('/clientRegistration', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'clientRegistration.html'));
});

app.post('/insert', (req, res) => {
  const property = {
   property_number:req.body.pnum,
    type: req.body.ptype,
    rooms: req.body.room,
    rent: req.body.rent,
    paddress: req.body.paddress,
    ad_count: req.body.ad_count,
    registered_date: new Date(),
  };

  const branchName = req.body.branch;
  const query = `SELECT branch_number FROM branch WHERE street_name = '${branchName}'`;
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error querying branch: ' + error.stack);
      res.status(500).send('Error querying branch');
      return;
    }
    if (results.length === 0) {
      res.status(400).send('Invalid branch name');
      return;
    }
    const branchNumber = results[0].branch_number;
    property.branchnumber = branchNumber;

    const owner = {
      name: req.body.pname,
      address: req.body.oaddress,
      tel_number: req.body.telno,
      type_of_business: req.body.btype || null,
      contact_name: req.body.bname || null,

    };

    connection.beginTransaction(function (err) {
      if (err) { throw err; }
      connection.query('INSERT INTO owner SET ?', owner, function (error, results, fields) {
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }
        const owner_number = results.insertId;
        property.ownernumber = owner_number;
        connection.query('INSERT INTO property SET ?', property, (error, results, fields) => {
          if (error) {
            return connection.rollback(function () {
              throw error;
            });
          }
          const property_number = results.insertId;
          owner.property_number = property_number;
          const staffQuery = `SELECT staff_number FROM staff WHERE position = 'Assistant' AND branch_number = ${branchNumber} ORDER BY RAND() LIMIT 1`;
          connection.query(staffQuery, (error, results, fields) => {
            if (error) {
              return connection.rollback(function () {
                throw error;
              });
            }
            const staffNumber = results[0].staff_number;
            connection.query('UPDATE property SET managed_by_staff = ? WHERE property_number = ?', [staffNumber, property_number], (error, results, fields) => {
              if (error) {
                return connection.rollback(function () {
                  throw error;
                });
              }

                connection.commit(function (err) {
                  if (err) {
                    return connection.rollback(function () {
                      throw err;
                    });
                  }
                  res.send('Registered successfully!');
                });
              });
            });
          });
        });

    });
  });
});

app.post('/registerClient', (req, res) => {
  const client = {
    full_name: req.body.cname,
    phone_number: req.body.pno,
    max_rent: req.body.rent,
    type: req.body.ctype,
    date_registered: new Date(),
    registered_by: null, // to be updated later
    branch_number: null // to be updated later
  };

  const branchName = req.body.branch;
  const branchQuery = `SELECT branch_number FROM branch WHERE street_name = '${branchName}'`;
  connection.query(branchQuery, (error, results, fields) => {
    if (error) {
      console.error('Error querying branch: ' + error.stack);
      res.status(500).send('Error querying branch');
      return;
    }
    if (results.length === 0) {
      res.status(400).send('Invalid branch name');
      return;
    }
    const branchNumber = results[0].branch_number;

    client.branch_number = branchNumber; // add branch_number to client object

    const staffQuery = `SELECT staff_number FROM staff WHERE position = 'Assistant' AND branch_number = ${branchNumber} ORDER BY RAND() LIMIT 1`;
    connection.query(staffQuery, (error, results, fields) => {
      if (error) {
        console.error('Error querying staff: ' + error.stack);
        res.status(500).send('Error querying staff');
        return;
      }
      if (results.length === 0) {
        res.status(400).send('No available staff found');
        return;
      }
      const staffNumber = results[0].staff_number;
      client.registered_by = staffNumber;

      connection.query('INSERT INTO client SET ?', client, (error, results, fields) => {
        if (error) {
          console.error('Error inserting client: ' + error.stack);
          res.status(500).send('Error inserting client');
          return;
        }
        res.send('Client registered successfully!');
      });
    });
  });
});

app.get('/viewlistings', (req, res) => {
  const email = req.query.email;

  // Query to find the client ID based on email
  const getClientIdQuery = `SELECT client_number FROM client WHERE email = '${email}'`;

  connection.query(getClientIdQuery, (error, results, fields) => {
    if (error) throw error;

    if (results.length === 0) {
      // Handle case where email does not match any clients
      res.send('Email not found');
      return;
    }

    const clientId = results[0].client_number;

    // Query to retrieve list of properties matching client requirements
    const getPropertiesQuery = `
      SELECT *
      FROM property p, client c
      WHERE p.branchnumber = c.branch_number
        AND c.type = p.type
        AND p.rent < c.max_rent
        AND client_number = ${clientId}
        AND property_number NOT IN (SELECT property_number FROM lease);
    `;

    connection.query(getPropertiesQuery, (error, results, fields) => {
      if (error) throw error;

      // Create an HTML table to display the list of properties
      let tableHtml = '<table><tr><th>Property Number</th><th>Address</th><th>Type</th><th>Bedrooms</th><th>Price</th><th>Comments</th><th>Rent</th></tr>';

      for (let i = 0; i < results.length; i++) {
        const property = results[i];

        tableHtml += `
          <tr>
            <td>${property.property_number}</td>
            <td>${property.paddress}</td>
            <td>${property.Type}</td>
            <td>${property.Rooms}</td>
            <td>${property.Rent}</td>
            <td>
              <form action="/viewlistings" method="post">
                <input type="hidden" name="property_number" value="${property.property_number}">
                <input type="hidden" name="client_number" value="${clientId}">
                <textarea name="comment" rows="3" cols="20"></textarea>
                <br>
                <input type="submit" value="Add comment">
              </form>
              ${property.comments ? property.comments : ''}
            </td>
            <td>
              <form action="/rent" method="post">
                <input type="hidden" name="property_number" value="${property.property_number}">
                <input type="submit" value="Rent">
              </form>
            </td>
          </tr>`;
      }

      tableHtml += '</table>';

      // Link to the CSS file
      tableHtml += '<link rel="stylesheet" type="text/css" href="/table.css">';

      res.send(tableHtml);
    });
  });
})

app.post('/viewlistings', (req, res) => {
  const propertyNumber = req.body.property_number;
  const clientNumber = req.body.client_number;
  const commentText = req.body.comment;
  const commentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Query to insert new comment into property_comments table
  const addCommentQuery = `
    INSERT INTO property_comments (property_number, client_number, comment_text, comment_date)
    VALUES (${propertyNumber}, ${clientNumber}, '${commentText}', '${commentDate}');
  `;

  connection.query(addCommentQuery, (error, results, fields) => {
    if (error) throw error;

    console.log('Comment added successfully');

    // Query to get the email based on client_number
 const getEmailQuery = `SELECT email FROM client WHERE client_number = ${clientNumber}`;

 connection.query(getEmailQuery, (error, results, fields) => {
   if (error) throw error;

   const email = results[0].email;

   // Redirect back to the viewlistings page with the email query parameter
   res.redirect(`/viewlistings?email=${email}`);

  });
});
});

app.post('/rent', (req, res) => {
  const { property_number } = req.body;

  // Render a form for the user to enter the payment method and lease duration
  const formHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rent Property</title>
        <link rel="stylesheet" type="text/css" href="/rent.css">
      </head>
      <body>
        <form action="/confirm-rent" method="post">
          <input type="hidden" name="property_number" value="${property_number}">
          <label for="payment_method">Payment Method:</label>
          <select name="payment_method" id="payment_method">
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Net Banking">Net Banking</option>
              <option value="UPI">UPI</option>
          </select>
          <br>
          <label for="lease_duration">Lease Duration (in months):</label>
          <input type="number" name="lease_duration" id="lease_duration" min="1" max="24" required>
          <br>
          <input type="submit" value="Confirm">
        </form>
      </body>
    </html>
  `;

  // Send the HTML file as the response to the client
  res.send(formHtml);
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Perform authentication logic here
  const getUserQuery = `SELECT * FROM admin WHERE username = '${email}' AND password = '${password}'`;

  connection.query(getUserQuery, (error, results, fields) => {
    if (error) throw error;

    if (results.length === 0) {
      // If the user is not authenticated, redirect to login page
      res.redirect('/login');
      return;
    }

    // If the user is authenticated, redirect to the admin page
    res.redirect('/admin');
  });
});

app.post('/register-staff', function(req, res) {
  const full_name = req.body.full_name;
  const sex = req.body.sex;
  const dobParts = req.body.date_of_birth;
//  let dob = null;
 //if (dobParts.length === 3) {
//   dob = new Date(`${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`);
 //}
//console.log(dob);
//console.log(req.body.date_of_birth);

  const branch_number = req.body.branch_number;
  const position = req.body.position;
  const salary = req.body.salary;
  const supervisor_id = req.body.supervisor_id || null;
  const manager_start_date = req.body.position === 'Manager' ? (req.body.manager_start_date || null) : null;
  const manager_bonus = req.body.position === 'Manager' ? (req.body.manager_bonus || null) : null;


  const sql = `INSERT INTO staff (full_name, sex, dob, branch_number, position, salary, supervisor_id, manager_start_date, manager_bonus)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [full_name, sex, dobParts, branch_number, position, salary, supervisor_id, manager_start_date, manager_bonus];

  connection.query(sql, values, function(err, result) {
    if (err) {
      if (err.code === 'ER_TRUNCATED_WRONG_VALUE' && err.sqlMessage.includes("'manager_start_date'")) {
        console.error("Invalid manager start date");
      } else {
        throw err;
      }
    } else {
      console.log("1 record inserted");
      res.redirect('/');
    }
  });
});

app.post('/property-report', function(req, res) {
  const propertyNumber = req.body.pnum;
  const propertySql = `SELECT paddress, type, rent FROM property WHERE property_number = ?`;
  const commentSql = `SELECT pc.client_number, c.full_name, pc.comment_date, pc.comment_text
                      FROM property_comments pc
                      INNER JOIN client c ON pc.client_number = c.client_number
                      WHERE pc.property_number = ?`;

  connection.query(propertySql, [propertyNumber], function(propertyErr, propertyResult) {
    if (propertyErr) throw propertyErr;

    if (propertyResult.length == 0) {
      // Property number not found
      res.send(`Property number ${propertyNumber} not found`);
      return;
    }

    // Property found, get details
    const propertyAddress = propertyResult[0].paddress;
    const propertyType = propertyResult[0].type;
    const rent = propertyResult[0].rent;

    connection.query(commentSql, [propertyNumber], function(commentErr, commentResult) {
      if (commentErr) throw commentErr;

      const tableRows = commentResult.map(comment => {
        return `<tr>
                  <td>${comment.client_number}</td>
                  <td>${comment.full_name}</td>
                  <td>${comment.comment_date}</td>
                  <td>${comment.comment_text}</td>
                </tr>`;
      }).join('');

      const table = `<table>
                       <thead>
                         <tr>
                           <th>Client no</th>
                           <th>Name</th>
                           <th>Date</th>
                           <th>Comments</th>
                         </tr>
                       </thead>
                       <tbody>
                         ${tableRows}
                       </tbody>
                     </table>`;

      const report = `<html>
                    <head>
                    <title>Property Report</title>
                    <link rel="stylesheet" href="/propertyrep.css">
                    </head>
                    <body>
                    <h2>Property Report</h2>
                      <p>Property Number: ${propertyNumber}</p>
                      <p>Property Address: ${propertyAddress}</p>
                      <p>Type: ${propertyType}</p>
                      <p>Rent: ${rent}</p>
                      ${table}
                      </body>
                </html>`;

      res.send(report);
    });
  });
});

app.get('/staff-listing', (req, res) => {
  const { city, branch } = req.query;

  // Retrieve the branch details from the database based on the selected city and branch
  const getBranchQuery = `SELECT b.branch_number, b.branch_address, b.telephone_number FROM branch b, city c WHERE b.city_number = c.city_number AND b.street_name = '${branch}' AND c.city_name = '${city}'`;

  connection.query(getBranchQuery, (error, branchResults, fields) => {
    if (error) throw error;

    const branchNumber = branchResults[0].branch_number;
    const branchAddress = branchResults[0].branch_address;
    const telephoneNumber = branchResults[0].telephone_number;

    // Retrieve the staff details from the database based on the branch number
    const getStaffQuery = `SELECT staff_number, full_name, position FROM staff WHERE branch_number = ${branchNumber}`;

    connection.query(getStaffQuery, (error, staffResults, fields) => {
      if (error) throw error;

      // Construct the HTML string
      let html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Staff Listing</title>
            <link rel="stylesheet" type="text/css" href="/staffl.css">
          </head>
          <body>
            <h1>Staff Listing</h1>
            <p>Branch Number: ${branchNumber}</p>
            <p>Branch Address: ${branchAddress}</p>
            <p>Telephone Number: ${telephoneNumber}</p>
            <table>
              <thead>
                <tr>
                  <th>Staff Number</th>
                  <th>Full Name</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
      `;

      // Loop through the staff results and add them to the HTML string
      staffResults.forEach(staff => {
        html += `
          <tr>
            <td>${staff.staff_number}</td>
            <td>${staff.full_name}</td>
            <td>${staff.position}</td>
          </tr>
        `;
      });

      // Close the HTML string
      html += `
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Send the HTML string as the response
      res.send(html);
    });
  });
});




app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
