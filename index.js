// Track initialization states
let cameraReady = false;
let modelReady = false;
const loadingStatus = document.querySelector('.loading-status');
const loadingProgress = document.querySelector('.loading-progress');
let currentUnit = 1;
let currentLesson = 'A';
let lastNavigationTime = 0;
const COOLDOWN_MS = 2000;

function updateLoadingStatus() {
    if (!cameraReady) {
        loadingStatus.textContent = 'Khởi động camera...';
        loadingProgress.textContent = 'Initializing camera...';
    } else if (!modelReady) {
        loadingStatus.textContent = 'Khởi tạo trình nhận diện khuôn mặt...';
        loadingProgress.textContent = 'Loading detection model...';
    }
}

function hideLoadingScreen() {
    if (cameraReady && modelReady) {
        document.getElementById('loading-screen').classList.add('hide-loading');
        document.getElementById('home-page').classList.add('active');
        setTimeout(() => {
            document.querySelector('.main-content').classList.add('show-content');
        }, 100);
    }
}

// Button event listeners
document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('home-page').classList.remove('active');
    document.getElementById('module-select').classList.add('active');
});

document.querySelectorAll('.module-btn').forEach(button => {
    button.addEventListener('click', () => {
        const moduleNum = parseInt(button.dataset.module);
        document.getElementById('module-select').classList.remove('active');
        currentUnit = moduleNum;
        currentLesson = 'A';
        updateActiveModule(currentUnit, currentLesson);
        updateNavigationDisplay();
    });
});

function returnToHome() {
    document.querySelectorAll('.module-container').forEach(module => {
        module.classList.remove('active');
    });
    document.getElementById('home-page').classList.add('active');
}


let detector;
let video;
let debugView = false;
let canvas;

const lessons = {
    1: {
        name: "Tránh Voi Chẳng Xấu Mặt Nào",
        englishName: "Being Smart About Sun",
        lessons: {
            A: {
                vietnamese: "Sáng sớm tinh mơ",
                english: "Morning Protocol"
            },
            B: {
                vietnamese: "Nắng thiêu nắng đốt",
                english: "High Risk Hours"
            },
            C: {
                vietnamese: "Đêm khuya thanh vắng",
                english: "Evening Activities"
            },
            D: {
                vietnamese: "Tránh Voi Tránh Nắng",
                english: "Smart Protection Game"
            }
        }
    },
    2: {
        name: "Nước Nổi Thì Thuyền Lên",
        englishName: "Rising With The Waters",
        lessons: {
            A: {
                vietnamese: "Thuận nước xuôi dòng",
                english: "Rainy Season Navigation"
            },
            B: {
                vietnamese: "Biết nước biết cạn",
                english: "Water Safety System"
            }
        }
    },
    3: {
        name: "Trong Ấm Ngoài Êm",
        englishName: "Balancing Indoor and Outdoor Life",
        lessons: {
            A: {
                vietnamese: "Ở bầu thì tròn, ở ống thì dài",
                english: "Temperature Transition Game"
            },
            B: {
                vietnamese: "Biết người biết ta",
                english: "Smart Space Navigation"
            },
            C: {
                vietnamese: "Đường đường chính chính",
                english: "Practice Activities"
            }
        }
    }
};

let cameraCanvas; 
let gameCanvas;  

