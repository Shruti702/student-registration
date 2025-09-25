// Store student data in an array
let students = [];

// Get DOM elements
const studentCardsContainer = document.getElementById('studentCardsContainer');
const registrationForm = document.getElementById('registrationForm');
const editFormContainer = document.getElementById('editFormContainer');
const recordSection = document.getElementById('srecords');
const editSection = document.getElementById('erecords');

// Function to save student data to localStorage
function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
}

// Function to load student data from localStorage
function loadStudents() {
    const storedStudents = localStorage.getItem('students');
    if (storedStudents !== null) {
    // If data exists, parse and use it.
        students = JSON.parse(storedStudents);
    } else {
        // If no data exists (first-time visit), load initial dummy data.
        students = [
            { id: '12345', name: 'Jane Doe', email: 'jane.doe@example.com', contact: '1234567890' },
            { id: '67890', name: 'John Smith', email: 'john.smith@example.com', contact: '0987654321' },
            { id: '11223', name: 'Emily White', email: 'emily.white@example.com', contact: '5551234567' }
        ];
        saveStudents(); // Save the dummy data to localStorage for future visits
    }
}

// Function to render the student cards from the students array
function renderStudentCards() {
    studentCardsContainer.innerHTML = '';

    const cardThreshold = 4;
    if (students.length > cardThreshold) {
        studentCardsContainer.classList.add('scrollable-cards');
    } else {
        studentCardsContainer.classList.remove('scrollable-cards');
    }

    if (students.length === 0) {
            studentCardsContainer.innerHTML = '<p style="color:white; text-align:center;">No students registered yet.</p>';
            return;
    }
    students.forEach(student => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h3>Details</h3>
        <p><strong>Name: </strong> ${student.name}</p>
        <p><strong>ID: </strong> ${student.id}</p>
        <p><strong>Email: </strong> ${student.email}</p>
        <p><strong>Contact: </strong> ${student.contact}</p>
        <div class="card-buttons">
            <button class="ed_btn" data-id="${student.id}">Edit</button>
            <button class="del_btn" data-id="${student.id}">Delete</button>
        </div>
    `;
        studentCardsContainer.appendChild(card);
    });

    // Re-attach event listeners for dynamic buttons
    document.querySelectorAll('.ed_btn').forEach(button => {
        button.addEventListener('click', (e) => showEditForm(e.target.dataset.id));
    });
            
    document.querySelectorAll('.del_btn').forEach(button => {
        button.addEventListener('click', (e) => deleteStudent(e.target.dataset.id));
    });
}

// Function to validate the registration form inputs
function validateForm() {
    const studentName = document.getElementById('studentName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const emailId = document.getElementById('emailId').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();

    // Regex for validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    const idRegex = /^[0-9]+$/;
    const contactRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if any field is empty
    if (!studentName || !studentId || !emailId || !contactNumber) { // FIX: Corrected typo 'contactNumer' to 'contactNumber'
        alert("Please fill in all fields");
        return false;
    }

    // For valid a name.
    if (!nameRegex.test(studentName)) {
        alert("Student Name must contain only characters.");
        return false;
    }

    // For valid an ID.
    if (!idRegex.test(studentId)) {
        alert("Student ID must contain only numbers.");
        return false;
    }

    // For valid contact number.
    if (!contactRegex.test(contactNumber)) {
        alert("Contact number must be 10 digits.");
        return false;
    }

    // For valid an email id.
    if (!emailRegex.test(emailId)) {
        alert("Please enter a valid email address.");
        return false;
    }

    // Check if the id already exists.
    const idExists = students.some(student => student.id === studentId);
    if (idExists) {
        alert("Error: Student with this ID already exists.");
        return false; // Added return false to stop submission
    }

    return true; // Return true if all validation passes
}

// Handle registration form submission
registrationForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Moved to the top to prevent submission immediately

    // Call validation function before proceeding.
    if (validateForm()) {
        const studentName = document.getElementById('studentName').value.trim();
        const studentId = document.getElementById('studentId').value.trim();
        const emailId = document.getElementById('emailId').value.trim();
        const contactNumber = document.getElementById('contactNumber').value.trim();

        const newStudent = {
            id: studentId,
            name: studentName,
            email: emailId,
            contact: contactNumber
        };

        students.push(newStudent);
        saveStudents(); // Save the new data
        renderStudentCards();
        registrationForm.reset();
        window.location.href = "#srecords"; // Navigate to student records section
    }
});

// Function to display and populate the edit form
function showEditForm(studentId) {
    const studentToEdit = students.find(student => student.id === studentId);
    if (!studentToEdit) {
        console.error("Error: Student not found for editing.");
        return;
    }

    // Show edit section and hide others
    recordSection.style.display = 'none';
    editSection.style.display = 'flex';
            
    editFormContainer.innerHTML = `
        <form id="editForm">
            <h2>Edit Student Details</h2>
                        <input type="hidden" id="editStudentOriginalId" value="${studentToEdit.id}">
            <div class="input-box">
                <input type="text" id="editStudentName" placeholder="Name" value="${studentToEdit.name}" required>
            </div>
            <div class="input-box">
                <input type="text" id="editId" placeholder="ID" value="${studentToEdit.id}" required>
            </div>
            <div class="input-box">
                <input type="email" id="editEmailId" placeholder="Email" value="${studentToEdit.email}" required>
            </div>
            <div class="input-box">
                <input type="tel" id="editContactNumber" placeholder="Contact" value="${studentToEdit.contact}" required>
            </div>
            <button type="submit" class="btn">Save Changes</button>
            <button type="button" class="btn cancel-btn" style="background-color: #6c757d; margin-top: 10px;">Cancel</button>
        </form>
            `;

    // Handle edit form submission
    const editForm = document.getElementById('editForm');
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateStudent();
    });

    // Handle cancel button
    document.querySelector('.cancel-btn').addEventListener('click', () => {
        editSection.style.display = 'none';
        recordSection.style.display = 'flex';
        editFormContainer.innerHTML = '';
    });
}

// Function to update the student in the array
function updateStudent() {
    const originalId = document.getElementById('editStudentOriginalId').value;
    const newId = document.getElementById('editId').value.trim();
    const newName = document.getElementById('editStudentName').value.trim();
    const newEmail = document.getElementById('editEmailId').value.trim();
    const newContact = document.getElementById('editContactNumber').value.trim();

    const nameRegex = /^[a-zA-Z\s]+$/;
    const idRegex = /^[0-9]+$/;
    const contactRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate inputs
    if (!newName || !newId || !newEmail || !newContact) {
        alert("Please fill in all fields.");
        return;
    }
    if (!nameRegex.test(newName)) {
        alert("Student Name must contain only characters.");
        return;
    }
    if (!idRegex.test(newId)) {
        alert("Student ID must contain only numbers.");
        return;
    }
    if (!contactRegex.test(newContact)) {
        alert("Contact number must be 10 digits.");
        return;
    }
    if (!emailRegex.test(newEmail)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Check if the new ID is already taken by ANOTHER student
    if (originalId !== newId) {
        const idExists = students.some(student => student.id === newId);
        if (idExists) {
            alert("Error: A student with this new ID already exists.");
            return;
        }
    }

    // Find the student using their original ID
    const studentIndex = students.findIndex(student => student.id === originalId);
    if (studentIndex > -1) {
        //Update the student record with the NEW values
        students[studentIndex].id = newId;
        students[studentIndex].name = newName;
        students[studentIndex].email = newEmail;
        students[studentIndex].contact = newContact;
    }

    saveStudents(); // Save the updated data
    renderStudentCards();
    
    // Hide edit form and show records
    editSection.style.display = 'none';
    recordSection.style.display = 'flex';
    window.location.href = "#srecords"; // Navigate to student records section
}

// Function to delete a student
function deleteStudent(studentId) {
    const confirmed = confirm('Are you sure you want to delete this record?');
    if (confirmed) {
        students = students.filter(student => student.id !== studentId);
        saveStudents(); // Save the updated data
        renderStudentCards();
    }
}
        
// Initial render: load data from localStorage first
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    renderStudentCards();
});
