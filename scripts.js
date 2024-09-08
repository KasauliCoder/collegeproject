import { states } from './cityData.js';

document.addEventListener('DOMContentLoaded', () => {
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    const form = document.getElementById('admissionForm');
    const cardContainer = document.getElementById('cardContainer');
    const fetchRollNumberInput = document.getElementById('fetchRollNumber');
    const fetchButton = document.getElementById('fetchButton');

    // Populate states
    Object.keys(states).forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });

    // Handle state selection and update cities
    stateSelect.addEventListener('change', () => {
        const selectedState = stateSelect.value;
        const cities = states[selectedState] || [];

        // Clear existing cities
        citySelect.innerHTML = '<option value="">Select City</option>';

        // Populate cities based on selected state
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    });

    // Handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const formData = new FormData(form);
    
        try {
            const response = await fetch('http://localhost:5000/students', {
                method: 'POST',
                body: formData
            });
    
            const result = await response.json();
    
            if (response.ok) {
                const studentId = result.studentId;
    
                if (!studentId) {
                    throw new Error('No studentId returned from server.');
                }
    
                // Fetch student details separately using studentId
                const studentResponse = await fetch(`http://localhost:5000/students/${studentId}`);
                const studentData = await studentResponse.json();
    
                if (studentResponse.ok) {
                    displayCard(studentData);
                    form.reset();
                } else {
                    alert(studentData.message);
                }
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the form.');
        }
    });
    
    

    // Handle fetch button click
    fetchButton.addEventListener('click', async () => {
        const rollNumber = fetchRollNumberInput.value;
    
        if (!rollNumber) {
            alert('Please enter a roll number.');
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5000/students/roll/${rollNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            const result = await response.json();
            if (response.ok) {
                displayCard(result);
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('An error occurred while fetching student details.');
        }
    });
    
    // Function to display the student ID card
    function displayCard(data) {
        console.log(data, "hai kuch");
        if (!data) {
            console.error('No data received');
            return;
        }

        const card = document.createElement('div');
        card.classList.add('card');
        console.log('Displaying Card Data:', data); // Log the data

        // Display image if available
        const imageUrl = data.profileImage ? `http://localhost:5000${data.profileImage}` : '';


        // const imageUrl = data.profileImage ? `http://localhost:5000/${data.profileImage}` : '';

        card.innerHTML = `
           <div class="id-card">
   
    <div class="photo-section">
        ${imageUrl ? `<img class="profile-photo" src="${imageUrl}" alt="Profile Image" />` : '<div class="empty-photo"></div>'}
    </div>
    <div class="info-section">
        <h2 class="student-name">${data.name || 'N/A'}</h2>
        <p><strong>Address:</strong> ${data.address || 'N/A'}</p>
        <p><strong>State:</strong> ${data.state || 'N/A'}</p>
        <p><strong>City:</strong> ${data.city || 'N/A'}</p>
        <p><strong>Gender:</strong> ${data.gender || 'N/A'}</p>
        <p><strong>Age:</strong> ${data.age || 'N/A'}</p>
        <p><strong>Course Class Year:</strong> ${data.course || 'N/A'}</p>
        <p><strong>Course Name:</strong> ${data.courseName || 'N/A'}</p>
        <p><strong>College:</strong> ${data.college || 'N/A'}</p>
        <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
        <p><strong>Roll Number:</strong> ${data.rollNumber || 'N/A'}</p>
    </div>
   
</div>

        `;

        cardContainer.innerHTML = ''; 
        cardContainer.appendChild(card);
    }
});