let cameraSketch = function(p) {
    let video;
    let detector;
    let predictions = [];
    let debugView = false;

    p.setup = async function() {
        updateLoadingStatus();
        
        const canvas = p.createCanvas(240, 180);
        canvas.parent('canvas-container');
        
        try {
            video = p.createCapture(p.VIDEO, () => {
                console.log('Camera initialized');
                cameraReady = true;
                updateLoadingStatus();
                hideLoadingScreen();
            });
            video.size(240, 180);
            video.hide();
        } catch (error) {
            console.error('Camera initialization failed:', error);
            loadingStatus.textContent = 'Lỗi camera!';
            loadingProgress.textContent = 'Camera initialization failed. Please refresh.';
            return;
        }

        try {
            detector = await faceLandmarksDetection.createDetector(
                faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
                {
                    runtime: 'tfjs',
                    refineLandmarks: true,
                    maxFaces: 1
                }
            );
            console.log('Model loaded');
            modelReady = true;
            updateLoadingStatus();
            hideLoadingScreen();
        } catch (error) {
            console.error('Model initialization failed:', error);
            loadingStatus.textContent = 'Lỗi tải mô hình!';
            loadingProgress.textContent = 'Model initialization failed. Please refresh.';
            return;
        }

        updateNavigationDisplay();
    }


    p.draw = function() {
        if (debugView) {
            p.clear();
            p.push();
            p.translate(p.width, 0);
            p.scale(-1, 1);
            p.image(video, 0, 0, p.width, p.height);
            
            if (predictions.length > 0) {
                const nose = predictions[0].keypoints[1];
                const mirroredX = p.width - nose.x;
                p.stroke(0, 0, 0, 0);
                p.fill(255, 255, 255, 100);
                p.ellipse(mirroredX, nose.y, 10);
            }
            p.pop();
        }
        detectFace();
    }

    async function detectFace() {
        if (detector && video.elt.readyState === 4) {
            predictions = await detector.estimateFaces(video.elt);
            
            if (predictions.length > 0 && p.keyIsDown(p.SHIFT)) {
                const nose = predictions[0].keypoints[1];
                const currentTime = p.millis();
    
                if (currentTime - lastNavigationTime > COOLDOWN_MS) {
                    if (nose.x < video.width * 0.4) {
                        navigateLesson(1);
                        lastNavigationTime = currentTime;
                    } else if (nose.x > video.width * 0.6) {
                        navigateLesson(-1);
                        lastNavigationTime = currentTime;
                    } else if (nose.y < video.height * 0.4) {
                        navigateUnit(1);
                        lastNavigationTime = currentTime;
                    } else if (nose.y > video.height * 0.6) {
                        navigateUnit(-1);
                        lastNavigationTime = currentTime;
                    }
                }
            }
        }
    }

    window.toggleDebug = function() {
        debugView = !debugView;
        const container = document.getElementById('canvas-container');
        container.style.display = debugView ? 'block' : 'none';
    }
};

new p5(cameraSketch);

// Module navigation functions

function updateActiveModule(unit, lesson) {
    document.querySelectorAll('.module-container').forEach(module => {
        module.classList.remove('active');
    });

    const moduleId = `module${unit}${lesson}`;
    const currentModule = document.getElementById(moduleId);
    if (currentModule) {
        currentModule.classList.add('active');
        
        const titleElement = currentModule.querySelector('.module-title');
        if (titleElement) {
            const currentModuleData = lessons[unit];
            const currentLessonData = currentModuleData.lessons[lesson];
            titleElement.innerHTML = `
                <div class="module-number">Module ${unit} - Lesson ${lesson}</div>
                <div class="title-vietnamese">${currentLessonData.vietnamese}</div>
                <div class="title-english">${currentLessonData.english}</div>
            `;
        }
    }
}

function updateNavigationDisplay() {
    const moduleTitle = document.getElementById('module-title');
    if (moduleTitle) {
        const currentModuleData = lessons[currentUnit];
        moduleTitle.innerHTML = `
            <div class="module-number">Module ${currentUnit}</div>
            <div class="title-vietnamese">${currentModuleData.name}</div>
            <div class="title-english">${currentModuleData.englishName}</div>
        `;
    }
}

