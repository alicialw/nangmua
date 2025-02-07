function createWarningDisplay(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const levels = [
        { id: 'danger', icon: '⚠️', text: 'Use emergency shields only', color: 'var(--magenta)' },
        { id: 'warning', icon: '⚡', text: 'Take it slow', color: 'var(--yellow)' },
        { id: 'safe', icon: '✓', text: 'Safe to move quickly', color: 'var(--green)' }
    ];

    const html = `
        <div class="warning-levels">
            ${levels.map(level => `
                <div class="level ${level.id}" data-level="${level.id}">
                    <span class="level-icon">${level.icon}</span>
                    <span class="level-text">${level.text}</span>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;

    container.querySelectorAll('.level').forEach(el => {
        el.addEventListener('click', () => {
            container.querySelectorAll('.level').forEach(l => l.classList.remove('active'));
            el.classList.add('active');
        });
    });

    container.querySelector('.level.safe').classList.add('active');
}