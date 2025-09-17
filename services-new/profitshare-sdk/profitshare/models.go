package profitshare

// Product represents a single product from the API response.
type Product struct {
	Link           string  `json:"link"`
	Name           string  `json:"name"`
	Image          string  `json:"image"`
	PriceVAT       float64 `json:"price_vat"`
	Price          float64 `json:"price"`
	AdvertiserID   int     `json:"advertiser_id"`
	AdvertiserName string  `json:"advertiser_name"`
	CategoryName   string  `json:"category_name"`
}

// ProductList holds the list of products and pagination details.
type ProductList struct {
	CurrentPage     int       `json:"current_page"`
	TotalPages      int       `json:"total_pages"`
	RecordsPerPage  int       `json:"records_per_page"`
	Products        []Product `json:"products"`
}

// ProductResponse is the top-level structure for the product listing response.
type ProductResponse struct {
	Result ProductList `json:"result"`
}

// ListProductsParams defines the available filters for the ListProducts method.
type ListProductsParams struct {
	Page        int
	Advertisers string // Comma-separated string of advertiser IDs, e.g., "45,41"
	PartNo      string // SKU
}