function getAllLessonIds() {
    const allLessons = [

        { unit: 1, lesson: 'A' },
        { unit: 1, lesson: 'B' },
        { unit: 1, lesson: 'C' },
        { unit: 1, lesson: 'D' },

        { unit: 2, lesson: 'A' },
        { unit: 2, lesson: 'B' },

        { unit: 3, lesson: 'A' },
        { unit: 3, lesson: 'B' },
        { unit: 3, lesson: 'C' }
    ];
    
    console.log('Available sequence:', allLessons.map(item => `${item.unit}${item.lesson}`).join(' → '));
    return allLessons;
}

function getCurrentIndex() {
    const allLessons = getAllLessonIds();
    const currentIdx = allLessons.findIndex(item => 
        item.unit === currentUnit && item.lesson === currentLesson
    );
    console.log(`Current position: ${currentUnit}${currentLesson} (index: ${currentIdx})`);
    return currentIdx;
}

function navigateLesson(direction) {
    console.log(`\nNavigating lesson: direction ${direction}`);
    const allLessons = getAllLessonIds();
    const currentIdx = getCurrentIndex();
    console.log('Starting from index:', currentIdx);
    
    const newIdx = (currentIdx + direction + allLessons.length) % allLessons.length;
    console.log('New index:', newIdx);
    
    const newLocation = allLessons[newIdx];
    console.log(`Attempting to navigate to: ${newLocation.unit}${newLocation.lesson}`);
    
    if (newLocation.unit !== currentUnit || newLocation.lesson !== currentLesson) {
        currentUnit = newLocation.unit;
        currentLesson = newLocation.lesson;
        console.log(`Navigation successful: Now at ${currentUnit}${currentLesson}`);
        updateActiveModule(currentUnit, currentLesson);
        updateNavigationDisplay();
    } else {
        console.log('No navigation needed - already at target location');
    }
}

function navigateUnit(direction) {
    const allLessons = getAllLessonIds();
    const currentIdx = getCurrentIndex();
    
    const currentUnitIndex = currentUnit - 1; // Convert to 0-based index
    let targetUnitIndex = (currentUnitIndex + direction + 3) % 3; // 3 units total
    if (targetUnitIndex < 0) targetUnitIndex = 2;
    
    const unitStartIndices = [0, 4, 6]; 
    const newIdx = unitStartIndices[targetUnitIndex];
    
    const newLocation = allLessons[newIdx];
    
    if (newLocation.unit !== currentUnit || newLocation.lesson !== currentLesson) {
        currentUnit = newLocation.unit;
        currentLesson = newLocation.lesson;
        updateActiveModule(currentUnit, currentLesson);
        updateNavigationDisplay();
    }
}

// Debug function to show the current state
function debugState() {
    console.log('\n=== Navigation State ===');
    const allLessons = getAllLessonIds();
    console.log('Current location:', `${currentUnit}${currentLesson}`);
    console.log('All possible locations:', allLessons.map(item => `${item.unit}${item.lesson}`));
    console.log('Current index:', getCurrentIndex());
    console.log('=====================\n');
}


document.addEventListener('keydown', (e) => {
    if (document.getElementById('home-page').classList.contains('active')) {
        return;
    }
    
    switch(e.key) {
        case 'ArrowLeft':
            navigateLesson(-1);
            break;
        case 'ArrowRight':
            navigateLesson(1);
            break;
        case 'ArrowUp':
            navigateUnit(-1);
            break;
        case 'ArrowDown':
            navigateUnit(1);
            break;
        case 'Escape':
            returnToHome();
            break;
    }
});

// Camera permissions check
navigator.mediaDevices.getUserMedia({ video: true })
.catch(error => {
    console.error('Camera permission denied:', error);
    loadingStatus.textContent = 'Không có quyền truy cập camera!';
    loadingProgress.textContent = 'Camera access denied. Please allow camera access and refresh.';
});

// Debug function to show available navigation paths
function debugNavigation() {
    const allLessons = getAllLessonIds();
    console.log('Available Navigation Paths:');
    allLessons.forEach((item, idx) => {
        console.log(`Position ${idx}: Module ${item.unit}${item.lesson}`);
    });
}


