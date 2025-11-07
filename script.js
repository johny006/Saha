// قائمة الرموز المتاحة (يمكنك استبدالها بأسماء ملفات صورك لاحقًا)
const symbols = ['7️⃣', '🔔', '🍒', '🍇', '🍋'];
const REEL_COUNT = 5;

let currentBalance = 100.00;
let isSpinning = false; // لمنع النقر المتعدد

// ----------------------------------------------------
// وظائف العرض والتحديث
// ----------------------------------------------------

function updateDisplay() {
    document.getElementById('currentBalance').textContent = currentBalance.toFixed(2);
}

function displayResult(message, isWin = false) {
    const resultElement = document.getElementById('resultMessage');
    resultElement.textContent = message;
    resultElement.style.color = isWin ? '#ffd700' : '#f00'; // أصفر للفوز، أحمر للخسارة
}

// إنشاء البكرات الأولية برموز عشوائية (ثلاثة رموز في كل بكرة)
function initializeReels() {
    for (let i = 1; i <= REEL_COUNT; i++) {
        const reel = document.getElementById(`reel${i}`);
        reel.innerHTML = '';
        for (let j = 0; j < 3; j++) {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'reel-symbol';
            symbolDiv.textContent = randomSymbol;
            reel.appendChild(symbolDiv);
        }
    }
}

// ----------------------------------------------------
// منطق اللعب والدوران
// ----------------------------------------------------

function checkWin(results) {
    // أبسط قاعدة فوز: يجب أن تكون الرموز الثلاثة المركزية متطابقة
    const centerSymbols = results.map(reelSymbols => reelSymbols[1]); 

    // مثال لشرط فوز بسيط: الرموز الخمسة في الوسط متطابقة
    if (centerSymbols.every(symbol => symbol === centerSymbols[0])) {
        return { isWin: true, multiplier: 10 }; // ربح كبير
    }
    
    // مثال لشرط فوز متوسط: الرموز الثلاثة الأولى في الوسط متطابقة
    if (centerSymbols[0] === centerSymbols[1] && centerSymbols[1] === centerSymbols[2]) {
        return { isWin: true, multiplier: 3 }; 
    }
    
    return { isWin: false, multiplier: 0 };
}

function spinReels() {
    if (isSpinning) return;
    
    const betAmount = parseFloat(document.getElementById('betAmount').value);

    // 1. التحقق من الرصيد والرهان
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > currentBalance) {
        displayResult("الرهان غير صحيح أو الرصيد غير كافٍ.", false);
        return;
    }

    isSpinning = true;
    currentBalance -= betAmount;
    updateDisplay();
    displayResult("جاري الدوران...", null);

    const finalResults = [];

    // 2. محاكاة الدوران
    for (let i = 1; i <= REEL_COUNT; i++) {
        // وظيفة محاكاة الدوران (تستبدل لاحقاً بحركة CSS/JS حقيقية)
        setTimeout(() => {
            const reel = document.getElementById(`reel${i}`);
            reel.innerHTML = ''; // تفريغ Reel
            const reelResult = [];
            
            // إضافة 3 رموز عشوائية كنتيجة نهائية
            for (let j = 0; j < 3; j++) {
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'reel-symbol';
                symbolDiv.textContent = randomSymbol;
                reel.appendChild(symbolDiv);
                reelResult.push(randomSymbol);
            }
            finalResults[i - 1] = reelResult;
            
            // 3. التحقق من النتيجة بعد توقف جميع البكرات
            if (finalResults.length === REEL_COUNT && !finalResults.includes(undefined)) {
                isSpinning = false;
                processResult(betAmount, finalResults);
            }

        }, i * 500); // إيقاف كل بكرة بعد 500ms متتابعة
    }
}

function processResult(betAmount, finalResults) {
    const winCheck = checkWin(finalResults);
    
    if (winCheck.isWin) {
        const winnings = betAmount * winCheck.multiplier;
        currentBalance += winnings;
        displayResult(`🎉 فوز! لقد ربحت ${winnings.toFixed(2)} عملة!`, true);
    } else {
        displayResult(`❌ خسارة. حظ أوفر في المرة القادمة.`, false);
    }

    updateDisplay();
    document.getElementById('spinButton').disabled = false;
}


// تشغيل تهيئة البكرات عند تحميل الصفحة
initializeReels();
updateDisplay();
