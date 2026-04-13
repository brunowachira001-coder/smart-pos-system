// Video Templates Data
const templates = [
    {
        id: 'product-showcase',
        name: 'Product Showcase',
        icon: '🛍️',
        description: 'Highlight your products with text and music',
        fields: [
            { name: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g., Summer Collection' },
            { name: 'productPrice', label: 'Price', type: 'text', placeholder: 'e.g., $29.99' },
            { name: 'productDescription', label: 'Description', type: 'textarea', placeholder: 'Describe your product' },
            { name: 'callToAction', label: 'Call to Action', type: 'text', placeholder: 'e.g., Shop Now' },
            { name: 'bgColor', label: 'Background Color', type: 'select', options: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'] }
        ],
        generate: generateProductShowcase
    },
    {
        id: 'testimonial',
        name: 'Customer Testimonial',
        icon: '⭐',
        description: 'Share customer reviews and feedback',
        fields: [
            { name: 'customerName', label: 'Customer Name', type: 'text', placeholder: 'e.g., Sarah Johnson' },
            { name: 'testimonial', label: 'Testimonial', type: 'textarea', placeholder: 'What did the customer say?' },
            { name: 'rating', label: 'Rating', type: 'select', options: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'] },
            { name: 'bgColor', label: 'Background Color', type: 'select', options: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'] }
        ],
        generate: generateTestimonial
    },
    {
        id: 'countdown',
        name: 'Flash Sale Countdown',
        icon: '⏰',
        description: 'Create urgency with countdown timer',
        fields: [
            { name: 'saleTitle', label: 'Sale Title', type: 'text', placeholder: 'e.g., FLASH SALE' },
            { name: 'discount', label: 'Discount %', type: 'text', placeholder: 'e.g., 50%' },
            { name: 'endTime', label: 'Ends In', type: 'text', placeholder: 'e.g., 24 HOURS' },
            { name: 'bgColor', label: 'Background Color', type: 'select', options: ['#ff6b6b', '#ee5a6f', '#f9ca24', '#6c5ce7', '#a29bfe'] }
        ],
        generate: generateCountdown
    },
    {
        id: 'before-after',
        name: 'Before & After',
        icon: '✨',
        description: 'Show transformation or results',
        fields: [
            { name: 'beforeText', label: 'Before Label', type: 'text', placeholder: 'e.g., Before' },
            { name: 'afterText', label: 'After Label', type: 'text', placeholder: 'e.g., After' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the transformation' },
            { name: 'bgColor', label: 'Background Color', type: 'select', options: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'] }
        ],
        generate: generateBeforeAfter
    },
    {
        id: 'tips-tricks',
        name: 'Tips & Tricks',
        icon: '💡',
        description: 'Share helpful tips with your audience',
        fields: [
            { name: 'tipTitle', label: 'Tip Title', type: 'text', placeholder: 'e.g., 5 Fashion Tips' },
            { name: 'tip1', label: 'Tip 1', type: 'text', placeholder: 'First tip' },
            { name: 'tip2', label: 'Tip 2', type: 'text', placeholder: 'Second tip' },
            { name: 'tip3', label: 'Tip 3', type: 'text', placeholder: 'Third tip' },
            { name: 'bgColor', label: 'Background Color', type: 'select', options: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'] }
        ],
        generate: generateTipsTricks
    },
    {
        id: 'announcement',
        name: 'Announcement',
        icon: '📢',
        description: 'Announce new products or events',
        fields: [
            { name: 'announcementTitle', label: 'Announcement Title', type: 'text', placeholder: 'e.g., NEW COLLECTION' },
            { name: 'announcementText', label: 'Announcement Text', type: 'textarea', placeholder: 'What are you announcing?' },
            { name: 'date', label: 'Date/Time', type: 'text', placeholder: 'e.g., Coming Soon' },
            { name: 'bgColor', label: 'Background Color', type: 'select', options: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'] }
        ],
        generate: generateAnnouncement
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTemplates();
});

function renderTemplates() {
    const grid = document.getElementById('templatesGrid');
    grid.innerHTML = templates.map(template => `
        <div class="template-card" onclick="openModal('${template.id}')">
            <div class="template-preview">${template.icon}</div>
            <div class="template-info">
                <h3>${template.name}</h3>
                <p>${template.description}</p>
                <button class="btn">Create Video</button>
            </div>
        </div>
    `).join('');
}

function openModal(templateId) {
    const template = templates.find(t => t.id === templateId);
    const modal = document.getElementById('modal');
    const form = document.getElementById('templateForm');
    const title = document.getElementById('modalTitle');

    title.textContent = template.name;
    
    form.innerHTML = template.fields.map(field => {
        if (field.type === 'textarea') {
            return `
                <div class="form-group">
                    <label>${field.label}</label>
                    <textarea name="${field.name}" placeholder="${field.placeholder}"></textarea>
                </div>
            `;
        } else if (field.type === 'select') {
            return `
                <div class="form-group">
                    <label>${field.label}</label>
                    <select name="${field.name}">
                        ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                </div>
            `;
        } else {
            return `
                <div class="form-group">
                    <label>${field.label}</label>
                    <input type="${field.type}" name="${field.name}" placeholder="${field.placeholder}">
                </div>
            `;
        }
    }).join('');

    form.innerHTML += `
        <div class="preview-section">
            <h3>Preview</h3>
            <div class="video-preview" id="preview">
                <div class="preview-content">
                    <p>Preview will appear here</p>
                </div>
            </div>
        </div>
        <div class="btn-group">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn">Generate Video</button>
        </div>
    `;

    form.dataset.templateId = templateId;
    modal.classList.add('active');

    // Add live preview
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('change', updatePreview);
        input.addEventListener('input', updatePreview);
    });
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function updatePreview() {
    const form = document.getElementById('templateForm');
    const templateId = form.dataset.templateId;
    const template = templates.find(t => t.id === templateId);
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const preview = document.getElementById('preview');
    preview.innerHTML = template.generate(data);
}

function handleSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('templateForm');
    const templateId = form.dataset.templateId;
    const template = templates.find(t => t.id === templateId);
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Generate canvas
    generateCanvasVideo(template, data);
}

// Template Generators
function generateProductShowcase(data) {
    return `
        <div class="preview-content" style="background: ${data.bgColor}; color: white;">
            <div style="font-size: 3em; margin-bottom: 20px;">🛍️</div>
            <h2 style="font-size: 2em; margin-bottom: 10px;">${data.productName || 'Product Name'}</h2>
            <p style="font-size: 1.2em; margin-bottom: 20px;">${data.productDescription || 'Product description'}</p>
            <p style="font-size: 1.5em; font-weight: bold; margin-bottom: 20px;">${data.productPrice || '$0.00'}</p>
            <button style="padding: 10px 30px; background: white; color: ${data.bgColor}; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
                ${data.callToAction || 'Shop Now'}
            </button>
        </div>
    `;
}

function generateTestimonial(data) {
    return `
        <div class="preview-content" style="background: ${data.bgColor}; color: white;">
            <div style="font-size: 2em; margin-bottom: 20px;">${data.rating || '⭐⭐⭐⭐⭐'}</div>
            <p style="font-size: 1.1em; margin-bottom: 20px; font-style: italic;">"${data.testimonial || 'Customer testimonial'}"</p>
            <p style="font-size: 1.2em; font-weight: bold;">- ${data.customerName || 'Customer Name'}</p>
        </div>
    `;
}

function generateCountdown(data) {
    return `
        <div class="preview-content" style="background: ${data.bgColor}; color: white;">
            <h1 style="font-size: 2.5em; margin-bottom: 20px; animation: pulse 1s infinite;">${data.saleTitle || 'FLASH SALE'}</h1>
            <p style="font-size: 3em; font-weight: bold; margin-bottom: 20px;">${data.discount || '50'}% OFF</p>
            <p style="font-size: 1.5em;">Ends in ${data.endTime || '24 HOURS'}</p>
        </div>
    `;
}

function generateBeforeAfter(data) {
    return `
        <div class="preview-content" style="background: ${data.bgColor}; color: white;">
            <div style="display: flex; gap: 20px; margin-bottom: 20px; width: 100%;">
                <div style="flex: 1; text-align: center;">
                    <div style="font-size: 2em; margin-bottom: 10px;">❌</div>
                    <p style="font-weight: bold;">${data.beforeText || 'Before'}</p>
                </div>
                <div style="flex: 1; text-align: center;">
                    <div style="font-size: 2em; margin-bottom: 10px;">✅</div>
                    <p style="font-weight: bold;">${data.afterText || 'After'}</p>
                </div>
            </div>
            <p style="font-size: 1.1em;">${data.description || 'Transformation description'}</p>
        </div>
    `;
}

function generateTipsTricks(data) {
    return `
        <div class="preview-content" style="background: ${data.bgColor}; color: white;">
            <h2 style="font-size: 2em; margin-bottom: 20px;">💡 ${data.tipTitle || 'Tips & Tricks'}</h2>
            <div style="text-align: left; font-size: 1.1em;">
                <p style="margin-bottom: 15px;">✓ ${data.tip1 || 'Tip 1'}</p>
                <p style="margin-bottom: 15px;">✓ ${data.tip2 || 'Tip 2'}</p>
                <p>✓ ${data.tip3 || 'Tip 3'}</p>
            </div>
        </div>
    `;
}

function generateAnnouncement(data) {
    return `
        <div class="preview-content" style="background: ${data.bgColor}; color: white;">
            <h1 style="font-size: 2.5em; margin-bottom: 20px;">${data.announcementTitle || 'ANNOUNCEMENT'}</h1>
            <p style="font-size: 1.2em; margin-bottom: 20px;">${data.announcementText || 'Announcement text'}</p>
            <p style="font-size: 1.1em; opacity: 0.9;">${data.date || 'Coming Soon'}</p>
        </div>
    `;
}

function generateCanvasVideo(template, data) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    // Get background color
    const bgColor = data.bgColor || '#667eea';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text color
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    // Draw content based on template
    if (template.id === 'product-showcase') {
        ctx.font = 'bold 80px Arial';
        ctx.fillText(data.productName || 'Product', canvas.width / 2, 400);
        
        ctx.font = '40px Arial';
        ctx.fillText(data.productDescription || 'Description', canvas.width / 2, 600);
        
        ctx.font = 'bold 100px Arial';
        ctx.fillText(data.productPrice || '$0', canvas.width / 2, 900);
        
        ctx.font = 'bold 50px Arial';
        ctx.fillText(data.callToAction || 'Shop Now', canvas.width / 2, 1200);
    }

    // Download canvas as image
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-template-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        alert('Video template downloaded! Use it in CapCut, DaVinci Resolve, or Canva to create your final video.');
    });
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        closeModal();
    }
});
