document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
    setupTheme();
    setupProgressRing();
});

function updateGreeting() {
    const greetingEl = document.getElementById('welcome-greeting');
    if (!greetingEl) return;

    const hours = new Date().getHours();
    let greeting = 'Good Morning Neighbour!';

    if (hours >= 12 && hours < 17) {
        greeting = 'Good Afternoon Neighbour!';
    } else if (hours >= 17 || hours < 5) {
        greeting = 'Good Evening Neighbour!';
    }

    greetingEl.textContent = greeting;
}

function setupTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-sun');
    const moonIcon = document.getElementById('theme-moon');
    const htmlEl = document.documentElement;

    if (!themeToggle || !sunIcon || !moonIcon) return;

    function setTheme(theme) {
        htmlEl.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            sunIcon.classList.remove('d-none');
            moonIcon.classList.add('d-none');
        } else {
            sunIcon.classList.add('d-none');
            moonIcon.classList.remove('d-none');
        }
    }

    // Check localStorage or fallback to system dark preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark ? 'dark' : 'light');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-bs-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

function setupProgressRing() {
    const progressCircle = document.querySelector('.progress-ring-circle');
    const progressText = document.getElementById('progress-text');
    const progressSlider = document.getElementById('progress-slider');
    const textarea = document.getElementById('email-content');
    const sendBtn = document.getElementById('send-btn');
    const spamStatus = document.getElementById('spam-status');

    if (!progressCircle || !progressText) return;

    // Radius & Circumference calculation
    const radius = progressCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    // Set initial dash attributes
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;

    // Helper to calculate progress ring active color (Blue -> Yellow -> Red)
    function getProgressColor(percent) {
        let r, g, b;
        if (percent < 50) {
            // Interpolate between Blue (37, 99, 235) and Yellow (234, 179, 8)
            let ratio = percent / 50;
            r = Math.round(37 + (234 - 37) * ratio);
            g = Math.round(99 + (179 - 99) * ratio);
            b = Math.round(235 + (8 - 235) * ratio);
        } else {
            // Interpolate between Yellow (234, 179, 8) and Red (239, 68, 68)
            let ratio = (percent - 50) / 50;
            r = Math.round(234 + (239 - 234) * ratio);
            g = Math.round(179 + (68 - 179) * ratio);
            b = Math.round(8 + (68 - 8) * ratio);
        }
        return `rgb(${r}, ${g}, ${b})`;
    }

    function setProgress(percent) {
        percent = Math.min(100, Math.max(0, percent));
        const offset = circumference - (percent / 100) * circumference;

        progressCircle.style.strokeDashoffset = offset;

        // Update color dynamically based on percentage
        const color = getProgressColor(percent);
        progressCircle.setAttribute('stroke', color);

        // Update text display
        progressText.textContent = `${Math.round(percent)}%`;

        // Update spam status text
        if (spamStatus) {
            spamStatus.style.color = color;
            if (percent <= 35) {
                spamStatus.textContent = 'Safe Email';
            } else if (percent <= 75) {
                spamStatus.textContent = 'Suspicious Email';
            } else {
                spamStatus.textContent = 'Spam Email';
            }
        }
    }

    // 1. Monitor slider changes
    if (progressSlider) {
        progressSlider.addEventListener('input', (e) => {
            setProgress(e.target.value);
        });
        // Set initial progress from slider position
        setProgress(progressSlider.value);
    }

    // 2. Dynamic progress feedback based on typing length in textarea
    if (textarea && progressSlider) {
        textarea.addEventListener('input', () => {
            const textLength = textarea.value.length;
            // Target length of 300 characters = 100% progress
            const calculatedProgress = Math.min(100, Math.round((textLength / 300) * 100));

            progressSlider.value = calculatedProgress;
            setProgress(calculatedProgress);
        });
    }

    // 3. Send message button mock trigger
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            if (textarea && textarea.value.trim() === '') {
                alert('Please enter some text before sending.');
                return;
            }

            const spamScore = parseInt(progressSlider.value) || 0;
            if (spamScore > 75) {
                alert(`Analysis complete: This email is classified as SPAM (${spamScore}% score). Message blocked.`);
            } else if (spamScore > 35) {
                const proceed = confirm(`Analysis complete: This email is classified as SUSPICIOUS (${spamScore}% score). Send anyway?`);
                if (proceed) {
                    alert('Message sent successfully!');
                    textarea.value = '';
                    progressSlider.value = 0;
                    setProgress(0);
                }
            } else {
                alert('Analysis complete: Email is safe. Message sent successfully!');
                textarea.value = '';
                progressSlider.value = 0;
                setProgress(0);
            }
        });
    }
}
