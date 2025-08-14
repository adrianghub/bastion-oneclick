package main

import (
    "bytes"
    "encoding/json"
    "flag"
    "fmt"
    "io"
    "log"
    "net/http"
    "os"
    "strings"

    "github.com/google/uuid"
		"github.com/joho/godotenv"
)

func main() {
		godotenv.Load()

    // Parse command line flags
    claimToken := flag.String("claim-token", "", "Claim token for linking agent to user account")
    flag.Parse()

    const idFile = ".agent_id"
    baseURL := os.Getenv("BASTION_BACKEND_BASE_URL")
    if baseURL == "" {
        baseURL = "https://bastion-oneclick.vercel.app"
    }
    registerURL := strings.TrimRight(baseURL, "/") + "/api/agents/register"

    log.Println("Agent v0.3 is starting...")

    // Check for identity file
    idBytes, err := os.ReadFile(idFile)
    if err != nil {
        // First run: check for claim token
        if *claimToken == "" {
            log.Println("FATAL: This appears to be the first run of this agent.")
            log.Println("To link this agent to your account, you need a claim token.")
            log.Println("Steps:")
            log.Println("1. Log in to your Bastion dashboard")
            log.Println("2. Click 'Add New Agent' to generate a claim token")
            log.Printf("3. Run this agent with: %s --claim-token YOUR_TOKEN\n", os.Args[0])
            os.Exit(1)
        }

        // Generate and persist agent ID
        newID := uuid.New().String()
        if writeErr := os.WriteFile(idFile, []byte(newID), 0600); writeErr != nil {
            log.Fatalf("FATAL: could not write identity file: %v", writeErr)
        }
        log.Printf("First run. Generated agent id: %s", newID)

        // POST to registration endpoint with claim token
        payload := map[string]string{
            "uuid":        newID,
            "claim_token": *claimToken,
        }
        b, _ := json.Marshal(payload)
        req, _ := http.NewRequest(http.MethodPost, registerURL, bytes.NewReader(b))
        req.Header.Set("Content-Type", "application/json")

        resp, postErr := http.DefaultClient.Do(req)
        if postErr != nil {
            log.Fatalf("FATAL: registration failed: %v", postErr)
        }
        defer resp.Body.Close()

        if resp.StatusCode == http.StatusCreated {
            log.Println("SUCCESS: agent registered and linked to your account!")
        } else {
            // Read error response for better debugging
            bodyBytes, _ := io.ReadAll(resp.Body)
            log.Printf("FATAL: registration failed with status %s: %s", resp.Status, string(bodyBytes))
            // Clean up the identity file on registration failure
            os.Remove(idFile)
            os.Exit(1)
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