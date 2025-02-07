let gameSketch = function(p) {
    let player;
    let gameObjects = [];
    let score = 0;
    let timeOfDay = 0;
    let gameStarted = false;
    let gameOver = false;
    
    const GRID = {
        COLS: 12,
        ROWS: 9,
        MARGIN_X: 32,
        MARGIN_Y: 24,
        width: 640,  
        height: 480, 
        get cellWidth() { return (this.width - 2 * this.MARGIN_X) / this.COLS; },
        get cellHeight() { return (this.height - 2 * this.MARGIN_Y) / this.ROWS; }
    };

    class Player {
        constructor() {
            this.x = GRID.width / 2;
            this.y = GRID.height / 2;
            this.size = 30;
            this.health = 100;
            this.cooldown = 0;
            this.isSafe = false;
            this.speed = 5;
        }

        update() {
            if (p.keyIsDown(65)) { // A key
                this.x -= this.speed;
            }
            if (p.keyIsDown(68)) { // D key
                this.x += this.speed;
            }
            if (p.keyIsDown(87)) { // W key
                this.y -= this.speed;
            }
            if (p.keyIsDown(83)) { // S key
                this.y += this.speed;
            }

            this.x = p.constrain(this.x, GRID.MARGIN_X, GRID.width - GRID.MARGIN_X);
            this.y = p.constrain(this.y, GRID.MARGIN_Y, GRID.height - GRID.MARGIN_Y);

            // Handle sun effects during dangerous hours
            if (timeOfDay > 10 && timeOfDay < 16) {
                if (!this.isSafe) {
                    this.health -= 0.05; // Take damage when exposed
                } else {
                    // Recover health and gain points when in shelter
                    this.health = Math.min(100, this.health + 0.01);
                    score += 0.01; // Bonus points for using shelter
                }
            }

            if (this.cooldown > 0) {
                this.cooldown--;
            }
        }

        draw() {
            p.push();
            // Draw character shadow
            p.fill(0, 50);
            p.noStroke();
            p.ellipse(this.x, this.y + 25, this.size * 1.2, this.size * 0.3);
            
            // Draw character body
            p.fill(255);
            p.stroke(0);
            p.ellipse(this.x, this.y, this.size, this.size);
            
            // Draw protection aura when safe
            if (this.isSafe) {
                p.noFill();
                p.stroke(100, 200, 100);
                p.strokeWeight(2);
                p.ellipse(this.x, this.y, this.size * 1.4, this.size * 1.4);
                
                // Add pulsing effect
                const pulseSize = p.sin(p.frameCount * 0.1) * 5;
                p.stroke(100, 200, 100, 100);
                p.ellipse(this.x, this.y, this.size * 1.4 + pulseSize, this.size * 1.4 + pulseSize);
            }
            
            // Draw health bar
            p.noStroke();
            p.fill(200, 50, 50);
            p.rect(this.x - 25, this.y - 35, 50, 5);
            p.fill(50, 200, 50);
            p.rect(this.x - 25, this.y - 35, this.health / 2, 5);
            
            // Show protection status above player
            if (this.isSafe) {
                p.textAlign(p.CENTER);
                p.fill(100, 200, 100);
                p.textSize(12);
                p.text('PROTECTED', this.x, this.y - 45);
            }
            
            p.pop();
        }
    }

    class GameObject {
        constructor(type, gridX, gridY) {
            this.type = type;
            this.gridX = gridX;
            this.gridY = gridY;
            this.x = GRID.MARGIN_X + (gridX + 0.5) * GRID.cellWidth;
            this.y = GRID.MARGIN_Y + (gridY + 0.5) * GRID.cellHeight;
            this.size = 30;
            this.collected = false;
            
            // Movement properties for heat waves
            this.originalX = this.x;
            this.originalY = this.y;
            this.moveOffset = 0;
            this.moveSpeed = p.random(0.02, 0.03);

            switch(type) {
                case 'cooling':
                    this.color = p.color(0, 150, 255);
                    break;
                case 'heatwave':
                    this.color = p.color(255, 100, 0);
                    this.size = 100;
                    break;
                case 'shelter':
                    this.color = p.color(100, 200, 100);
                    this.size = 80;
                    break;
            }
        }

        draw() {
            if (this.collected) return;

            p.push();
            p.noStroke();
            
            switch(this.type) {
                case 'cooling':
                    p.fill(this.color);
                    p.ellipse(this.x, this.y, this.size, this.size);
                    p.triangle(
                        this.x - this.size/3, this.y,
                        this.x + this.size/3, this.y,
                        this.x, this.y - this.size/2
                    );
                    break;
                    
                case 'heatwave':
                    p.noFill();
                    p.stroke(255, 100, 0);
                    p.strokeWeight(2);
                    
                    // Draw pulsing rays
                    const rayCount = 8;
                    const pulseSpeed = 0.05;
                    const maxRadius = this.size / 2;
                    const pulseOffset = p.frameCount * pulseSpeed;
                    
                    for (let ring = 0; ring < 3; ring++) {
                        const ringRadius = maxRadius - ring * 15;
                        const ringPulse = p.sin(pulseOffset + ring * 0.5) * 5;
                        
                        for (let i = 0; i < rayCount; i++) {
                            const angle = (i * p.TWO_PI / rayCount) + ring * 0.2;
                            const x1 = this.x + p.cos(angle) * (ringRadius - 10 + ringPulse);
                            const y1 = this.y + p.sin(angle) * (ringRadius - 10 + ringPulse);
                            const x2 = this.x + p.cos(angle) * (ringRadius + ringPulse);
                            const y2 = this.y + p.sin(angle) * (ringRadius + ringPulse);
                            p.line(x1, y1, x2, y2);
                        }
                    }

                    // Draw center
                    p.noStroke();
                    p.fill(255, 100, 0, 100);
                    p.circle(this.x, this.y, 20);
                    break;
                    
                case 'shelter':
                    p.fill(this.color);
                    p.rect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
                    p.triangle(
                        this.x - this.size/2, this.y - this.size/2,
                        this.x + this.size/2, this.y - this.size/2,
                        this.x, this.y - this.size
                    );
                    if (player.isSafe && p.dist(player.x, player.y, this.x, this.y) < this.size * 1.2) {
                        p.noFill();
                        p.stroke(100, 200, 100, 50);
                        p.strokeWeight(2);
                        p.circle(this.x, this.y, this.size * 2.4);
                    }
                    break;
            }
            p.pop();
        }

        checkCollision(player) {
            if (this.collected) return false;
            
            let d = p.dist(this.x, this.y, player.x, player.y);
            let protectionRadius = this.type === 'shelter' ? this.size * 1.2 : (this.size + player.size) / 2;
            
            if (d < protectionRadius) {
                switch(this.type) {
                    case 'cooling':
                        if (player.cooldown <= 0) {
                            player.health = p.min(100, player.health + 20);
                            player.cooldown = 30;
                            score += 10;
                            this.collected = true;
                        }
                        break;
                    case 'heatwave':
                        if (!player.isSafe) {  // Only take damage if not in shelter
                            player.health -= 1;
                        }
                        break;
                    case 'shelter':
                        player.isSafe = true;
                        return true;
                }
            } else if (this.type === 'shelter' && d > this.size * 1.2) {
                // Only reset isSafe if player is well outside the shelter's radius
                player.isSafe = false;
            }
            return false;
        }
    }

    // Helper function to get available grid positions
    function getAvailableGridPositions() {
        const positions = [];
        for (let x = 0; x < GRID.COLS; x++) {
            for (let y = 0; y < GRID.ROWS; y++) {
                positions.push({x, y});
            }
        }
        return positions;
    }

    // Helper function to place objects in grid
    function placeObjectsInGrid(type, count) {
        const available = getAvailableGridPositions();
        const objects = [];
        
        for (let i = 0; i < count && available.length > 0; i++) {
            const randomIndex = Math.floor(p.random(available.length));
            const pos = available.splice(randomIndex, 1)[0];
            objects.push(new GameObject(type, pos.x, pos.y));
        }
        
        return objects;
    }

    function updateGame() {
        if (!gameStarted || gameOver) return;

        timeOfDay += 0.01;
        if (timeOfDay >= 24) {
            gameOver = true;
            return;
        }

        player.update();

        // Check collisions
        gameObjects.forEach(obj => {
            obj.checkCollision(player);
        });

        // Remove collected cooling items and add new ones in clusters
        gameObjects = gameObjects.filter(obj => !obj.collected || obj.type !== 'cooling');
        
        // Maintain multiple clusters of cooling items
        const desiredClusters = 3; // Number of clusters
        const itemsPerCluster = 2; // Items per cluster
        const totalDesiredItems = desiredClusters * itemsPerCluster;
        
        while (gameObjects.filter(obj => obj.type === 'cooling').length < totalDesiredItems) {
            // Find an empty area for a new cluster
            const available = getAvailableGridPositions().filter(pos => {
                // Ensure no objects are within 2 grid cells
                return !gameObjects.some(obj => 
                    Math.abs(obj.gridX - pos.x) < 2 && Math.abs(obj.gridY - pos.y) < 2
                );
            });

            if (available.length > 0) {
                // Place cluster center
                const centerPos = available[Math.floor(p.random(available.length))];
                
                // Add items around the center
                for (let i = 0; i < itemsPerCluster; i++) {
                    const offsetX = p.random(-1, 1);
                    const offsetY = p.random(-1, 1);
                    const newX = Math.floor(p.constrain(centerPos.x + offsetX, 0, GRID.COLS - 1));
                    const newY = Math.floor(p.constrain(centerPos.y + offsetY, 0, GRID.ROWS - 1));
                    
                    gameObjects.push(new GameObject('cooling', newX, newY));
                }
            }
        }

        if (player.health <= 0) {
            gameOver = true;
        }
    }

    function drawGame() {
        p.clear();
        
        // Draw sky
        let skyColor = p.color(100, 150, 255,100);
        let sunY = p.map(p.sin(timeOfDay / 24 * p.TWO_PI), -1, 1, 550, 50);
        let sunDanger = (timeOfDay > 10 && timeOfDay < 16);
        
        if (sunDanger) {
            skyColor = p.color(255, 200, 150,100);
        }
        p.background(skyColor);
        
        // Draw grid (for debugging)
        p.stroke(255, 255, 255, 30);
        for (let x = 0; x <= GRID.COLS; x++) {
            let xPos = GRID.MARGIN_X + x * GRID.cellWidth;
            p.line(xPos, GRID.MARGIN_Y, xPos, 600 - GRID.MARGIN_Y);
        }
        for (let y = 0; y <= GRID.ROWS; y++) {
            let yPos = GRID.MARGIN_Y + y * GRID.cellHeight;
            p.line(GRID.MARGIN_X, yPos, 800 - GRID.MARGIN_X, yPos);
        } 
        
        // Draw sun with more margin
        p.fill(sunDanger ? p.color(255, 100, 0) : p.color(255, 255, 0));
        p.noStroke();
        p.circle(GRID.width - 120, sunY, 60);
        
        // Add sun rays
        if (sunDanger) {
            p.push();
            p.translate(GRID.width - 120, sunY);
            p.stroke(255, 100, 0, 100);
            p.strokeWeight(2);
            for (let i = 0; i < 12; i++) {
                const angle = (i * p.TWO_PI / 12) + (p.frameCount * 0.02);
                const innerRadius = 35;
                const outerRadius = 45 + p.sin(p.frameCount * 0.1 + i) * 5;
                p.line(
                    p.cos(angle) * innerRadius,
                    p.sin(angle) * innerRadius,
                    p.cos(angle) * outerRadius,
                    p.sin(angle) * outerRadius
                );
            }
            p.pop();
        }
        
        // Update and draw all game objects
        gameObjects.forEach(obj => {
            // Update heat wave positions
            if (obj.type === 'heatwave') {
                obj.moveOffset += obj.moveSpeed;
                obj.x = obj.originalX + p.sin(obj.moveOffset) * 30;
                obj.y = obj.originalY + p.cos(obj.moveOffset * 0.7) * 20;
            }
            obj.draw();
        });
        player.draw();
        
        // Draw enhanced HUD
        p.push();
        // Draw HUD background
        p.fill(0, 0, 0, 50);
        p.noStroke();
        p.rect(10, 10, 200, 100, 10);
        
        // Draw score with icon and better formatting
        p.textSize(24);
        p.fill(255, 215, 0); // Gold color for score
        p.textAlign(p.LEFT);
        p.text(`★ ${Math.floor(score).toLocaleString()}`, 25, 40);
        
        // Draw time with better formatting and 12-hour clock
        let displayHour = p.floor(timeOfDay);
        const ampm = displayHour >= 12 ? 'PM' : 'AM';
        displayHour = displayHour % 12 || 12;
        const timeString = `${displayHour}:00 ${ampm}`;
        p.fill(255);
        p.textSize(20);
        p.text(`🕐 ${timeString}`, 25, 70);
        
        // Show shelter status with icon
        if (player.isSafe) {
            p.fill(100, 200, 100);
            p.text(`✓ Protected from Sun & Heat!`, 20, 90);
        } else if (timeOfDay > 10 && timeOfDay < 16) {
            p.fill(255, 100, 0);
            p.text(`! Find Shelter!`, 20, 90);
        }
        
        if (gameOver) {
            p.fill(0, 0, 0, 150);
            p.rect(0, 0, 800, 600);
            p.fill(255);
            p.textSize(40);
            p.textAlign(p.CENTER);
            p.text('Game Over!', GRID.width/2, GRID.height/2 - 50);
            p.textSize(24);
            p.text(`Final Score: ${Math.floor(score)}`, GRID.width/2, GRID.height/2);
            p.text('Press SPACE to play again', GRID.width/2, GRID.height/2 + 50);
            p.text('Use WASD keys to move', GRID.width/2, GRID.height/2 + 100);
        }
    }

    p.setup = function() {
        const canvas = p.createCanvas(640, 480); // 40rem x 30rem at base 16px font-size
        canvas.parent('game-container');
        GRID.width = 640;
        GRID.height = 480;
    }

    p.draw = function() {
        if (gameStarted) {
            updateGame();
            drawGame();
        }
    }

    p.keyPressed = function() {
        if (p.keyCode === 32 && gameOver) { // SPACE
            initGame();
        }
    }

    function initGame() {
        player = new Player();
        gameObjects = [];
        score = 0;
        timeOfDay = 6;
        gameStarted = true;
        gameOver = false;

        // Add initial game objects with balanced distribution
        gameObjects = [];
        
        // Add shelters with good spacing
        const shelterCount = 6;
        const shelterPositions = getSpacedPositions(shelterCount, 3); // Minimum 3 cells apart
        shelterPositions.forEach(pos => {
            gameObjects.push(new GameObject('shelter', pos.x, pos.y));
        });
        
        // Add heat waves in areas away from shelters
        const heatwaveCount = 5;
        const heatwavePositions = getSpacedPositions(heatwaveCount, 2, shelterPositions);
        heatwavePositions.forEach(pos => {
            gameObjects.push(new GameObject('heatwave', pos.x, pos.y));
        });
        
        // Add initial cooling items in clusters
        const clusterCount = 3;
        const itemsPerCluster = 3;
        for (let c = 0; c < clusterCount; c++) {
            const clusterCenter = getRandomEmptyPosition();
            if (clusterCenter) {
                for (let i = 0; i < itemsPerCluster; i++) {
                    const offsetX = p.random(-1, 1);
                    const offsetY = p.random(-1, 1);
                    const newX = Math.floor(p.constrain(clusterCenter.x + offsetX, 0, GRID.COLS - 1));
                    const newY = Math.floor(p.constrain(clusterCenter.y + offsetY, 0, GRID.ROWS - 1));
                    gameObjects.push(new GameObject('cooling', newX, newY));
                }
            }
        }
        
        function getSpacedPositions(count, minSpacing, avoidPositions = []) {
            const positions = [];
            const maxAttempts = 100;
            
            for (let i = 0; i < count; i++) {
                let attempts = 0;
                while (attempts < maxAttempts) {
                    const pos = {
                        x: Math.floor(p.random(GRID.COLS)),
                        y: Math.floor(p.random(GRID.ROWS))
                    };
                    
                    // Check spacing with existing positions
                    let tooClose = false;
                    [...positions, ...avoidPositions].forEach(existingPos => {
                        if (Math.abs(existingPos.x - pos.x) < minSpacing && 
                            Math.abs(existingPos.y - pos.y) < minSpacing) {
                            tooClose = true;
                        }
                    });
                    
                    if (!tooClose) {
                        positions.push(pos);
                        break;
                    }
                    attempts++;
                }
            }
            return positions;
        }
        
        function getRandomEmptyPosition() {
            const available = getAvailableGridPositions().filter(pos => {
                return !gameObjects.some(obj => 
                    Math.abs(obj.gridX - pos.x) < 2 && Math.abs(obj.gridY - pos.y) < 2
                );
            });
            return available.length > 0 ? available[Math.floor(p.random(available.length))] : null;
        }
    }

    // Game controls
    document.getElementById('startGameBtn').addEventListener('click', () => {
        initGame();
    });

    // Handle module changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const module1D = document.getElementById('module1D');
                if (!module1D.classList.contains('active')) {
                    gameStarted = false;
                    gameOver = false;
                }
            }
        });
    });

    const module1D = document.getElementById('module1D');
    observer.observe(module1D, { attributes: true });
}

new p5(gameSketch);