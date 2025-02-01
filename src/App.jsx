import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [quizStatus, setQuizStatus] = useState("init");
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [currentUser] = useState("vikasyadav01234");
  const [startTime] = useState("2025-02-01 10:16:58");
  const [score, setScore] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });

  // Timer format helper function
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Timer Display Component
  const TimerDisplay = ({ seconds }) => {
    return (
      <div className="fixed top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-center">
          <p className="text-sm text-gray-500">Time Remaining</p>
          <p className={`text-2xl font-bold ${seconds <= 60 ? 'text-red-500 timer-warning' : 'text-blue-500'}`}>
            {formatTime(seconds)}
          </p>
        </div>
      </div>
    );
  };

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "https://cors.smashystream.workers.dev/?destination=https://api.jsonserve.com/Uw5CrX"
      );
      const data = await response.json();
      setData(data);
      setQuestions(data?.questions);
    })();
  }, []);

  // Timer Effect
  useEffect(() => {
    let timerInterval;

    if (timerActive && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            setTimerActive(false);
            const finalScore = calculateScore(selectedAnswers);
            setScore(finalScore);
            setQuizStatus("end");
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerActive, timeLeft]);

  const calculateScore = (answers) => {
    let correct = 0;
    let incorrect = 0;

    Object.entries(answers).forEach(([questionIndex, selectedOptionId]) => {
      const question = questions[questionIndex];
      const selectedOption = question.options.find(
        (opt) => opt.id === selectedOptionId
      );

      if (selectedOption?.is_correct) {
        correct += parseFloat(data.correct_answer_marks);
      } else {
        incorrect += parseFloat(data.negative_marks);
      }
    });

    return {
      correct,
      incorrect,
      total: correct - incorrect,
    };
  };

  const handleAnswerSelect = (optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [activeQuestion]: optionId,
    });
  };

  const handleNext = () => {
    if (selectedAnswers[activeQuestion]) {
      setActiveQuestion(activeQuestion + 1);
    }
  };

  const handleEndQuiz = () => {
    if (selectedAnswers[activeQuestion]) {
      setTimerActive(false);
      const finalScore = calculateScore(selectedAnswers);
      setScore(finalScore);
      setQuizStatus("end");
    }
  };

  const handleStartQuiz = () => {
    setQuizStatus("start");
    setActiveQuestion(0);
    setSelectedAnswers({});
    setScore({ correct: 0, incorrect: 0, total: 0 });
    setTimeLeft(data.duration * 60);
    setTimerActive(true);
  };

  // Start Screen
  if (quizStatus === "init") {
    return (
      <main className="p-4 max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">{data.title || "Quiz App"}</h1>
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
            <div className="space-y-2">
              <p className="text-xl font-semibold">{data.topic}</p>
              <p className="text-gray-600">Total Questions: {questions.length}</p>
              <p className="text-gray-600">Duration: {data.duration} minutes</p>
              <p className="text-sm text-gray-500">User: {currentUser}</p>
              <p className="text-sm text-gray-500">Started at: {startTime}</p>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Correct Answer: +{data.correct_answer_marks} marks</p>
              <p>Negative Marking: -{data.negative_marks} marks</p>
            </div>
            <button
              onClick={handleStartQuiz}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Results Screen
  if (quizStatus === "end") {
    const answeredQuestions = Object.keys(selectedAnswers).length;
    const correctAnswers = questions.filter(
      (q, index) =>
        q.options.find((opt) => opt.id === selectedAnswers[index])?.is_correct
    ).length;

    return (
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
        <div className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-4">
            <p>User: {currentUser}</p>
            <p>Completed at: {new Date().toISOString().slice(0, 19).replace('T', ' ')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-100 p-4 rounded">
              <h3 className="font-semibold">Correct Answers</h3>
              <p className="text-2xl text-green-600">{correctAnswers}</p>
            </div>
            <div className="bg-red-100 p-4 rounded">
              <h3 className="font-semibold">Incorrect Answers</h3>
              <p className="text-2xl text-red-600">
                {answeredQuestions - correctAnswers}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Final Score</h3>
            <div className="bg-blue-100 p-4 rounded">
              <p className="text-2xl text-blue-600">
                {score.total.toFixed(1)} points
              </p>
              <p className="text-sm text-gray-600">
                (Correct: +{score.correct.toFixed(1)} | Incorrect: -
                {score.incorrect.toFixed(1)})
              </p>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
          >
            Restart Quiz
          </button>
        </div>
      </main>
    );
  }

  // Quiz Screen
  return (
    <main className="p-4 max-w-2xl mx-auto">
      {/* Timer Display */}
      {quizStatus === "start" && timeLeft > 0 && (
        <TimerDisplay seconds={timeLeft} />
      )}

      <h1 className="text-2xl font-bold mb-4">{data.title || "Quiz App"}</h1>
      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Question {activeQuestion + 1} of {questions.length}
            </p>
            <p className="text-sm text-gray-500">
              User: {currentUser}
            </p>
          </div>

          <h2 className="text-xl mb-4">
            {questions[activeQuestion]?.description}
          </h2>

          <div className="space-y-2">
            {questions[activeQuestion]?.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={option.id}
                  name={`question-${activeQuestion}`}
                  checked={selectedAnswers[activeQuestion] === option.id}
                  onChange={() => handleAnswerSelect(option.id)}
                  className="h-4 w-4"
                />
                <label htmlFor={option.id} className="text-lg">
                  {option.description}
                </label>
              </div>
            ))}
          </div>

          {activeQuestion < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!selectedAnswers[activeQuestion]}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed mt-4"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleEndQuiz}
              disabled={!selectedAnswers[activeQuestion]}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed mt-4"
            >
              Finish Quiz
            </button>
          )}
        </div>
      )}
    </main>
  );
}

export default App;