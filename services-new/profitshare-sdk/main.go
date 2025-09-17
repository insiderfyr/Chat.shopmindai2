package main

import (
	"fmt"
	"log"

	"profitshare-sdk/profitshare"
)

// --- IMPORTANT ---
// Replace with your actual credentials provided in the documentation.
const (
	APIUser = "burca_denis_68c9b156822ca"
	APIKey  = "fd6f6fe5b514f390d1f73d20c0fd1f3d15641139"
)

func main() {
	// 1. Initialize the client with your credentials.
	// The complexity of authentication is handled automatically.
	client := profitshare.NewClient(APIUser, APIKey)

	fmt.Println("Fetching products from ProfitShare API for advertiser '35' (eMAG.ro)...")

	// 2. Define parameters for the API call.
	// We want the first page of products from advertiser with ID 35.
	params := profitshare.ListProductsParams{
		Page:        1,
		Advertisers: "35",
	}

	// 3. Call the SDK method. It's a simple, clean function call.
	productResponse, err := client.ListProducts(params)
	if err != nil {
		log.Fatalf("Error fetching products: %v", err)
	}

	// 4. Process and display the results.
	fmt.Printf("--- Page %d of %d ---\n", productResponse.Result.CurrentPage, productResponse.Result.TotalPages)
	fmt.Printf("Found %d products:\n", len(productResponse.Result.Products))
	fmt.Println("---------------------------------")

	if len(productResponse.Result.Products) == 0 {
		fmt.Println("No products found for the specified advertiser.")
		return
	}

	for _, product := range productResponse.Result.Products {
		fmt.Printf("Name: %s\n", product.Name)
		fmt.Printf("Advertiser: %s\n", product.AdvertiserName)
		fmt.Printf("Price (VAT): %.2f\n", product.PriceVAT)
		fmt.Printf("Link: %s\n", product.Link)
		fmt.Println("---")
	}
}
