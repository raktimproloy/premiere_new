# Review System API Documentation

## Overview
A comprehensive review system with public APIs for posting and viewing reviews, and superadmin APIs for management and moderation.

## Public APIs

### 1. Post Review
**Endpoint:** `POST /api/reviews/public`

**Description:** Allows anyone to post a review for a property.

**Request Body:**
```json
{
  "body": "Nice service & cleaning place",
  "display_name": "Raktim",
  "property_id": 459939,
  "stars": 3,
  "reviewer": "guest", // optional, defaults to "guest"
  "response": "Thank you" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully and is pending approval",
  "review_id": "ObjectId"
}
```

### 2. Get Reviews by Property
**Endpoint:** `GET /api/reviews/public?property_id=459939&limit=4&page=1`

**Description:** Get approved reviews for a specific property with statistics.

**Query Parameters:**
- `property_id` (required): Property ID
- `limit` (optional): Number of reviews per page (default: 4)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "body": "Nice service & cleaning place",
        "date": "2025-07-07T00:00:00Z",
        "display_name": "Raktim",
        "property": {
          "id": 459939,
          "name": "Design District Guesthouse - 2Bdrms"
        },
        "property_id": 459939,
        "response": "Thank you",
        "reviewer": "guest",
        "stars": 3.00,
        "status": "approved"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalReviews": 20,
      "limit": 4,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "statistics": {
      "averageRating": 4.6,
      "totalReviews": 20,
      "ratingDistribution": {
        "5": 45,
        "4": 140,
        "3": 30,
        "2": 10,
        "1": 5
      },
      "averageRatingText": "4.6 out of 5"
    }
  }
}
```

### 3. Get Review Statistics
**Endpoint:** `GET /api/reviews/public/statistics?property_id=459939`

**Description:** Get review statistics for a specific property.

**Response:**
```json
{
  "success": true,
  "data": {
    "property_id": 459939,
    "property_name": "Design District Guesthouse - 2Bdrms",
    "totalReviews": 20,
    "averageRating": 4.6,
    "averageRatingText": "4.6 out of 5",
    "ratingDistribution": {
      "5": 45,
      "4": 140,
      "3": 30,
      "2": 10,
      "1": 5
    },
    "hasReviews": true
  }
}
```

## Superadmin APIs

### 1. Get All Reviews
**Endpoint:** `GET /api/reviews/superadmin?page=1&limit=20&status=pending&property_id=459939&search=John&sortBy=created_at&sortOrder=desc`

**Description:** Get all reviews with filtering, searching, and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Reviews per page (default: 20, max: 100)
- `status` (optional): Filter by status (pending, approved, rejected, all)
- `property_id` (optional): Filter by property ID
- `search` (optional): Search in display_name, body, or property name
- `sortBy` (optional): Sort field (created_at, updated_at, stars, display_name, status)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "pagination": {...},
    "statistics": {
      "pending": 15,
      "approved": 120,
      "rejected": 5,
      "total": 140
    }
  }
}
```

### 2. Approve/Reject Reviews
**Endpoint:** `PUT /api/reviews/superadmin/approve`

**Description:** Approve or reject multiple reviews.

**Request Body:**
```json
{
  "reviewIds": ["ObjectId1", "ObjectId2"],
  "action": "approve", // or "reject"
  "reason": "Inappropriate content" // optional, for rejections
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 review(s) approved successfully",
  "modifiedCount": 2,
  "action": "approve"
}
```

### 3. Bulk Approve/Reject
**Endpoint:** `POST /api/reviews/superadmin/approve`

**Description:** Bulk approve/reject reviews based on filters.

**Request Body:**
```json
{
  "action": "approve",
  "filters": {
    "property_id": 459939,
    "date_from": "2025-01-01",
    "date_to": "2025-01-31",
    "stars": 4
  },
  "reason": "Bulk approval"
}
```

### 4. Get Single Review
**Endpoint:** `GET /api/reviews/superadmin/[id]`

