function updateBranches() {
// Get the selected city
var city = document.getElementById("city").value;

// Get the branch select element
var branchSelect = document.getElementById("branch");

// Remove all existing options
while (branchSelect.firstChild) {
branchSelect.removeChild(branchSelect.firstChild);
}

// Add new options based on the selected city
if (city === "London") {
var branches = ["Downing Street", "Oxford Street", "Regent Street", "Bond Street"];
} else if (city === "Manchester") {
var branches = ["Oxford Street", "Angel Square"];
} else if (city === "Birmingham") {
var branches = ["Cambridge Road"];
} else if (city === "Bristol") {
var branches = ["Regent Street", "Unity Street", "Park Street"];
} else if (city === "Glasgow") {
var branches = ["Buchanan Street", "Sauchiehall Street"];
} else if (city === "Liverpool") {
var branches = ["High Street", "Penny Lane", "Seel Street"];
} else if (city === "Aberdeen") {
var branches = ["Princes Street"];
} else if (city === "Leeds") {
var branches = ["Station Road"];
} else if (city === "Newcastle") {
var branches = ["Grey Street"];
} else if (city === "Nottingham") {
var branches = ["Nottingham Road", "Alfreton Road"];
}

// Add the new options to the select element
for (var i = 0; i < branches.length; i++) {
var option = document.createElement("option");
option.value = branches[i];
option.textContent = branches[i];
branchSelect.appendChild(option);
}
}
