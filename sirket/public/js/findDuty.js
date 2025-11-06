
document.addEventListener('DOMContentLoaded', function() {
    findAndDisplayUserDuty();
});

function findAndDisplayUserDuty() {
    const csrfToken = getCsrfToken();
    if (!csrfToken) {
        displayUserInfo('Təyin olunmayıb', '');
        return;
    }
    
    fetch('/user/duty', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        let dutyName = 'Təyin olunmayıb';
        let fullName = '';
        
        if (data.success) {
            if (data.dutyName) {
                dutyName = data.dutyName;
            }
            
            if (data.name || data.surname) {
                const firstName = data.name || '';
                const lastName = data.surname || '';
                fullName = `${firstName} ${lastName}`.trim();
            }
        }
        
        displayUserInfo(dutyName, fullName);
    })
    .catch(error => {
        displayUserInfo('Təyin olunmayıb', '');
    });
}

function getCsrfToken() {
    let token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    if (!token) {
        const cookieValue = document.cookie.split('; ').find(row => row.startsWith('_csrf='));
        if (cookieValue) {
            token = cookieValue.split('=')[1];
        }
    }
    
    return token;
}

function displayUserInfo(dutyName, fullName) {
    const dutyElement = document.getElementById('headerDutyNamePlace');
    if (dutyElement) {
        dutyElement.textContent = dutyName || 'Təyin olunmayıb';
    }
    
    if (fullName) {
        const nameElement = document.getElementById('headerMyNamePlace');
        if (nameElement) {
            nameElement.textContent = fullName;
        }
    }
}
