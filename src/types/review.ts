export interface OwnerRezReview {
  id: number;
  body: string;
  created_utc: string;
  date: string;
  display_name: string;
  listing_site: string;
  month_of_stay: number;
  property: {
    id: number;
    name: string;
  };
  property_id: number;
  response?: string;
  reviewer: string;
  stars: number;
  title: string;
  updated_utc: string;
  visible: boolean;
  year_of_stay: number;
}

export interface OwnerRezReviewsResponse {
  items: OwnerRezReview[];
  limit: number;
  offset: number;
}

export interface UnifiedReview {
  id: string | number;
  propertyName: string;
  propertyId: number;
  type: string;
  price: string;
  listingDate: string;
  rating: number;
  reviewCount: string;
  reviewerName: string;
  reviewDate: string;
  reviewText: string;
  reviewTitle: string;
  reviewerAvatar: string;
  response?: string;
  visible: boolean;
  monthOfStay: number;
  yearOfStay: number;
  listingSite: string;
  reviewer: string;
}

export interface ReviewsApiResponse {
  success: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  reviews: UnifiedReview[];
  userRole: string;
  canManageAllReviews: boolean;
  error?: string;
  details?: string;
}
