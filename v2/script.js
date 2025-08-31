// Terminal-style JavaScript for sshPilot v2

class TerminalInterface {
    constructor() {
        this.currentSection = 'welcome';
        this.typingSpeed = 50;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startTypingEffect();
        this.setupScreenshotModal();
    }

    setupEventListeners() {
        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                if (section === 'exit') {
                    this.showExitMessage();
                } else {
                    this.navigateToSection(section);
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Screenshot modal
        document.querySelectorAll('.screenshot-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const screenshot = e.currentTarget.dataset.screenshot;
                this.openScreenshotModal(screenshot);
            });
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeScreenshotModal();
        });

        // Close modal on background click
        document.getElementById('screenshot-modal').addEventListener('click', (e) => {
            if (e.target.id === 'screenshot-modal') {
                this.closeScreenshotModal();
            }
        });

        // Terminal buttons (for fun)
        document.querySelector('.terminal-button.close').addEventListener('click', () => {
            this.showExitMessage();
        });

        document.querySelector('.terminal-button.minimize').addEventListener('click', () => {
            this.minimizeTerminal();
        });

        document.querySelector('.terminal-button.maximize').addEventListener('click', () => {
            this.maximizeTerminal();
        });
    }

    startTypingEffect() {
        // Type the initial command
        const commandElement = document.querySelector('#welcome .command');
        const originalText = commandElement.textContent;
        commandElement.textContent = '';
        
        this.typeText(commandElement, originalText, () => {
            // After typing command, show output
            setTimeout(() => {
                this.showWelcomeOutput();
            }, 500);
        });
    }

    typeText(element, text, callback) {
        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text[index];
                index++;
            } else {
                clearInterval(interval);
                if (callback) callback();
            }
        }, this.typingSpeed);
    }

    showWelcomeOutput() {
        const output = document.querySelector('#welcome .terminal-output');
        output.style.display = 'block';
        output.style.opacity = '0';
        
        // Fade in the output
        setTimeout(() => {
            output.style.transition = 'opacity 0.5s ease-in-out';
            output.style.opacity = '1';
            
            // Show menu after welcome
            setTimeout(() => {
                this.showMenu();
            }, 1000);
        }, 500);
    }

    showMenu() {
        const menuSection = document.getElementById('menu');
        menuSection.classList.remove('hidden');
        
        // Type the menu command
        const commandElement = document.querySelector('#menu .command');
        const originalText = commandElement.textContent;
        commandElement.textContent = '';
        
        this.typeText(commandElement, originalText, () => {
            // Show menu options with typing effect
            setTimeout(() => {
                this.showMenuOptions();
            }, 500);
        });
    }

    showMenuOptions() {
        const menuOptions = document.querySelectorAll('.menu-item');
        menuOptions.forEach((option, index) => {
            setTimeout(() => {
                option.style.opacity = '0';
                option.style.transform = 'translateX(-20px)';
                option.style.transition = 'all 0.3s ease-in-out';
                option.style.display = 'flex';
                
                setTimeout(() => {
                    option.style.opacity = '1';
                    option.style.transform = 'translateX(0)';
                }, 50);
            }, index * 200);
        });
    }

    navigateToSection(section) {
        // Hide current section
        const currentSection = document.getElementById(this.currentSection);
        if (currentSection) {
            currentSection.classList.add('hidden');
        }

        // Show new section
        const newSection = document.getElementById(section);
        if (newSection) {
            newSection.classList.remove('hidden');
            this.currentSection = section;
            
            // Type the command for the new section
            const commandElement = newSection.querySelector('.command');
            if (commandElement) {
                const originalText = commandElement.textContent;
                commandElement.textContent = '';
                this.typeText(commandElement, originalText);
            }
        }
    }

    handleKeyboardNavigation(e) {
        const key = e.key;
        
        // Number keys for menu navigation
        if (key >= '0' && key <= '4') {
            const menuItems = document.querySelectorAll('.menu-item');
            const index = key === '0' ? 4 : parseInt(key) - 1;
            
            if (menuItems[index]) {
                const section = menuItems[index].dataset.section;
                if (section === 'exit') {
                    this.showExitMessage();
                } else {
                    this.navigateToSection(section);
                }
            }
        }
        
        // Escape key to close modal
        if (key === 'Escape') {
            this.closeScreenshotModal();
        }
    }

    setupScreenshotModal() {
        this.modal = document.getElementById('screenshot-modal');
        this.modalImage = this.modal.querySelector('.modal-image');
        this.modalCaption = this.modal.querySelector('.modal-caption');
    }

    openScreenshotModal(screenshotName) {
        const imagePath = `screenshots/${screenshotName}`;
        const caption = this.getScreenshotCaption(screenshotName);
        
        this.modalImage.src = imagePath;
        this.modalImage.alt = caption;
        this.modalCaption.textContent = caption;
        
        this.modal.classList.remove('hidden');
        
        // Add typing effect to modal title
        const modalTitle = this.modal.querySelector('.modal-title');
        const originalTitle = modalTitle.textContent;
        modalTitle.textContent = '';
        this.typeText(modalTitle, originalTitle);
    }

    closeScreenshotModal() {
        this.modal.classList.add('hidden');
    }

    getScreenshotCaption(screenshotName) {
        const captions = {
            'main-window.png': 'Main Window - Tabbed SSH interface',
            'connection-settings.png': 'Connection Settings - Configure SSH connections',
            'terminal-settings.png': 'Terminal Settings - Customize terminal appearance',
            'preferences.png': 'Preferences - Application settings',
            'htop.png': 'Terminal with htop - System monitoring',
            'advanced-config.png': 'Advanced Configuration - Advanced SSH options'
        };
        return captions[screenshotName] || screenshotName;
    }

    showExitMessage() {
        const exitMessage = `
$ echo "Thanks for visiting sshPilot!"
Thanks for visiting sshPilot!
$ echo "Don't forget to download and try it out!"
Don't forget to download and try it out!
$ echo "Goodbye! 👋"
Goodbye! 👋
        `;
        
        // Create a new terminal line with exit message
        const terminalContent = document.querySelector('.terminal-content');
        const exitSection = document.createElement('div');
        exitSection.className = 'terminal-section';
        exitSection.innerHTML = `
            <div class="terminal-line">
                <span class="prompt">$</span>
                <span class="command">exit</span>
            </div>
            <div class="terminal-output">
                <pre style="color: var(--text-secondary);">${exitMessage}</pre>
            </div>
        `;
        
        // Hide current section and show exit message
        document.getElementById(this.currentSection).classList.add('hidden');
        terminalContent.appendChild(exitSection);
        
        // Type the exit command
        const commandElement = exitSection.querySelector('.command');
        this.typeText(commandElement, 'exit', () => {
            // After typing exit, show the message
            setTimeout(() => {
                const output = exitSection.querySelector('.terminal-output');
                output.style.opacity = '0';
                output.style.transition = 'opacity 0.5s ease-in-out';
                
                setTimeout(() => {
                    output.style.opacity = '1';
                }, 100);
            }, 500);
        });
    }

    minimizeTerminal() {
        const container = document.querySelector('.terminal-container');
        container.style.transform = 'scale(0.1)';
        container.style.opacity = '0';
        container.style.transition = 'all 0.3s ease-in-out';
        
        setTimeout(() => {
            container.style.transform = 'scale(1)';
            container.style.opacity = '1';
        }, 300);
    }

    maximizeTerminal() {
        const container = document.querySelector('.terminal-container');
        container.style.maxWidth = container.style.maxWidth === '100vw' ? '1200px' : '100vw';
        container.style.margin = container.style.maxWidth === '100vw' ? '20px auto' : '0';
        container.style.borderRadius = container.style.maxWidth === '100vw' ? '8px' : '0';
        container.style.transition = 'all 0.3s ease-in-out';
    }
}

// Initialize terminal interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TerminalInterface();
});

// Add some retro terminal effects
document.addEventListener('DOMContentLoaded', () => {
    // Add CRT scan lines effect
    const scanLines = document.createElement('div');
    scanLines.className = 'scan-lines';
    scanLines.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            transparent 50%,
            rgba(0, 255, 0, 0.02) 50%
        );
        background-size: 100% 4px;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(scanLines);

    // Add subtle flicker effect
    setInterval(() => {
        const flicker = Math.random() * 0.1 + 0.95;
        document.body.style.filter = `brightness(${flicker})`;
    }, 100);

    // Add terminal startup sound effect (optional)
    const startupSound = () => {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    };

    // Uncomment the line below to enable startup sound
    // startupSound();
});

// Add retro cursor effect
document.addEventListener('DOMContentLoaded', () => {
    const cursors = document.querySelectorAll('.input-cursor');
    cursors.forEach(cursor => {
        cursor.style.animation = 'blink 1s infinite';
    });
});

// Add typing sound effect (optional)
function playTypingSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

// Export for potential use
window.TerminalInterface = TerminalInterface;
