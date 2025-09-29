package main

import (
	"os"
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
)

type ChatRequest struct {
	Message string `json:"message"`
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

func chatHandler(w http.ResponseWriter, r *http.Request) {


    w.Header().Set("Access-Control-Allow-Origin", ALLOW_ORIGIN) // 本番ではフロントのURLに置き換える
    w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    // プリフライト OPTIONS リクエストには 200 を返す
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

	// OpenAI形式のリクエスト構造に変換
	hfReq := HFChatRequest{
		Model: HF_MODEL,
		Messages: []HFChatMessage{
			{
				Role:    "user",
				Content: req.Message,
			},
		},
	}

	jsonBody, err := json.Marshal(hfReq)
	if err != nil {
		http.Error(w, "Failed to marshal request", http.StatusInternalServerError)
		return
	}

	httpReq, err := http.NewRequest("POST", HF_API_URL, bytes.NewBuffer(jsonBody))
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}

	httpReq.Header.Set("Authorization", "Bearer "+HF_API_TOKEN)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		http.Error(w, "Failed to call Hugging Face API", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read response body", http.StatusInternalServerError)
		return
	}

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Hugging Face API error: "+string(body), resp.StatusCode)
		return
	}

	var hfResp HFChatCompletionResponse
	if err := json.Unmarshal(body, &hfResp); err != nil {
		http.Error(w, "Failed to parse Hugging Face response", http.StatusInternalServerError)
		return
	}

	reply := "Sorry, no response from model."
	if len(hfResp.Choices) > 0 {
		reply = hfResp.Choices[0].Message.Content
	}

	res := ChatResponse{
		Reply: reply,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func main() {
	http.HandleFunc("/api/chat", chatHandler)
	log.Println("Server started on :8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}
