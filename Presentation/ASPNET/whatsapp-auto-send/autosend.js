console.log("WhatsApp Auto Send extension loaded");

function autoClickSend() {
    // Ensure the chat box is ready before trying to send
    const textBox = document.querySelector('[contenteditable="true"][data-tab]');
    if (!textBox) {
        console.log("⏳ Waiting for chat text box...");
        return setTimeout(autoClickSend, 1000);
    }

    // The new WhatsApp layout has "aria-label='Send'" and "role='button'"
    const sendButton = document.querySelector('div[role="button"][aria-label="Send"]');

    if (sendButton) {
        console.log("✅ Send button found, clicking now...");
        sendButton.click();
    } else {
        console.log("⏳ Send button not yet visible, retrying...");
        setTimeout(autoClickSend, 1000);
    }
}

// Wait for full UI load before running
window.addEventListener("load", () => {
    console.log("⏳ Waiting for WhatsApp Web to initialize...");
    setTimeout(autoClickSend, 4000);
});
