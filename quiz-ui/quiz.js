// ✅ API URL
const TRIVIA_API_URL = 'https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple';

// ✅ DOM Elements
const quizBox = document.getElementById("quiz-box");
const questionNumber = document.getElementById("question-number");
const questionText = document.getElementById("question-text");
const timerDisplay = document.getElementById("time-left");
const choiceContainer = document.getElementById("choices-container");
const nextBtn = document.getElementById("next-btn");
const loader = document.getElementById("loader");
const highScoreContainer = document.getElementById("high-score-container");
const playAgainBtn = document.getElementById("play-again-btn");
const scoreContainer = document.getElementById("score-container");
const scoreText = document.getElementById("score");
const totalText = document.getElementById("total");

let currentQuestion = 0;
let questions = [];
let score = 0;
let timer;
let timeLeft = 10;

// ✅ Fetch questions
async function fetchQuestions() {
    try {
        loader.style.display = "block";
        quizBox.style.display = "none";
        scoreContainer.style.display = "none";
        highScoreContainer.style.display = "none";

        const response = await fetch(TRIVIA_API_URL);
        const data = await response.json();
        questions = data.results;

        if (!questions || questions.length === 0) throw new Error("No questions received");

        score = 0;
        currentQuestion = 0;
        nextBtn.style.display = "inline-block";
        playAgainBtn.style.display = "none";

        loader.style.display = "none";
        quizBox.style.display = "block";

        loadQuestion();
    } catch (error) {
        console.error("Error fetching questions:", error);
        questionText.innerText = "❌ Failed to load questions. Please try again later.";
    }
}

// ✅ Load question
function loadQuestion() {
    clearInterval(timer);
    timeLeft = 10;
    timerDisplay.innerText = timeLeft;
    timer = setInterval(updateTimer, 1000);

    const question = questions[currentQuestion];
    questionText.innerHTML = decodeHTML(question.question);
    questionNumber.innerText = `Question ${currentQuestion + 1} of ${questions.length}`;

    choiceContainer.innerHTML = '';
    nextBtn.disabled = true;

    const choices = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('choice');
        button.innerHTML = decodeHTML(choice);
        button.addEventListener('click', () => selectAnswer(button, question.correct_answer));
        choiceContainer.appendChild(button);
    });
}

// ✅ Select answer
function selectAnswer(button, correctAnswer) {
    const allButtons = document.querySelectorAll('.choice');
    allButtons.forEach(btn => btn.disabled = true);

    const userAnswer = button.innerText;
    if (userAnswer === decodeHTML(correctAnswer)) {
        button.classList.add('correct');
        score++;
    } else {
        button.classList.add('incorrect');
        const correctBtn = Array.from(allButtons).find(b => b.innerText === decodeHTML(correctAnswer));
        if (correctBtn) correctBtn.classList.add('correct');
    }

    nextBtn.disabled = false;
    clearInterval(timer);
}

// ✅ Timer
function updateTimer() {
    timeLeft--;
    timerDisplay.innerText = timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timer);
        nextBtn.disabled = false;
    }
}

// ✅ Next question
nextBtn.addEventListener('click', () => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
});

// ✅ End quiz
function endQuiz() {
    clearInterval(timer);
    questionText.innerText = "🎉 Quiz Complete!";
    questionNumber.innerText = "All Questions Answered!";
    choiceContainer.innerHTML = '';
    nextBtn.style.display = "none";

    scoreContainer.style.display = "block";
    scoreText.innerText = score;
    totalText.innerText = questions.length;

    setTimeout(async () => {
        const playerName = prompt("Enter your name for the leaderboard:");
        if (playerName) {
            await saveHighScore(playerName, score);
        }
        showHighScores();
    }, 300);
}

// ✅ Retry quiz
playAgainBtn.addEventListener('click', () => {
    fetchQuestions();
});

// ✅ Save high score to Pantry API (with fallback to localStorage)
async function saveHighScore(name, score) {
    const scoreData = {
        name,
        score,
        date: new Date().toLocaleDateString()
    };

    try {
        const response = await fetch('/save-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scoreData)
        });
        const result = await response.json();
        console.log('Score saved to Pantry:', result);
    } catch (error) {
        console.error('Error saving score online. Using localStorage instead:', error);
        const storedScores = JSON.parse(localStorage.getItem("quizHighScores")) || [];
        storedScores.push(scoreData);
        storedScores.sort((a, b) => b.score - a.score);
        localStorage.setItem("quizHighScores", JSON.stringify(storedScores.slice(0, 5)));
    }
}

// ✅ Show high scores from Pantry API (fallback to localStorage)
async function showHighScores() {
    try {
        const response = await fetch('/get-scores');
        const scores = await response.json();

        if (!scores || scores.length === 0) {
            highScoreContainer.innerHTML = "<h2>No high scores yet!</h2>";
        } else {
            let html = `
            <h2>🏆 High Scores</h2>
            <table>
              <tr><th>Name</th><th>Score</th><th>Date</th></tr>
              ${scores.map(s => `<tr><td>${s.name}</td><td>${s.score}</td><td>${s.date}</td></tr>`).join("")}
            </table>`;
            highScoreContainer.innerHTML = html;
        }
    } catch (error) {
        console.error('Error fetching high scores. Using localStorage instead:', error);
        const scores = JSON.parse(localStorage.getItem("quizHighScores")) || [];
        if (scores.length === 0) highScoreContainer.innerHTML = "<h2>No high scores yet!</h2>";
        else {
            let html = `
            <h2>🏆 High Scores</h2>
            <table>
              <tr><th>Name</th><th>Score</th><th>Date</th></tr>
              ${scores.map(s => `<tr><td>${s.name}</td><td>${s.score}</td><td>${s.date}</td></tr>`).join("")}
            </table>`;
            highScoreContainer.innerHTML = html;
        }
    }

    highScoreContainer.style.display = "block";
    playAgainBtn.style.display = "inline-block";
}

// ✅ Decode HTML entities from API
function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// ✅ Init
document.addEventListener('DOMContentLoaded', fetchQuestions);
