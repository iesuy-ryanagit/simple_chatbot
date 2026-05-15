package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"sync"
	"time"
)

type ChatRequest struct {
	SessionID string `json:"session_id"`
	Message   string `json:"message"`
}

type ChatResponse struct {
	Reply string `json:"reply"`
}

type HFChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type HFChatRequest struct {
	Messages []HFChatMessage `json:"messages"`
	Model    string          `json:"model"`
}

type HFChatCompletionChoice struct {
	Message struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"message"`
}

type HFChatCompletionResponse struct {
	Choices []HFChatCompletionChoice `json:"choices"`
}

var (
	HF_API_TOKEN = os.Getenv("API_KEY")
	HF_API_URL   = "https://router.huggingface.co/novita/v3/openai/chat/completions"
	HF_MODEL     = "deepseek/deepseek-v3-0324"
	ALLOW_ORIGIN = os.Getenv("FRONTEND_URL")
)

// 会話履歴保存
var (
	conversationStore = map[string][]HFChatMessage{}
	storeMutex        sync.Mutex
)

func chatHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Access-Control-Allow-Origin", ALLOW_ORIGIN)
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	if req.SessionID == "" {
		http.Error(w, "session_id is required", http.StatusBadRequest)
		return
	}

	// =========================
	// 🔥 完全ロックで履歴処理
	// =========================
	storeMutex.Lock()

	history := conversationStore[req.SessionID]

	// user追加
	history = append(history, HFChatMessage{
		Role:    "user",
		Content: req.Message,
	})

	// 長さ制限（軽くする）
	if len(history) > 10 {
		history = history[len(history)-10:]
	}

	conversationStore[req.SessionID] = history

	// =========================
	// HF API
	// =========================
	hfReq := HFChatRequest{
		Model:    HF_MODEL,
		Messages: history,
	}

	jsonBody, err := json.Marshal(hfReq)
	if err != nil {
		http.Error(w, "marshal error", http.StatusInternalServerError)
		return
	}

	httpReq, _ := http.NewRequest("POST", HF_API_URL, bytes.NewBuffer(jsonBody))
	httpReq.Header.Set("Authorization", "Bearer "+HF_API_TOKEN)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}

	resp, err := client.Do(httpReq)
	if err != nil {
		http.Error(w, "HF request failed", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		log.Println("HF ERROR:", string(body))
		http.Error(w, "HF API error", resp.StatusCode)
		return
	}

	var hfResp HFChatCompletionResponse
	if err := json.Unmarshal(body, &hfResp); err != nil {
		http.Error(w, "parse error", http.StatusInternalServerError)
		return
	}

	reply := "no response"
	if len(hfResp.Choices) > 0 {
		reply = hfResp.Choices[0].Message.Content
	}

	history = conversationStore[req.SessionID]

	history = append(history, HFChatMessage{
		Role:    "assistant",
		Content: reply,
	})

	conversationStore[req.SessionID] = history

	storeMutex.Unlock()

	json.NewEncoder(w).Encode(ChatResponse{Reply: reply})
}

func main() {

	if HF_API_TOKEN == "" {
		log.Fatal("API_KEY is not set")
	}

	http.HandleFunc("/api/chat", chatHandler)

	log.Println("Server started on :8081")

	log.Fatal(http.ListenAndServe(":8081", nil))
}