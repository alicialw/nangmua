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
            activities: [
                'Take your hover-bike to school',
                'Do your morning exercises in the community cooling zones',
                'Help your family collect fresh water from the community purifiers'
            ]
        },
        {
            name: 'High Risk Hours',
            vietnamese: 'Nắng thiêu nắng đốt',
            start: 7,
            end: 16,
            color: 'var(--orange)',
            time: '7:00 - 16:00',
            activities: [
                'Follow the blue light paths in your school\'s corridors',
                'Use your personal cooling companion during outdoor transitions',
                'Watch for the warning colors on your wrist device'
            ]
        },
        {
            name: 'Evening Activities',
            vietnamese: 'Đêm khuya thanh vắng',
            start: 16,
            end: 19,
            color: 'var(--purple)',
            time: '16:00 - 19:00',
            activities: [
                'Check your community app for safe zones',
                'Keep your water levels topped up',
                'Join your friends in the protected community spaces',
                'Practice your heat emergency drills'
            ]
        }
    ];

    const svg = `
        <svg viewBox="0 0 400 400" class="clock">
            <!-- Clock face background -->
            <circle cx="200" cy="200" r="180" fill="white" stroke="#333" stroke-width="2"/>
            
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
                        fill-opacity="0.6"
                        data-period="${index}"
                        role="button"
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
                        stroke="#333"
                        stroke-width="2"
                    />
                    <text
                        x="${200 + 155 * cos}"
                        y="${200 + 155 * sin}"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="#333"
                        font-size="14"
                    >${i}</text>
                `;
            }).join('')}

            <!-- Clock hands group -->
            <g class="clock-hands"></g>
        </svg>

        <!-- Tooltip container -->
        <div class="period-tooltip" style="display: none;">
            <div class="tooltip-content"></div>
        </div>

        <!-- Period legend -->
        <div class="period-legend">
            ${periods.map((p, index) => `
                <div class="period-item" data-period="${index}">
                    <div class="period-color" style="background-color: ${p.color}"></div>
                    <div class="period-info">
                        <div class="period-name">${p.vietnamese}</div>
                        <div class="period-time">${p.time}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = svg;

    const tooltip = container.querySelector('.period-tooltip');
    const tooltipContent = tooltip.querySelector('.tooltip-content');

    container.querySelectorAll('.time-period, .period-item').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const periodIndex = e.target.dataset.period;
            const period = periods[periodIndex];
            
            tooltipContent.innerHTML = `
                <h3>${period.vietnamese}</h3>
                <p>${period.time}</p>
                <ul>
                    ${period.activities.map(activity => `<li>${activity}</li>`).join('')}
                </ul>
            `;
            
            tooltip.style.display = 'block';
            
            container.querySelectorAll('.time-period').forEach((p, i) => {
                if (i == periodIndex) {
                    p.setAttribute('fill-opacity', '0.9');
                } else {
                    p.setAttribute('fill-opacity', '0.3');
                }
            });
        });

        element.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';

            container.querySelectorAll('.time-period').forEach(p => {
                p.setAttribute('fill-opacity', '0.6');
            });
        });
    });

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
                stroke="#333"
                stroke-width="4"
                stroke-linecap="round"
            />
            <!-- Minute hand -->
            <line
                x1="200"
                y1="200"
                x2="${200 + 140 * Math.cos(minuteAngle * Math.PI/180)}"
                y2="${200 + 140 * Math.sin(minuteAngle * Math.PI/180)}"
                stroke="#666"
                stroke-width="3"
                stroke-linecap="round"
            />
            <!-- Second hand -->
            <line
                x1="200"
                y1="200"
                x2="${200 + 150 * Math.cos(secondAngle * Math.PI/180)}"
                y2="${200 + 150 * Math.sin(secondAngle * Math.PI/180)}"
                stroke="#999"
                stroke-width="1"
                stroke-linecap="round"
            />
            <!-- Center dot -->
            <circle cx="200" cy="200" r="4" fill="#333"/>
        `;
    }

    updateClockHands();
    setInterval(updateClockHands, 1000);
}