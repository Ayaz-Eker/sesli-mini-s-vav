const stages = [
  {
    name: "Başlangıç turu",
    tag: "ISINMA",
    questions: [
      { text: "Türkiye'nin başkenti neresidir?", answers: ["ankara"] },
      { text: "Beş çarpı altı kaç eder?", answers: ["30", "otuz"] },
      { text: "Dünya'nın doğal uydusunun adı nedir?", answers: ["ay"] },
      { text: "Bir hafta kaç gündür?", answers: ["7", "yedi"] },
    ],
  },
  {
    name: "Meraklı zihinler",
    tag: "KEŞİF",
    questions: [
      { text: "H₂O hangi maddenin kimyasal formülüdür?", answers: ["su"] },
      { text: "İnsan kalbi kaç odacıktan oluşur?", answers: ["4", "dört"] },
      { text: "Bitkilerin ışıkla besin üretmesine ne denir?", answers: ["fotosentez"] },
      { text: "Dünya'nın etrafında döndüğü yıldızın adı nedir?", answers: ["güneş"] },
    ],
  },
  {
    name: "Kültür durağı",
    tag: "BİLGİ",
    questions: [
      { text: "İstanbul hangi yılda fethedilmiştir?", answers: ["1453", "bin dört yüz elli üç"] },
      { text: "Hamlet oyununun yazarı kimdir?", answers: ["william shakespeare", "shakespeare"] },
      { text: "Japonya'nın başkenti neresidir?", answers: ["tokyo"] },
      { text: "Mona Lisa tablosunu kim yapmıştır?", answers: ["leonardo da vinci", "leonardo"] },
    ],
  },
  {
    name: "Ustalık turu",
    tag: "USTALIK",
    questions: [
      { text: "Dünya'nın en büyük okyanusu hangisidir?", answers: ["pasifik", "pasifik okyanusu"] },
      { text: "Bir bayt kaç bitten oluşur?", answers: ["8", "sekiz"] },
      { text: "Arıların çiçeklerden topladığı sarı toza ne denir?", answers: ["polen"] },
      { text: "Kuzey Kutbu'nda yaşayan büyük beyaz ayının adı nedir?", answers: ["kutup ayısı", "kutup ayisi"] },
    ],
  },
  {
    name: "Büyük final",
    tag: "FİNAL",
    questions: [
      { text: "Kızıl gezegen olarak bilinen gezegen hangisidir?", answers: ["mars"] },
      { text: "Türkiye'nin en yüksek dağı hangisidir?", answers: ["ağrı dağı", "ağrı"] },
      { text: "Bir kilometre kaç metredir?", answers: ["1000", "bin"] },
      { text: "Bir üçgenin iç açılarının toplamı kaç derecedir?", answers: ["180", "yüz seksen"] },
    ],
  },
];

const passMark = 3;
const completed = new Set();
let stageIndex = 0;
let questionIndex = 0;
let score = 0;
let advanceTimer;

const stageRail = document.querySelector("#stageRail");
const stageKicker = document.querySelector("#stageKicker");
const stageTitle = document.querySelector("#stageTitle");
const questionArea = document.querySelector("#questionArea");
const questionForm = document.querySelector("#questionForm");
const questionText = document.querySelector("#questionText");
const questionNumber = document.querySelector("#questionNumber");
const answerInput = document.querySelector("#answerInput");
const submitButton = questionForm.querySelector("button[type='submit']");
const feedback = document.querySelector("#feedback");
const scoreValue = document.querySelector("#scoreValue");
const progressFill = document.querySelector("#progressFill");
const progressTrack = document.querySelector(".progress-track");
const listenButton = document.querySelector("#listenButton");
const stageResult = document.querySelector("#stageResult");
const resultIcon = document.querySelector("#resultIcon");
const resultTitle = document.querySelector("#resultTitle");
const resultText = document.querySelector("#resultText");
const advanceButton = document.querySelector("#advanceButton");

function renderStageRail() {
  stageRail.replaceChildren();
  stages.forEach((stage, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "stage-tab";
    button.setAttribute("aria-label", `${index + 1}. aşamayı seç: ${stage.name}`);
    if (index === stageIndex) button.classList.add("active");
    if (completed.has(index)) button.classList.add("completed");

    const number = document.createElement("span");
    number.className = "stage-number";
    number.textContent = completed.has(index) ? "✓" : String(index + 1);
    const label = document.createElement("span");
    label.className = "stage-tab-label";
    label.textContent = stage.name;
    button.append(number, label);
    button.addEventListener("click", () => loadStage(index));
    stageRail.append(button);
  });
}

