const chatLog = document.getElementById("chat-log");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const recordButton = document.createElement('button'); // Botón para grabar voz

recordButton.textContent = 'Grabar';
document.getElementById('input-container').appendChild(recordButton); // Añade el botón a input-container
let recognition;

if ('webkitSpeechRecognition' in window) { // WebKit (Chrome, etc)
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'es-ES'; // idioma
    recognition.continuous = false; // Una sola toma
} else if ('SpeechRecognition' in window) {
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES'; // idioma
    recognition.continuous = false; // Una sola toma
} else {
    console.log("Speech recognition is not available in your browser.");
    recordButton.disabled = true;
    recordButton.textContent = "No soportado";
}

if(recognition){
  recognition.onstart = () => {
      console.log('Grabación iniciada');
      recordButton.textContent = 'Grabando...';
  };

  recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Transcripción:', transcript);
      userInput.value = transcript;
      sendMessage(); // Envía el mensaje
      recordButton.textContent = 'Grabar';
    };

  recognition.onerror = (event) => {
      console.error('Error de grabación:', event.error);
      recordButton.textContent = 'Grabar';
  };

  recognition.onend = () => {
    recordButton.textContent = 'Grabar';
  };

}

recordButton.addEventListener('click', () => {
    if (recognition) {
        recognition.start();
        recordButton.textContent = 'Grabando...';
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addUserMessage(message);
    userInput.value = "";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
        });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const botResponse = data.response;
        addBotMessage(botResponse);
        speakText(botResponse);

    } catch (error) {
        console.error("Error al enviar mensaje:", error);
        addBotMessage("Error al procesar tu mensaje.");
    }
}

function addUserMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "user-message");
    messageDiv.textContent = message;
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function addBotMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "bot-message");
    messageDiv.textContent = message;
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

async function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  } else {
    console.log("Tu navegador no soporta la síntesis de voz.");
  }
}

sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});