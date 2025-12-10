document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings from localStorage or defaults
    const settings = JSON.parse(localStorage.getItem('jungleSettings')) || {
        theme: 'green',
        brightness: 70,
        fontSize: 16,
        volume: 80,
        jungleSounds: true,
        animalSounds: true,
        soundIntensity: 5,
        backgroundBlur: 0,
        parallax: false,
        animationSpeed: 1,
        dataCollection: false,
        notifications: true,
        autoSave: true
    };
    
    // DOM Elements
    const themeButtons = document.querySelectorAll('.theme-btn');
    const brightnessSlider = document.getElementById('brightness');
    const brightnessValue = document.getElementById('brightness-value');
    const fontSizeSlider = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    const volumeSlider = document.getElementById('master-volume');
    const volumeValue = document.getElementById('volume-value');
    const jungleSoundsToggle = document.getElementById('jungle-sounds');
    const animalSoundsToggle = document.getElementById('animal-sounds');
    const soundIntensitySlider = document.getElementById('sound-intensity');
    const intensityValue = document.getElementById('intensity-value');
    const backgroundBlurSlider = document.getElementById('background-blur');
    const blurValue = document.getElementById('blur-value');
    const parallaxToggle = document.getElementById('parallax-effect');
    const animationSpeedSlider = document.getElementById('animation-speed');
    const speedValue = document.getElementById('speed-value');
    const dataCollectionToggle = document.getElementById('data-collection');
    const notificationsToggle = document.getElementById('notifications');
    const autoSaveToggle = document.getElementById('auto-save');
    
    // Buttons
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const exportBtn = document.getElementById('export-btn');
    
    // Preview elements
    const soundStatus = document.getElementById('sound-status');
    const currentTheme = document.getElementById('current-theme');
    const currentBrightness = document.getElementById('current-brightness');
    const currentVolume = document.getElementById('current-volume');
    const currentFont = document.getElementById('current-font');
    
    // Toast notification
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    // Load saved settings
    loadSettings();
    
    // Theme selection
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
            updateSettings('theme', theme);
            updatePreview();
        });
    });
    
    // Brightness slider
    brightnessSlider.addEventListener('input', function() {
        brightnessValue.textContent = `${this.value}%`;
        updateBrightness(this.value);
        updateSettings('brightness', parseInt(this.value));
        updatePreview();
    });
    
    // Font size slider
    fontSizeSlider.addEventListener('input', function() {
        fontSizeValue.textContent = `${this.value}px`;
        updateFontSize(this.value);
        updateSettings('fontSize', parseInt(this.value));
        updatePreview();
    });
    
    // Volume slider
    volumeSlider.addEventListener('input', function() {
        volumeValue.textContent = `${this.value}%`;
        updateSettings('volume', parseInt(this.value));
        updatePreview();
    });
    
    // Jungle sounds toggle
    jungleSoundsToggle.addEventListener('change', function() {
        updateSettings('jungleSounds', this.checked);
        updateSoundStatus();
    });
    
    // Animal sounds toggle
    animalSoundsToggle.addEventListener('change', function() {
        updateSettings('animalSounds', this.checked);
        updateSoundStatus();
    });
    
    // Sound intensity slider
    soundIntensitySlider.addEventListener('input', function() {
        intensityValue.textContent = this.value;
        updateSettings('soundIntensity', parseInt(this.value));
    });
    
    // Background blur slider
    backgroundBlurSlider.addEventListener('input', function() {
        blurValue.textContent = `${this.value}px`;
        updateBackgroundBlur(this.value);
        updateSettings('backgroundBlur', parseInt(this.value));
    });
    
    // Parallax toggle
    parallaxToggle.addEventListener('change', function() {
        updateSettings('parallax', this.checked);
        toggleParallaxEffect(this.checked);
    });
    
    // Animation speed slider
    animationSpeedSlider.addEventListener('input', function() {
        speedValue.textContent = `${this.value}x`;
        updateSettings('animationSpeed', parseFloat(this.value));
    });
    
    // Data collection toggle
    dataCollectionToggle.addEventListener('change', function() {
        updateSettings('dataCollection', this.checked);
    });
    
    // Notifications toggle
    notificationsToggle.addEventListener('change', function() {
        updateSettings('notifications', this.checked);
    });
    
    // Auto-save toggle
    autoSaveToggle.addEventListener('change', function() {
        updateSettings('autoSave', this.checked);
    });
    
    // Save button
    saveBtn.addEventListener('click', function() {
        saveSettings();
        showToast('Settings saved successfully!');
    });
    
    // Reset button
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            resetSettings();
            showToast('Settings reset to default!');
        }
    });
    
    // Export button
    exportBtn.addEventListener('click', function() {
        exportSettings();
    });
    
    // Load settings into UI
    function loadSettings() {
        // Theme
        document.querySelector(`.theme-btn[data-theme="${settings.theme}"]`).classList.add('active');
        setTheme(settings.theme);
        
        // Brightness
        brightnessSlider.value = settings.brightness;
        brightnessValue.textContent = `${settings.brightness}%`;
        updateBrightness(settings.brightness);
        
        // Font size
        fontSizeSlider.value = settings.fontSize;
        fontSizeValue.textContent = `${settings.fontSize}px`;
        updateFontSize(settings.fontSize);
        
        // Volume
        volumeSlider.value = settings.volume;
        volumeValue.textContent = `${settings.volume}%`;
        
        // Toggles
        jungleSoundsToggle.checked = settings.jungleSounds;
        animalSoundsToggle.checked = settings.animalSounds;
        parallaxToggle.checked = settings.parallax;
        dataCollectionToggle.checked = settings.dataCollection;
        notificationsToggle.checked = settings.notifications;
        autoSaveToggle.checked = settings.autoSave;
        
        // Sliders
        soundIntensitySlider.value = settings.soundIntensity;
        intensityValue.textContent = settings.soundIntensity;
        backgroundBlurSlider.value = settings.backgroundBlur;
        blurValue.textContent = `${settings.backgroundBlur}px`;
        animationSpeedSlider.value = settings.animationSpeed;
        speedValue.textContent = `${settings.animationSpeed}x`;
        
        // Update background blur
        updateBackgroundBlur(settings.backgroundBlur);
        
        // Update parallax
        toggleParallaxEffect(settings.parallax);
        
        // Update preview
        updatePreview();
        updateSoundStatus();
    }
    
    // Update a specific setting
    function updateSettings(key, value) {
        settings[key] = value;
        
        // Auto-save if enabled
        if (settings.autoSave) {
            localStorage.setItem('jungleSettings', JSON.stringify(settings));
        }
    }
    
    // Save all settings
    function saveSettings() {
        localStorage.setItem('jungleSettings', JSON.stringify(settings));
    }
    
    // Reset settings to default
    function resetSettings() {
        const defaultSettings = {
            theme: 'green',
            brightness: 70,
            fontSize: 16,
            volume: 80,
            jungleSounds: true,
            animalSounds: true,
            soundIntensity: 5,
            backgroundBlur: 0,
            parallax: false,
            animationSpeed: 1,
            dataCollection: false,
            notifications: true,
            autoSave: true
        };
        
        Object.assign(settings, defaultSettings);
        loadSettings();
        saveSettings();
    }
    
    // Export settings as JSON file
    function exportSettings() {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const downloadLink = document.createElement('a');
        downloadLink.download = 'jungle-settings.json';
        downloadLink.href = window.URL.createObjectURL(dataBlob);
        downloadLink.click();
        
        showToast('Settings exported successfully!');
    }
    
    // Set theme
    function setTheme(theme) {
        // Remove active class from all theme buttons
        themeButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to selected theme
        document.querySelector(`.theme-btn[data-theme="${theme}"]`).classList.add('active');
        
        // Update CSS variables based on theme
        const root = document.documentElement;
        let primaryColor, secondaryColor;
        
        switch(theme) {
            case 'green':
                primaryColor = '#2d5a27';
                secondaryColor = '#4caf50';
                break;
            case 'blue':
                primaryColor = '#1e4d7a';
                secondaryColor = '#2196f3';
                break;
            case 'brown':
                primaryColor = '#5d4037';
                secondaryColor = '#8d6e63';
                break;
            case 'dark':
                primaryColor = '#1a1a1a';
                secondaryColor = '#424242';
                break;
        }
        
        root.style.setProperty('--primary-color', primaryColor);
        root.style.setProperty('--secondary-color', secondaryColor);
        
        // Update preview
        currentTheme.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    }
    
    // Update brightness
    function updateBrightness(value) {
        const brightness = value / 100;
        document.body.style.filter = `brightness(${brightness})`;
        currentBrightness.textContent = `${value}%`;
    }
    
    // Update font size
    function updateFontSize(size) {
        document.documentElement.style.fontSize = `${size}px`;
        currentFont.textContent = `${size}px`;
    }
    
    // Update background blur
    function updateBackgroundBlur(value) {
        document.body.style.backdropFilter = `blur(${value}px)`;
    }
    
    // Toggle parallax effect
    function toggleParallaxEffect(enabled) {
        const bg = document.querySelector('body::before');
        
        if (enabled) {
            document.body.style.backgroundAttachment = 'scroll';
        } else {
            document.body.style.backgroundAttachment = 'fixed';
        }
    }
    
    // Update sound status in preview
    function updateSoundStatus() {
        const jungleEnabled = jungleSoundsToggle.checked;
        const animalEnabled = animalSoundsToggle.checked;
        
        if (jungleEnabled && animalEnabled) {
            soundStatus.textContent = 'fully enabled';
        } else if (jungleEnabled || animalEnabled) {
            soundStatus.textContent = 'partially enabled';
        } else {
            soundStatus.textContent = 'disabled';
        }
    }
    
    // Update preview panel
    function updatePreview() {
        currentBrightness.textContent = `${brightnessSlider.value}%`;
        currentVolume.textContent = `${volumeSlider.value}%`;
        currentFont.textContent = `${fontSizeSlider.value}px`;
    }
    
    // Show toast notification
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Footer link handlers
    document.getElementById('privacy-link').addEventListener('click', function(e) {
        e.preventDefault();
        showToast('Privacy policy would open in a real application.');
    });
    
    document.getElementById('help-link').addEventListener('click', function(e) {
        e.preventDefault();
        showToast('Help documentation would open in a real application.');
    });
    
    // Initialize parallax effect on mouse move
    document.addEventListener('mousemove', function(e) {
        if (settings.parallax) {
            const x = (e.clientX / window.innerWidth) * 20;
            const y = (e.clientY / window.innerHeight) * 20;
            document.body.style.backgroundPosition = `${x}px ${y}px`;
        }
    });
    
    // Add some visual feedback for interactions
    const allSliders = document.querySelectorAll('input[type="range"]');
    allSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            this.style.setProperty('--thumb-color', '#4caf50');
        });
    });
});