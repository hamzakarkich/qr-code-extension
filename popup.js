class QRCodeGenerator {
    constructor() {
        this.textInput = document.getElementById('textInput');
        this.errorCorrectionLevel = document.getElementById('errorCorrectionLevel');
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.qrcodeDiv = document.getElementById('qrcode');
        this.historyList = document.getElementById('historyList');
        
        this.qrcode = null;
        this.currentQR = null;
        
        this.initializeEventListeners();
        this.loadHistory();
    }

    initializeEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateQRCode());
        this.downloadBtn.addEventListener('click', () => this.downloadQRCode());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateQRCode();
            }
        });
    }

    generateQRCode() {
        const text = this.textInput.value.trim();
        
        if (!text) {
            alert('Please enter text or URL');
            return;
        }

        // Clear previous QR code
        this.qrcodeDiv.innerHTML = '';
        
        // Generate new QR code
        this.qrcode = new QRCode(this.qrcodeDiv, {
            text: text,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel[this.errorCorrectionLevel.value]
        });

        this.currentQR = text;
        this.downloadBtn.disabled = false;
        
        // Save to history
        this.saveToHistory(text);
    }

    async saveToHistory(text) {
        const history = await this.getHistory();
        const newEntry = {
            text: text,
            timestamp: new Date().toISOString()
        };
        
        // Add new entry and keep only last 5
        history.unshift(newEntry);
        if (history.length > 5) {
            history.pop();
        }
        
        await chrome.storage.local.set({ 'qrHistory': history });
        this.displayHistory(history);
    }

    async getHistory() {
        const result = await chrome.storage.local.get('qrHistory');
        return result.qrHistory || [];
    }

    async loadHistory() {
        const history = await this.getHistory();
        this.displayHistory(history);
    }

    displayHistory(history) {
        this.historyList.innerHTML = '';
        
        history.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            const text = document.createElement('div');
            text.className = 'history-item-text';
            text.textContent = entry.text;
            
            const regenButton = document.createElement('button');
            regenButton.textContent = 'Regenerate';
            regenButton.addEventListener('click', () => {
                this.textInput.value = entry.text;
                this.generateQRCode();
            });
            
            item.appendChild(text);
            item.appendChild(regenButton);
            this.historyList.appendChild(item);
        });
    }

    downloadQRCode() {
        if (!this.currentQR) return;
        
        const canvas = this.qrcodeDiv.querySelector('canvas');
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = `qr-code-${this.currentQR.substring(0, 20)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
}

// Initialize the generator when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QRCodeGenerator();
});