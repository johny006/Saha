// قائمة الرموز المتاحة (يجب أن تكون أسماء ملفات الصور لديك)
const symbols = [
    { name: 'Seven', file: 'symbol_7.png' },
    { name: 'Bell', file: 'symbol_bell.png' },
    { name: 'Cherry', file: 'symbol_cherry.png' },
    { name: 'Grape', file: 'symbol_grape.png' },
    { name: 'Lemon', file: 'symbol_lemon.png' }
];

const REEL_COUNT = 5;
const SPIN_DURATION = 1500; // مدة الدوران بالمللي ثانية

let currentBalance = 100.00;
let currentBet = 10.00;
let isSpinning = false;

// تحديث الرصيد والرهان في الواجهة
function updateDisplay() {
    document.getElementById('balanceAmount').textContent = currentBalance.toFixed(2);
    document.getElementById('currentBet').textContent = currentBet.toFixed(2);
}

// تهيئة البكرات بالرموز العشوائية
function initializeReels() {
    for (let i = 1; i <= REEL_COUNT; i++) {
        const reel = document.getElementById(`reel${i}`);
        reel.innerHTML = '';
        for (let j = 0; j < 3; j++) {
            // اختيار رمز عشوائي
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'reel-symbol';
            
            // إضافة عنصر الصورة (<img>)
            const img = document.createElement('img');
            img.src = randomSymbol.file; // استخدام اسم ملف الصورة
            img.alt = randomSymbol.name;
            
            symbolDiv.appendChild(img);
            reel.appendChild(symbolDiv);
        }
    }
}

// دالة الدوران الرئيسية
function spinReels() {
    if (isSpinning || currentBalance < currentBet) {
        if (currentBalance < currentBet) {
            document.getElementById('message').textContent = 'الرصيد غير كافٍ!';
        }
        return;
    }

    isSpinning = true;
    document.getElementById('spinButton').disabled = true;
    document.getElementById('message').textContent = 'جاري الدوران...';
    
    currentBalance -= currentBet;
    updateDisplay();

    const reelElements = [];
    const promises = [];
    const finalResults = [];

    for (let i = 1; i <= REEL_COUNT; i++) {
        const reel = document.getElementById(`reel${i}`);
        reelElements.push(reel);
        promises.push(new Promise(resolve => {
            
            // إنشاء تسلسل عشوائي للرموز
            let reelSymbols = [];
            for(let k = 0; k < 20 + (i * 3); k++) { // طول دوران مختلف لكل بكرة
                reelSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
            }
            
            // إضافة النتيجة النهائية العشوائية
            const finalResult = symbols[Math.floor(Math.random() * symbols.length)];
            reelSymbols.push(finalResult);
            finalResults.push(finalResult);

            reel.innerHTML = ''; // تفريغ البكرة
            
            // إضافة الرموز الجديدة (بما فيها النتيجة النهائية)
            reelSymbols.forEach(symbol => {
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'reel-symbol';
                const img = document.createElement('img');
                img.src = symbol.file;
                img.alt = symbol.name;
                symbolDiv.appendChild(img);
                reel.appendChild(symbolDiv);
            });

            // تطبيق الحركة (التحريك)
            const symbolHeight = reel.querySelector('.reel-symbol').offsetHeight || 80; // افتراض ارتفاع 80
            const finalPosition = (reelSymbols.length - 2) * symbolHeight;

            reel.style.transition = `transform ${SPIN_DURATION + (i * 200)}ms ease-out`;
            reel.style.transform = `translateY(-${finalPosition}px)`;

            setTimeout(() => {
                resolve();
            }, SPIN_DURATION + (i * 200));

        }));
    }

    // بعد انتهاء جميع البكرات من الدوران
    Promise.all(promises).then(() => {
        isSpinning = false;
        document.getElementById('spinButton').disabled = false;
        
        // جلب أسماء الرموز النهائية للتحقق من الفوز
        const centerSymbols = finalResults;
        const { isWin, multiplier } = checkWin(centerSymbols);
        
        let message = 'جولة جديدة!';
        if (isWin) {
            const winnings = currentBet * multiplier;
            currentBalance += winnings;
            message = `🎉 فزت! ربحت: ${winnings.toFixed(2)}$`;
        } else {
            message = 'حظ أوفر في المرة القادمة!';
        }
        
        document.getElementById('message').textContent = message;
        updateDisplay();
        
        // إزالة الحركة لإعادة التعيين
        reelElements.forEach(reel => {
            reel.style.transition = 'none';
            reel.style.transform = 'translateY(0)';
        });
        
        // إعادة تهيئة البكرات لعرض 3 رموز فقط (التي توقفت عندها)
        displayFinalResults(finalResults);
    });
}

// عرض النتيجة النهائية بثلاثة رموز فقط
function displayFinalResults(finalResults) {
    for (let i = 0; i < REEL_COUNT; i++) {
        const reel = document.getElementById(`reel${i + 1}`);
        reel.innerHTML = '';
        
        // عرض الرمز قبل الأخير (للتوقف على الرمز الأوسط)
        const topSymbolIndex = Math.floor(Math.random() * symbols.length); 
        
        // ترتيب الرموز بعد التوقف: [رمز عشوائي1، رمز الفائز، رمز عشوائي2]
        const symbolOrder = [
            symbols[topSymbolIndex],
            finalResults[i],
            symbols[(topSymbolIndex + 1) % symbols.length]
        ];
        
        symbolOrder.forEach(symbol => {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'reel-symbol';
            const img = document.createElement('img');
            img.src = symbol.file;
            img.alt = symbol.name;
            symbolDiv.appendChild(img);
            reel.appendChild(symbolDiv);
        });
    }
}

// دالة التحقق من الفوز
function checkWin(results) {
    // شرط الفوز البسيط: تطابق الرموز الخمسة
    const centerSymbolName = results[0].name;
    if (results.every(symbol => symbol.name === centerSymbolName)) {
        return { isWin: true, multiplier: 50 }; // فوز كبير!
    }
    
    // شرط فوز: تطابق الرموز الأربعة الأولى
    if (results[0].name === results[1].name && results[1].name === results[2].name && results[2].name === results[3].name) {
        return { isWin: true, multiplier: 10 };
    }
    
    // شرط فوز: تطابق الرموز الثلاثة الأولى
    if (results[0].name === results[1].name && results[1].name === results[2].name) {
        return { isWin: true, multiplier: 5 };
    }
    
    return { isWin: false, multiplier: 0 };
}

// تعديل قيمة الرهان
function adjustBet(amount) {
    if (isSpinning) return;
    let newBet = currentBet + amount;
    // حدود الرهان: لا يقل عن 1$، لا يزيد عن 50$ أو الرصيد المتاح
    if (newBet >= 1.00 && newBet <= currentBalance && newBet <= 50.00) {
        currentBet = newBet;
        updateDisplay();
    }
}

// تعيين الرهان الأقصى
function setBetMax() {
    if (isSpinning) return;
    currentBet = Math.min(50.00, currentBalance); // الرهان الأقصى 50 أو الرصيد المتبقي
    updateDisplay();
}

// تهيئة اللعبة عند التحميل
window.onload = () => {
    initializeReels();
    updateDisplay();
};
