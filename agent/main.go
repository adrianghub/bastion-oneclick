package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "strings"

    "github.com/google/uuid"
)

func main() {
    const idFile = ".agent_id"
    baseURL := os.Getenv("BASTION_BACKEND_BASE_URL")
    if baseURL == "" {
        baseURL = "https://bastion-oneclick.vercel.app"
    }
    registerURL := strings.TrimRight(baseURL, "/") + "/api/agents/register"

    log.Println("Agent v0.2 is starting...")

    // Check for identity file
    idBytes, err := os.ReadFile(idFile)
    if err != nil {
        // First run: generate and persist
        newID := uuid.New().String()
        if writeErr := os.WriteFile(idFile, []byte(newID), 0600); writeErr != nil {
            log.Fatalf("FATAL: could not write identity file: %v", writeErr)
        }
        log.Printf("First run. Generated agent id: %s", newID)

        // POST to registration endpoint
        payload := map[string]string{"uuid": newID}
        b, _ := json.Marshal(payload)
        req, _ := http.NewRequest(http.MethodPost, registerURL, bytes.NewReader(b))
        req.Header.Set("Content-Type", "application/json")

        resp, postErr := http.DefaultClient.Do(req)
        if postErr != nil {
            log.Fatalf("FATAL: registration failed: %v", postErr)
        }
        defer resp.Body.Close()
        if resp.StatusCode == http.StatusCreated {
            log.Println("SUCCESS: agent registered with backend")
        } else {
            log.Printf("WARN: registration returned status: %s", resp.Status)
        }
        return
    }

    // Subsequent runs
    savedID := strings.TrimSpace(string(idBytes))
    if _, parseErr := uuid.Parse(savedID); parseErr != nil {
        log.Fatalf("FATAL: invalid uuid in identity file: %v", parseErr)
    }
    fmt.Printf("Agent already initialized with id: %s\n", savedID)
}