function updateProgress(percent) {
  const boundedPercent = Math.max(0, Math.min(100, percent));
  progressFill.style.width = `${boundedPercent}%`;
  progressTrack.setAttribute("aria-valuenow", String(Math.round(boundedPercent)));
}

function currentQuestion() {
  return stages[stageIndex].questions[questionIndex];
}

function showQuestion(shouldSpeak = true) {
  const stage = stages[stageIndex];
  const question = currentQuestion();
  stageKicker.textContent = `AŞAMA ${stageIndex + 1} · ${stage.tag}`;
  stageTitle.textContent = stage.name;
  questionNumber.textContent = `SORU ${questionIndex + 1} / ${stage.questions.length}`;
  questionText.textContent = question.text;
  scoreValue.textContent = String(score);
  answerInput.value = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  submitButton.disabled = false;
  updateProgress((questionIndex / stage.questions.length) * 100);
  if (shouldSpeak) void speak(`Aşama ${stageIndex + 1}. ${question.text}`);
  answerInput.focus();
}

function loadStage(index) {
  window.clearTimeout(advanceTimer);
  stageIndex = index;
  questionIndex = 0;
  score = 0;
  questionArea.hidden = false;
  stageResult.hidden = true;
  renderStageRail();
  showQuestion();
}

function normalizeAnswer(value) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFC")
    .replace(/[.,!?;:]+$/u, "");
}

function finishStage() {
  questionArea.hidden = true;
  stageResult.hidden = false;
  scoreValue.textContent = String(score);
  updateProgress(100);

  const passed = score >= passMark;
  resultIcon.classList.toggle("retry", !passed);
  if (passed) {
    completed.add(stageIndex);
    resultTitle.textContent = "Aşama tamamlandı!";
    resultText.textContent = `${stages[stageIndex].questions.length} soruda ${score} doğru yaptın. Başka bir aşama seçebilir ya da bu aşamayı tekrar edebilirsin.`;
    advanceButton.textContent = "Bu aşamayı tekrar et";
    void speak("Tebrikler! Aşamayı tamamladın. Başka bir aşama seçebilirsin.");
  } else {
    resultTitle.textContent = "Bir kez daha deneyelim.";
    resultText.textContent = `Geçmek için en az ${passMark} doğru gerekiyordu. Bu turda ${score} doğru yaptın. Başka bir aşama seçebilir ya da tekrar deneyebilirsin.`;
    advanceButton.textContent = "Bu aşamayı tekrar et";
    void speak(`Bu aşamayı geçmek için ${passMark} doğru cevap gerekiyor. Başka bir aşama seçebilir ya da tekrar deneyebilirsin.`);
  }
  renderStageRail();
}

function speakInBrowser(text) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    window.speechSynthesis.speak(utterance);
  }
}

async function speak(text) {
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (!isLocal) {
    speakInBrowser(text);
    return;
  }

  try {
    const response = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error("Yerel ses motoru kullanılamıyor.");
  } catch {
    speakInBrowser(text);
  }
}

questionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = normalizeAnswer(answerInput.value);
  if (!answer) {
    feedback.textContent = "Devam etmek için önce cevabını yaz.";
    answerInput.focus();
    return;
  }

  submitButton.disabled = true;
  const question = currentQuestion();
  const isCorrect = question.answers.some((acceptedAnswer) => normalizeAnswer(acceptedAnswer) === answer);
  if (isCorrect) {
    score += 1;
    feedback.textContent = "Bildin! Güzel gidiyorsun.";
    feedback.classList.add("correct");
    void speak("Doğru cevap!");
  } else {
    feedback.textContent = `Bu kez olmadı. Doğru cevap: ${question.answers[0]}`;
    feedback.classList.add("incorrect");
    void speak(`Yanlış cevap. Doğru cevap ${question.answers[0]}.`);
  }
  scoreValue.textContent = String(score);

  advanceTimer = window.setTimeout(() => {
    questionIndex += 1;
    if (questionIndex < stages[stageIndex].questions.length) {
      showQuestion();
    } else {
      finishStage();
    }
  }, 1200);
});

listenButton.addEventListener("click", () => void speak(currentQuestion().text));

advanceButton.addEventListener("click", () => {
  loadStage(stageIndex);
});

renderStageRail();
loadStage(0);
