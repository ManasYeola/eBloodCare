document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector('form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Validate required fields
        const patientFirstName = document.getElementById('patientFirstName').value.trim();
        const patientLastName = document.getElementById('patientLastName').value.trim();
        const attendeeFirstName = document.getElementById('attendeeFirstName').value.trim();
        const attendeeLastName = document.getElementById('attendeeLastName').value.trim();
        const attendeeMobile = document.getElementById('attendeeMobile').value.trim();
        const bloodGroup = document.getElementById('bloodGroup').value.trim();
        const requestType = document.getElementById('requestType').value.trim();
        const quantity = document.getElementById('quantity').value.trim();
        const requiredDate = document.getElementById('requiredDate').value.trim();
        const address = document.getElementById('address').value.trim();
        const termsCheckbox = document.getElementById('terms');

        if (!patientFirstName || !patientLastName || !attendeeFirstName || !attendeeLastName ||
            !attendeeMobile || !bloodGroup || !requestType || !quantity || !requiredDate ||
            !address || !termsCheckbox.checked) {
            alert('Please fill out all required fields.');
            return;
        }

        // Additional validation
        if (!/^\d{10}$/.test(attendeeMobile)) {
            alert('Attendee mobile number must be 10 digits.');
            return;
        }
        if (isNaN(quantity) || quantity < 1 || quantity > 10) {
            alert('Quantity must be between 1 and 10 litres.');
            return;
        }
        // Optionally, show a message after successful validation
        document.getElementById('form-message').textContent = 'Submitting...';
        // Submit the form
        form.submit();
    });
}); 