**Description:** Get detailed information about a specific review.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "body": "Nice service & cleaning place",
    "date": "2025-07-07T00:00:00Z",
    "display_name": "Raktim",
    "property": {
      "id": 459939,
      "name": "Design District Guesthouse - 2Bdrms"
    },
    "property_id": 459939,
    "response": "Thank you",
    "reviewer": "guest",
    "stars": 3.00,
    "status": "pending",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "rejection_reason": null,
    "updated_by": "ObjectId"
  }
}
```

### 5. Update Review
**Endpoint:** `PUT /api/reviews/superadmin/[id]`

**Description:** Update any field of a review.

**Request Body:**
```json
{
  "body": "Updated review text",
  "display_name": "Updated Name",
  "stars": 4,
  "status": "approved",
  "response": "Updated response",
  "rejection_reason": "Reason for rejection"
}
```

### 6. Delete Review
**Endpoint:** `DELETE /api/reviews/superadmin/[id]`

**Description:** Delete a specific review.

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

### 7. Bulk Delete Reviews
**Endpoint:** `DELETE /api/reviews/superadmin`

**Description:** Delete multiple reviews.

**Request Body:**
```json
{
  "reviewIds": ["ObjectId1", "ObjectId2", "ObjectId3"]
}
```

### 8. Review Statistics
**Endpoint:** `GET /api/reviews/superadmin/statistics?property_id=459939&date_from=2025-01-01&date_to=2025-01-31`

**Description:** Get comprehensive review statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalReviews": 140,
      "averageRating": 4.6,
      "averageRatingText": "4.6 out of 5",
      "statusCounts": {
        "pending": 15,
        "approved": 120,
        "rejected": 5
      },
      "ratingDistribution": {
        "5": 45,
        "4": 140,
        "3": 30,
        "2": 10,
        "1": 5
      }
    },
    "statusBreakdown": {...},
    "ratingDistribution": {...},
    "propertyStats": [...],
    "monthlyTrends": [...],
    "recentReviews": [...]
  }
}
```

### 9. Review Dashboard
**Endpoint:** `GET /api/reviews/superadmin/dashboard`

**Description:** Get dashboard data for review management.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalReviews": 140,
      "averageRating": 4.6,
      "pendingReviews": 15,
      "approvedReviews": 120,
      "rejectedReviews": 5
    },
    "recent": {
      "last30Days": {
        "reviews": 25,
        "averageRating": 4.5,
        "pending": 8,
        "approved": 15,
        "rejected": 2
      },
      "last7Days": {
        "reviews": 5,
        "averageRating": 4.8
      }
    },
    "ratingDistribution": {...},
    "topProperties": [...],
    "monthlyTrends": [...],
    "pendingReviews": [...],
    "summary": {
      "approvalRate": 85,
      "averageRatingText": "4.6 out of 5",
      "needsAttention": 15
    }
  }
}
```

## Review Data Structure

```json
{
  "body": "Nice service & cleaning place",
  "date": "2025-07-07T00:00:00Z",
  "display_name": "Raktim",
  "property": {
    "id": 459939,
    "name": "Design District Guesthouse - 2Bdrms"
  },
  "property_id": 459939,
  "response": "Thank you",
  "reviewer": "guest",
  "stars": 3.00,
  "status": "pending"
}
```

## Status Values
- `pending`: New review awaiting approval
- `approved`: Review approved and visible to public
- `rejected`: Review rejected and not visible to public

## Reviewer Types
- `guest`: Regular guest review
- `owner`: Property owner review
- `admin`: Admin review

## Authentication
- Public APIs: No authentication required
- Superadmin APIs: Requires valid authToken cookie with superadmin role

## Error Handling
All APIs return consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Rate Limiting
- Public APIs: No rate limiting implemented
- Superadmin APIs: No rate limiting implemented

## Database Collections
- `reviews`: Main collection storing all review data
- Indexes recommended on: `property_id`, `status`, `created_at`, `stars`
