function createTimeZoneClock(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const periods = [
        {
            name: 'Morning Protocol',
            vietnamese: 'Sáng sớm tinh mơ',
            start: 4,
            end: 7,
            color: 'var(--blue)',
            time: '4:00 - 7:00',
            moduleId: 'module1A'
        },
        {
            name: 'High Risk Hours',
            vietnamese: 'Nắng thiêu nắng đốt',
            start: 7,
            end: 16,
            color: 'var(--orange)',
            time: '7:00 - 16:00',
            moduleId: 'module1B'
        },
        {
            name: 'Evening Activities',
            vietnamese: 'Đêm khuya thanh vắng',
            start: 16,
            end: 19,
            color: 'var(--purple)',
            time: '16:00 - 19:00',
            moduleId: 'module1C'
        }
    ];

    const svg = `
        <svg viewBox="0 0 400 400" class="clock">
            <!-- Clock face background -->
            <circle cx="200" cy="200" r="180" fill="#1a1a1a" stroke="#666" stroke-width="2"/>
            
            <!-- Interactive time periods -->
            ${periods.map((p, index) => {
                const startAngle = (p.start * 15) - 90;
                const endAngle = (p.end * 15) - 90;
                return `
                    <path class="time-period" 
                        d="M 200 200
                        L ${200 + 180 * Math.cos(startAngle * Math.PI/180)} ${200 + 180 * Math.sin(startAngle * Math.PI/180)}
                        A 180 180 0 ${endAngle - startAngle > 180 ? 1 : 0} 1
                        ${200 + 180 * Math.cos(endAngle * Math.PI/180)} ${200 + 180 * Math.sin(endAngle * Math.PI/180)}
                        Z"
                        fill="${p.color}" 
                        fill-opacity="0.3"
                        data-period="${index}"
                        aria-label="${p.vietnamese}"
                    />
                `;
            }).join('')}

            <!-- Hour markers -->
            ${Array.from({length: 24}, (_, i) => {
                const angle = i * 15 - 90;
                const cos = Math.cos(angle * Math.PI/180);
                const sin = Math.sin(angle * Math.PI/180);
                return `
                    <line
                        x1="${200 + 170 * cos}"
                        y1="${200 + 170 * sin}"
                        x2="${200 + 180 * cos}"
                        y2="${200 + 180 * sin}"
                        stroke="#999"
                        stroke-width="2"
                    />
                    <text
                        x="${200 + 155 * cos}"
                        y="${200 + 155 * sin}"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="#e0e0e0"
                        font-size="14"
                    >${i}</text>
                `;
            }).join('')}

            <!-- Clock hands group -->
            <g class="clock-hands"></g>
        </svg>

        <!-- Period legend -->
        <div class="period-legend">
            ${periods.map((p, index) => `
                <div class="period-item" data-period="${index}">
                    <div class="period-color" style="background-color: ${p.color}"></div>
                    <div class="period-info">
                        <div class="period-name" style="color: #e0e0e0">${p.vietnamese}</div>
                        <div class="period-time" style="color: #999">${p.time}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = svg;

    // Set opacity based on current module
    const currentModuleId = container.closest('.module-container')?.id;
    if (currentModuleId) {
        const periodIndex = periods.findIndex(p => p.moduleId === currentModuleId);
        if (periodIndex !== -1) {
            container.querySelectorAll('.time-period').forEach((p, i) => {
                p.setAttribute('fill-opacity', i === periodIndex ? '1' : '0.3');
            });
        }
    }

    function updateClockHands() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const hourAngle = (hours % 24 + minutes/60) * 15 - 90;
        const minuteAngle = minutes * 6 - 90;
        const secondAngle = seconds * 6 - 90;

        const hands = container.querySelector('.clock-hands');
        hands.innerHTML = `
            <!-- Hour hand -->
            <line
                x1="200"
                y1="200"
                x2="${200 + 100 * Math.cos(hourAngle * Math.PI/180)}"
                y2="${200 + 100 * Math.sin(hourAngle * Math.PI/180)}"
                stroke="#e0e0e0"
                stroke-width="4"
                stroke-linecap="round"
            />
            <!-- Minute hand -->
            <line
                x1="200"
                y1="200"
                x2="${200 + 140 * Math.cos(minuteAngle * Math.PI/180)}"
                y2="${200 + 140 * Math.sin(minuteAngle * Math.PI/180)}"
                stroke="#b3b3b3"
                stroke-width="3"
                stroke-linecap="round"
            />
            <!-- Second hand -->
            <line
                x1="200"
                y1="200"
                x2="${200 + 150 * Math.cos(secondAngle * Math.PI/180)}"
                y2="${200 + 150 * Math.sin(secondAngle * Math.PI/180)}"
                stroke="#808080"
                stroke-width="1"
                stroke-linecap="round"
            />
            <!-- Center dot -->
            <circle cx="200" cy="200" r="4" fill="#e0e0e0"/>
        `;
    }

    updateClockHands();
    setInterval(updateClockHands, 1000);
}